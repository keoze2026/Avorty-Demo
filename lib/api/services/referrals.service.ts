/**
 * Referrals service — /api/referrals/*.
 *
 * Backed by the Referral Program backend confirmed by the backend dev:
 *
 *   GET  /api/referrals/                          program details
 *   GET  /api/referrals/stats                     summary stats
 *   GET  /api/referrals/referred-clients          list of referred clients
 *   GET  /api/referrals/spending-tracker?days=N   time series (N ∈ {14,30,90})
 *   POST /api/referrals/invite                    { email, name }
 *
 * All endpoints require `Authorization: Bearer <token>` (handled by http layer).
 *
 * Wire shapes are kept tolerant — backends sometimes return slightly different
 * key names (camelCase / snake_case after the http layer's auto-conversion,
 * `lifetime_spend` vs `total_spend`, etc.). The mappers below try several
 * names so a small backend rename doesn't blank out the UI.
 */

import { http } from "@/lib/api/http";

/* ─── Frontend-shaped types ───────────────────────────────────────────── */

export interface ReferralProgram {
  /** Short partner code, e.g. "AVRTX-K8F9" */
  code: string;
  /** Shareable URL the partner copies to clipboard. */
  link: string;
  /** Commission rate as a fraction (0..1). e.g. 0.05 for 5%. */
  commissionRate: number;
  /** Lifetime earnings in USD. */
  lifetimeEarnings: number;
  /** This-month earnings in USD. */
  thisMonthEarnings: number;
}

export interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  /** 0..1 fraction. */
  commissionRate: number;
  /** This-month earnings in USD. */
  thisMonthEarnings: number;
}

export type ReferredClientStatus = "active" | "churned";

export interface ReferredClient {
  id: string;
  name: string;
  vertical: string;
  /** ms epoch when the client joined via this partner. */
  joinedAt: number;
  /** "active" / "churned". Any other value is normalized to "active". */
  status: ReferredClientStatus;
  /** Spend in the trailing 30 days (USD). */
  monthSpend: number;
  /** Total spend on the platform since joining (USD). */
  lifetimeSpend: number;
  /** Partner's commission earned from this client to date (USD). */
  commission: number;
}

export interface SpendPoint {
  /** ms epoch for the bucket. */
  ts: number;
  /** Day spend (USD). */
  spend: number;
  /** Partner commission for that day (USD). */
  commission: number;
}

export type SpendingTrackerDays = 14 | 30 | 90;

/* ─── Wire shapes ────────────────────────────────────────────────────── */

interface ProgramWire {
  code?: string;
  link?: string;
  /** Either fraction (0..1) or percent — we detect below. */
  commissionRate?: number;
  lifetimeEarnings?: string | number;
  thisMonthEarnings?: string | number;
  /** Tolerated alternative naming. */
  monthEarnings?: string | number;
}

interface StatsWire {
  totalReferrals?: number;
  activeReferrals?: number;
  commissionRate?: number;
  thisMonthEarnings?: string | number;
  monthEarnings?: string | number;
}

interface ReferredClientWire {
  id: string;
  name?: string;
  clientName?: string;
  vertical?: string;
  joinedAt?: string | number;
  createdAt?: string | number;
  status?: string;
  monthSpend?: string | number;
  lifetimeSpend?: string | number;
  totalSpend?: string | number;
  commission?: string | number;
}

interface SpendingTrackerWire {
  buckets?: SpendBucketWire[];
  series?: SpendBucketWire[];
  data?: SpendBucketWire[];
}

interface SpendBucketWire {
  ts?: string | number;
  date?: string | number;
  day?: string | number;
  spend?: string | number;
  commission?: string | number;
  earned?: string | number;
}

/* ─── Helpers ─────────────────────────────────────────────────────────── */

function toNum(v: string | number | undefined | null, fallback = 0): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : fallback;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

function toTs(v: string | number | undefined | null): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const t = Date.parse(v);
    return Number.isFinite(t) ? t : Date.now();
  }
  return Date.now();
}

/** Backend may send 5 (percent) or 0.05 (fraction). Normalize to 0..1. */
function toRate(v: number | undefined): number {
  if (typeof v !== "number" || !Number.isFinite(v)) return 0;
  return v > 1 ? v / 100 : v;
}

function normalizeClientStatus(raw: string | undefined): ReferredClientStatus {
  return (raw ?? "").toLowerCase() === "churned" ? "churned" : "active";
}

/* ─── Mappers ─────────────────────────────────────────────────────────── */

function wireToProgram(w: ProgramWire): ReferralProgram {
  return {
    code: w.code ?? "",
    link: w.link ?? "",
    commissionRate: toRate(w.commissionRate),
    lifetimeEarnings: toNum(w.lifetimeEarnings),
    thisMonthEarnings: toNum(w.thisMonthEarnings ?? w.monthEarnings),
  };
}

function wireToStats(w: StatsWire): ReferralStats {
  return {
    totalReferrals: w.totalReferrals ?? 0,
    activeReferrals: w.activeReferrals ?? 0,
    commissionRate: toRate(w.commissionRate),
    thisMonthEarnings: toNum(w.thisMonthEarnings ?? w.monthEarnings),
  };
}

function wireToClient(w: ReferredClientWire): ReferredClient {
  return {
    id: w.id,
    name: w.name ?? w.clientName ?? "—",
    vertical: w.vertical ?? "—",
    joinedAt: toTs(w.joinedAt ?? w.createdAt),
    status: normalizeClientStatus(w.status),
    monthSpend: toNum(w.monthSpend),
    lifetimeSpend: toNum(w.lifetimeSpend ?? w.totalSpend),
    commission: toNum(w.commission),
  };
}

function wireToSpendPoint(w: SpendBucketWire): SpendPoint {
  return {
    ts: toTs(w.ts ?? w.date ?? w.day),
    spend: toNum(w.spend),
    commission: toNum(w.commission ?? w.earned),
  };
}

function extractSpendBuckets(
  wire: SpendingTrackerWire | SpendBucketWire[],
): SpendBucketWire[] {
  if (Array.isArray(wire)) return wire;
  if (Array.isArray(wire.buckets)) return wire.buckets;
  if (Array.isArray(wire.series)) return wire.series;
  if (Array.isArray(wire.data)) return wire.data;
  return [];
}

/* ─── Service ─────────────────────────────────────────────────────────── */

export const referralsService = {
  /** GET /api/referrals/ — program details (code, link, rate, earnings). */
  async getProgram(): Promise<ReferralProgram> {
    return wireToProgram(await http.get<ProgramWire>("/api/referrals/"));
  },

  /** GET /api/referrals/stats — summary counters + this-month earnings. */
  async getStats(): Promise<ReferralStats> {
    return wireToStats(await http.get<StatsWire>("/api/referrals/stats"));
  },

  /** GET /api/referrals/referred-clients — list of all clients brought in. */
  async getReferredClients(): Promise<ReferredClient[]> {
    const wire = await http.get<ReferredClientWire[] | { items?: ReferredClientWire[] }>(
      "/api/referrals/referred-clients",
    );
    const items = Array.isArray(wire) ? wire : (wire.items ?? []);
    return items.map(wireToClient);
  },

  /** GET /api/referrals/spending-tracker?days=N — daily spend series. */
  async getSpendingTracker(days: SpendingTrackerDays): Promise<SpendPoint[]> {
    const wire = await http.get<SpendingTrackerWire | SpendBucketWire[]>(
      "/api/referrals/spending-tracker",
      { query: { days } },
    );
    return extractSpendBuckets(wire).map(wireToSpendPoint);
  },

  /** POST /api/referrals/invite — send invite email. */
  async sendInvite(input: { email: string; name: string }): Promise<void> {
    await http.post("/api/referrals/invite", { body: input });
  },
};
