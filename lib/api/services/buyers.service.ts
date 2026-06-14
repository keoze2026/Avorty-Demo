/**
 * Buyers service — talks to /api/buyers/*.
 *
 * Returns frontend-shaped `Buyer` objects so the store can drop them
 * straight into state without further translation. Stats fields the list
 * endpoint doesn't return default to 0 — Phase 2 will hydrate them from
 * the per-buyer /stats endpoint when the user opens a buyer detail page.
 */

import { http } from "@/lib/api/http";
import type { Paginated } from "@/lib/api/types";
import type { Buyer, BuyerStatus } from "@/lib/types";

/* ─── Wire shapes (post case-adapter) ─────────────────────────────────── */

interface BuyerListWire {
  id: string;
  name: string;
  status: string;
  routingType: string;
  phoneNumber: string;
  payoutAmount: string;
  createdAt: string;
}

interface BuyerWire extends BuyerListWire {
  description?: string;
  sipEndpoint?: string;
  minCallDuration?: number;
  maxConcurrency?: number;
  dupWindowDays?: number;
  qualityScore?: number;
  organizationId?: string;
  createdById?: string | null;
  cap?: {
    daily?: number;
    monthly?: number;
    concurrency?: number;
  } | null;
  campaigns?: Array<{ campaignId: string; campaignName?: string }>;
}

interface BuyerStatsWire {
  callsToday?: number;
  callsMonth?: number;
  spendToday?: number;
  spendMonth?: number;
  lifetimeSpend?: number;
  acceptRate?: number;
  conversionRate?: number;
}

/* ─── Mappers ─────────────────────────────────────────────────────────── */

function normalizeStatus(raw: string | null | undefined): BuyerStatus {
  const s = (raw ?? "").toLowerCase();
  if (s === "paused" || s === "capped" || s === "pending") return s;
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

function listWireToBuyer(w: BuyerListWire): Buyer {
  return {
    id: w.id,
    name: w.name,
    organization: "",
    status: normalizeStatus(w.status),
    bidAmount: toNum(w.payoutAmount),
    payoutModel: "flat",
    concurrencyCap: 0,
    dailyCap: 0,
    monthlyCap: 0,
    callsToday: 0,
    callsMonth: 0,
    spendToday: 0,
    spendMonth: 0,
    lifetimeSpend: 0,
    acceptRate: 0,
    conversionRate: 0,
    campaignIds: [],
    createdAt: Date.parse(w.createdAt) || Date.now(),
  };
}

function detailWireToBuyer(w: BuyerWire): Buyer {
  return {
    ...listWireToBuyer(w),
    description: w.description,
    organization: w.organizationId ?? "",
    concurrencyCap: w.cap?.concurrency ?? w.maxConcurrency ?? 0,
    dailyCap: w.cap?.daily ?? 0,
    monthlyCap: w.cap?.monthly ?? 0,
    campaignIds: (w.campaigns ?? []).map((c) => c.campaignId),
  };
}

/* ─── Public service ──────────────────────────────────────────────────── */

export const buyersService = {
  async list(query: { page?: number; pageSize?: number } = {}): Promise<Paginated<Buyer>> {
    const res = await http.get<Paginated<BuyerListWire>>("/api/buyers/", { query });
    return {
      ...res,
      items: res.items.map(listWireToBuyer),
    };
  },

  async get(id: string): Promise<Buyer> {
    const wire = await http.get<BuyerWire>(`/api/buyers/${id}`);
    return detailWireToBuyer(wire);
  },

  async create(input: Omit<Buyer, "id" | "createdAt">): Promise<Buyer> {
    const wire = await http.post<BuyerWire>("/api/buyers/", {
      body: {
        name: input.name,
        description: input.description,
        // Default routing type — most deployments use "standard" or "direct".
        // The backend can ignore unknown keys; this is a sensible default.
        routingType: "standard",
        payoutAmount: String(input.bidAmount ?? 0),
        maxConcurrency: input.concurrencyCap || undefined,
      },
    });
    return detailWireToBuyer(wire);
  },

  async update(id: string, patch: Partial<Buyer>): Promise<Buyer> {
    const body: Record<string, unknown> = {};
    if (patch.name !== undefined) body.name = patch.name;
    if (patch.description !== undefined) body.description = patch.description;
    if (patch.bidAmount !== undefined) body.payoutAmount = String(patch.bidAmount);
    const wire = await http.patch<BuyerWire>(`/api/buyers/${id}`, { body });
    return detailWireToBuyer(wire);
  },

  async remove(id: string): Promise<void> {
    await http.delete(`/api/buyers/${id}`);
  },

  async setStatus(id: string, status: BuyerStatus): Promise<void> {
    // Backend exposes activate/pause as POST endpoints; everything else
    // routes through update.
    if (status === "active") {
      await http.post(`/api/buyers/${id}/activate`);
      return;
    }
    if (status === "paused") {
      await http.post(`/api/buyers/${id}/pause`);
      return;
    }
    // "capped" / "pending" don't have dedicated endpoints — fall through to
    // a status patch so the server can persist the requested state.
    await http.patch(`/api/buyers/${id}`, { body: { status } });
  },

  async updateCap(
    id: string,
    cap: { daily?: number; monthly?: number; concurrency?: number },
  ): Promise<void> {
    await http.patch(`/api/buyers/${id}/cap`, { body: cap });
  },

  async getStats(id: string): Promise<BuyerStatsWire> {
    return http.get<BuyerStatsWire>(`/api/buyers/${id}/stats`);
  },

  async assignCampaign(id: string, campaignId: string): Promise<void> {
    await http.post(`/api/buyers/${id}/campaigns`, { body: { campaignId } });
  },

  async removeCampaign(id: string, campaignId: string): Promise<void> {
    await http.delete(`/api/buyers/${id}/campaigns/${campaignId}`);
  },
};
