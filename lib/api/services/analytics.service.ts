/**
 * Analytics service — talks to /api/analytics/*.
 *
 * Wraps the dashboard KPI block, time-series, paginated Call Log, per-entity
 * performance views, live snapshot, caller profile, and CSV export.
 *
 * Note: the Call Log endpoint uses offset/limit pagination (not page/page_size
 * like the rest of the API). This service hides that quirk behind a uniform
 * `{ page, pageSize }` input.
 */

import { http } from "@/lib/api/http";
import type { Call, CallStatus } from "@/lib/types";

/* ─── Wire shapes (post case-adapter) ─────────────────────────────────── */

interface DashboardWire {
  totalCalls: number;
  callsToday: number;
  liveCalls: number;
  completedCalls: number;
  convertedCalls: number;
  conversionRate: number;
  totalRevenue: string;
  totalPayout: string;
  totalProfit: string;
  avgCallDuration: number;
  spamBlocked: number;
  duplicateBlocked: number;
}

interface TimeSeriesPointWire {
  period: string;
  calls: number;
  converted: number;
  revenue: string;
  payout: string;
  profit: string;
  avgDuration: number;
}

interface CallRecordWire {
  id: string;
  callerNumber: string;
  calledNumber?: string;
  destinationNumber: string;
  status: string;
  duration: number;
  callerAreaCode?: string;
  callerState?: string;
  callerCountry?: string;
  campaignId?: string | null;
  campaignName?: string | null;
  buyerId?: string | null;
  buyerName?: string | null;
  publisherId?: string | null;
  publisherName?: string | null;
  revenue: string;
  buyerPayout: string;
  publisherPayout?: string;
  recordingUrl?: string;
  createdAt: string;
  updatedAt?: string;
  tags?: unknown[];
  notes?: string;
}

interface CallLogListWire {
  total: number;
  offset: number;
  limit: number;
  items: CallRecordWire[];
}

/* ─── Frontend shapes ─────────────────────────────────────────────────── */

export interface DashboardKpis {
  totalCalls: number;
  callsToday: number;
  liveCalls: number;
  completedCalls: number;
  convertedCalls: number;
  conversionRate: number;
  totalRevenue: number;
  totalPayout: number;
  totalProfit: number;
  avgCallDurationSec: number;
  spamBlocked: number;
  duplicateBlocked: number;
}

export interface TimeSeriesPoint {
  period: string;
  calls: number;
  converted: number;
  revenue: number;
  payout: number;
  profit: number;
  avgDurationSec: number;
}

export interface CallLogPage {
  total: number;
  page: number;
  pageSize: number;
  items: Call[];
}

export interface CallLogQuery {
  page?: number;
  pageSize?: number;
  dateFrom?: string;
  dateTo?: string;
  status?: CallStatus;
  campaignId?: string;
  buyerId?: string;
  publisherId?: string;
}

export type Granularity = "hour" | "day" | "week" | "month";

/* ─── Helpers ─────────────────────────────────────────────────────────── */

function toNum(s: string | number | undefined, fallback = 0): number {
  if (typeof s === "number") return s;
  if (typeof s === "string") {
    const n = Number(s);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

function toTs(s: string | number | undefined): number {
  if (typeof s === "number") return s;
  if (typeof s === "string") {
    const t = Date.parse(s);
    return Number.isFinite(t) ? t : Date.now();
  }
  return Date.now();
}

function normalizeStatus(raw: string): CallStatus {
  const s = raw.toLowerCase().replace(/_/g, "-");
  if (s === "ringing" || s === "in-progress" || s === "completed" ||
      s === "missed" || s === "rejected" || s === "failed") return s;
  if (s === "queued") return "ringing";
  if (s === "connected") return "in-progress";
  if (s === "ended") return "completed";
  if (s === "spam-blocked" || s === "blocked") return "rejected";
  return "completed";
}

function callRecordToCall(w: CallRecordWire): Call {
  return {
    id: w.id,
    campaignId: w.campaignId ?? "",
    campaignName: w.campaignName ?? "—",
    buyerId: w.buyerId ?? undefined,
    buyerName: w.buyerName ?? undefined,
    publisherId: w.publisherId ?? undefined,
    publisherName: w.publisherName ?? undefined,
    callerNumber: w.callerNumber,
    destinationNumber: w.destinationNumber,
    startedAt: toTs(w.createdAt),
    durationSec: w.duration ?? 0,
    status: normalizeStatus(w.status),
    payout: toNum(w.buyerPayout),
    revenue: toNum(w.revenue),
    geo: {
      country: w.callerCountry ?? "",
      state: w.callerState ?? undefined,
    },
    recordingUrl: w.recordingUrl || undefined,
  };
}

function dashboardWireToKpis(w: DashboardWire): DashboardKpis {
  return {
    totalCalls: w.totalCalls,
    callsToday: w.callsToday,
    liveCalls: w.liveCalls,
    completedCalls: w.completedCalls,
    convertedCalls: w.convertedCalls,
    conversionRate: w.conversionRate,
    totalRevenue: toNum(w.totalRevenue),
    totalPayout: toNum(w.totalPayout),
    totalProfit: toNum(w.totalProfit),
    avgCallDurationSec: w.avgCallDuration,
    spamBlocked: w.spamBlocked,
    duplicateBlocked: w.duplicateBlocked,
  };
}

function timeSeriesPointToPoint(w: TimeSeriesPointWire): TimeSeriesPoint {
  return {
    period: w.period,
    calls: w.calls,
    converted: w.converted,
    revenue: toNum(w.revenue),
    payout: toNum(w.payout),
    profit: toNum(w.profit),
    avgDurationSec: w.avgDuration,
  };
}

/* ─── Public service ──────────────────────────────────────────────────── */

export const analyticsService = {
  async dashboard(): Promise<DashboardKpis> {
    const wire = await http.get<DashboardWire>("/api/analytics/dashboard");
    return dashboardWireToKpis(wire);
  },

  async timeSeries(query: {
    dateFrom?: string;
    dateTo?: string;
    granularity?: Granularity;
  } = {}): Promise<TimeSeriesPoint[]> {
    const wire = await http.get<TimeSeriesPointWire[]>("/api/analytics/time-series", {
      query: {
        dateFrom: query.dateFrom,
        dateTo: query.dateTo,
        granularity: query.granularity,
      },
    });
    return wire.map(timeSeriesPointToPoint);
  },

  /**
   * Paginated call log. Translates page/pageSize → offset/limit on the wire.
   */
  async calls(query: CallLogQuery = {}): Promise<CallLogPage> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 50;
    const offset = (page - 1) * pageSize;
    const wire = await http.get<CallLogListWire>("/api/analytics/calls", {
      query: {
        offset,
        limit: pageSize,
        dateFrom: query.dateFrom,
        dateTo: query.dateTo,
        status: query.status,
        campaignId: query.campaignId,
        buyerId: query.buyerId,
        publisherId: query.publisherId,
      },
    });
    return {
      total: wire.total,
      page,
      pageSize,
      items: wire.items.map(callRecordToCall),
    };
  },

  /** Live snapshot — used by Live Monitor as the initial state before the
   *  WebSocket takes over. Returns whatever calls are currently in-flight. */
  async live(): Promise<Call[]> {
    const wire = await http.get<CallRecordWire[]>("/api/analytics/live");
    return wire.map(callRecordToCall);
  },

  async campaigns(): Promise<unknown> {
    return http.get("/api/analytics/campaigns");
  },

  async buyers(): Promise<unknown> {
    return http.get("/api/analytics/buyers");
  },

  async publishers(): Promise<unknown> {
    return http.get("/api/analytics/publishers");
  },

  async callerProfile(callerNumber: string): Promise<unknown> {
    return http.get(`/api/analytics/caller-profile/${encodeURIComponent(callerNumber)}`);
  },

  async recordingUrl(callId: string): Promise<{ url: string } | { recordingUrl: string }> {
    return http.get<{ url: string } | { recordingUrl: string }>(
      `/api/analytics/calls/${callId}/recording`,
    );
  },

  /** Build a CSV export URL that can be opened directly (auth header still applies). */
  async exportCallsCsv(query: Omit<CallLogQuery, "page" | "pageSize">): Promise<Blob> {
    // The backend streams CSV; use the raw http wrapper but with rawResponse.
    const res = await http.get<string>("/api/analytics/calls/export", {
      query: {
        dateFrom: query.dateFrom,
        dateTo: query.dateTo,
        status: query.status,
        campaignId: query.campaignId,
        buyerId: query.buyerId,
        publisherId: query.publisherId,
      },
      rawResponse: true,
    });
    return new Blob([typeof res === "string" ? res : JSON.stringify(res)], { type: "text/csv" });
  },
};

/* ─── Shared types re-exported for socket / call detail ──────────────── */

export type { CallRecordWire };
export { callRecordToCall, normalizeStatus, toNum, toTs };
