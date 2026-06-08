/**
 * Campaigns service — talks to /api/campaigns/*.
 *
 * Mirrors the buyers service pattern: returns frontend-shaped `Campaign`
 * objects so the store can drop them straight into state. Stats fields
 * default to 0 until Phase 2 hydrates them from /campaigns/{id}/stats.
 */

import { http } from "@/lib/api/http";
import type { Paginated } from "@/lib/api/types";
import type { Campaign, CampaignStatus, PayoutModel } from "@/lib/types";

/* ─── Wire shapes ─────────────────────────────────────────────────────── */

interface CampaignListWire {
  id: string;
  name: string;
  status: string;
  routingType: string;
  payoutAmount: string;
  revenueAmount: string;
  createdAt: string;
}

interface CampaignWire extends CampaignListWire {
  description?: string;
  minCallDuration?: number;
  duplicateCallBlock?: boolean;
  duplicateCallBlockHours?: number;
  bidFloor?: string;
  rtbTimeoutSeconds?: number;
  organizationId?: string;
  createdById?: string | null;
  vertical?: string;
}

/* ─── Mappers ─────────────────────────────────────────────────────────── */

function normalizeStatus(raw: string): CampaignStatus {
  const s = raw.toLowerCase();
  if (s === "paused" || s === "draft" || s === "archived") return s;
  return "active";
}

function toNum(s: string | number | undefined, fallback = 0): number {
  if (typeof s === "number") return s;
  if (typeof s === "string") {
    const n = Number(s);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

function defaultSchedule(): Campaign["schedule"] {
  return { days: [0, 1, 2, 3, 4, 5, 6], startHour: 0, endHour: 24, timezone: "auto" };
}

function payoutModelFromRouting(routingType?: string): PayoutModel {
  if (routingType === "per-minute" || routingType === "per_minute") return "per-minute";
  if (routingType === "per-qualified" || routingType === "per_qualified") return "per-qualified";
  return "per-call";
}

function listWireToCampaign(w: CampaignListWire): Campaign {
  return {
    id: w.id,
    name: w.name,
    vertical: "Other",
    status: normalizeStatus(w.status),
    payout: toNum(w.payoutAmount),
    payoutModel: payoutModelFromRouting(w.routingType),
    qualifyDurationSec: 0,
    dailyCap: 0,
    monthlyCap: 0,
    schedule: defaultSchedule(),
    numbersCount: 0,
    buyersCount: 0,
    publishersCount: 0,
    callsToday: 0,
    revenueToday: 0,
    conversionRate: 0,
    createdAt: Date.parse(w.createdAt) || Date.now(),
  };
}

function detailWireToCampaign(w: CampaignWire): Campaign {
  return {
    ...listWireToCampaign(w),
    description: w.description,
    vertical: w.vertical ?? "Other",
    qualifyDurationSec: w.minCallDuration ?? 0,
  };
}

/* ─── Public service ──────────────────────────────────────────────────── */

export const campaignsService = {
  async list(query: { page?: number; pageSize?: number } = {}): Promise<Paginated<Campaign>> {
    const res = await http.get<Paginated<CampaignListWire>>("/api/campaigns/", { query });
    return { ...res, items: res.items.map(listWireToCampaign) };
  },

  async get(id: string): Promise<Campaign> {
    const wire = await http.get<CampaignWire>(`/api/campaigns/${id}`);
    return detailWireToCampaign(wire);
  },

  async create(input: Omit<Campaign, "id" | "createdAt">): Promise<Campaign> {
    const wire = await http.post<CampaignWire>("/api/campaigns/", {
      body: {
        name: input.name,
        description: input.description,
        routingType: "standard",
        payoutAmount: String(input.payout ?? 0),
        minCallDuration: input.qualifyDurationSec || 0,
      },
    });
    return detailWireToCampaign(wire);
  },

  async update(id: string, patch: Partial<Campaign>): Promise<Campaign> {
    const body: Record<string, unknown> = {};
    if (patch.name !== undefined) body.name = patch.name;
    if (patch.description !== undefined) body.description = patch.description;
    if (patch.payout !== undefined) body.payoutAmount = String(patch.payout);
    if (patch.qualifyDurationSec !== undefined) body.minCallDuration = patch.qualifyDurationSec;
    const wire = await http.patch<CampaignWire>(`/api/campaigns/${id}`, { body });
    return detailWireToCampaign(wire);
  },

  async remove(id: string): Promise<void> {
    await http.delete(`/api/campaigns/${id}`);
  },

  async setStatus(id: string, status: CampaignStatus): Promise<void> {
    if (status === "active") {
      await http.post(`/api/campaigns/${id}/activate`);
      return;
    }
    if (status === "paused") {
      await http.post(`/api/campaigns/${id}/pause`);
      return;
    }
    await http.patch(`/api/campaigns/${id}`, { body: { status } });
  },

  async updateCap(id: string, cap: { daily?: number; monthly?: number }): Promise<void> {
    await http.patch(`/api/campaigns/${id}/cap`, { body: cap });
  },

  async updateSchedules(id: string, schedules: Campaign["schedule"][]): Promise<void> {
    await http.put(`/api/campaigns/${id}/schedules`, { body: { schedules } });
  },
};
