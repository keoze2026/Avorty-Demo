/**
 * Destinations service — /api/destinations/*.
 *
 * Endpoints (confirmed by backend dev, June 2026):
 *   GET    /api/destinations/?page=&page_size=&status=&buyer_id=&search=
 *   GET    /api/destinations/stats/   → header roll-ups across the org
 *   GET    /api/destinations/{id}/
 *   POST   /api/destinations/
 *   PATCH  /api/destinations/{id}/    (also toggles enabled via { enabled })
 *   DELETE /api/destinations/{id}/
 *
 * A Destination is a buyer-owned dial target with name, TFN/SIP URI, caps,
 * filters, business hours, and live usage counters. The wire shape mirrors
 * the frontend `Destination` type via the case-adapter; usage counters and
 * `buyer_name` are read-only echoes.
 */

import { http } from "@/lib/api/http";
import type { Paginated } from "@/lib/api/types";
import type {
  BusinessHourSlot,
  Destination,
  DestinationForwardType,
  FilterGroup,
} from "@/lib/types";

/* ─── Frontend shapes (in addition to the canonical Destination type) ─── */

export interface DestinationStats {
  activeLive: number;
  totalLive: number;
  totalCC: number;
  activeTfns: number;
  vacantCC: number;
}

export interface DestinationListQuery {
  page?: number;
  pageSize?: number;
  status?: "all" | "enabled" | "disabled";
  buyerId?: string;
  search?: string;
}

/* ─── Wire shapes ─────────────────────────────────────────────────────── */

interface DestinationWire {
  id: string;
  buyerId: string;
  buyerName?: string;
  tfn: string;
  name: string;
  forwardType?: string;
  concurrencyCap: number;
  hourlyCap?: number;
  dailyCap: number;
  monthlyCap: number;
  globalCap?: number;
  enabled: boolean;
  ringDurationSec?: number;
  timezone?: string | null;
  liveCalls?: number;
  hourlyCalls?: number;
  dailyCalls?: number;
  monthlyCalls?: number;
  globalCalls?: number;
  filterEnabled?: boolean;
  filterGroups?: FilterGroup[];
  businessHoursEnabled?: boolean;
  businessHourSlots?: BusinessHourSlot[];
  createdAt?: string;
  updatedAt?: string;
}

interface DestinationStatsWire {
  activeLive: number;
  totalLive: number;
  totalCc: number;
  activeTfns: number;
  vacantCc: number;
}

/* ─── Mappers ─────────────────────────────────────────────────────────── */

function normalizeForwardType(raw: string | null | undefined): DestinationForwardType {
  return (raw ?? "").toLowerCase() === "sip" ? "sip" : "number";
}

function wireToDestination(w: DestinationWire): Destination {
  return {
    id: w.id,
    buyerId: w.buyerId,
    tfn: w.tfn,
    name: w.name,
    forwardType: normalizeForwardType(w.forwardType),
    concurrencyCap: w.concurrencyCap ?? 0,
    dailyCap: w.dailyCap ?? 0,
    monthlyCap: w.monthlyCap ?? 0,
    enabled: !!w.enabled,
    ringDurationSec: w.ringDurationSec ?? 25,
    filterEnabled: !!w.filterEnabled,
    filterGroups: Array.isArray(w.filterGroups) ? w.filterGroups : [],
    businessHoursEnabled: !!w.businessHoursEnabled,
    businessHourSlots: Array.isArray(w.businessHourSlots) ? w.businessHourSlots : [],
    timezone: w.timezone ?? undefined,
  };
}

/** Build a writable subset of the wire shape from a Destination patch.
 *  Skips read-only / computed fields (live counters, buyer_name, timestamps). */
function destinationToWire(patch: Partial<Destination>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (patch.buyerId !== undefined) body.buyerId = patch.buyerId;
  if (patch.tfn !== undefined) body.tfn = patch.tfn;
  if (patch.name !== undefined) body.name = patch.name;
  if (patch.forwardType !== undefined) body.forwardType = patch.forwardType;
  if (patch.concurrencyCap !== undefined) body.concurrencyCap = patch.concurrencyCap;
  if (patch.dailyCap !== undefined) body.dailyCap = patch.dailyCap;
  if (patch.monthlyCap !== undefined) body.monthlyCap = patch.monthlyCap;
  if (patch.enabled !== undefined) body.enabled = patch.enabled;
  if (patch.ringDurationSec !== undefined) body.ringDurationSec = patch.ringDurationSec;
  if (patch.timezone !== undefined) body.timezone = patch.timezone ?? null;
  if (patch.filterEnabled !== undefined) body.filterEnabled = patch.filterEnabled;
  if (patch.filterGroups !== undefined) body.filterGroups = patch.filterGroups;
  if (patch.businessHoursEnabled !== undefined) body.businessHoursEnabled = patch.businessHoursEnabled;
  if (patch.businessHourSlots !== undefined) body.businessHourSlots = patch.businessHourSlots;
  return body;
}

/* ─── Public service ──────────────────────────────────────────────────── */

export const destinationsService = {
  async list(query: DestinationListQuery = {}): Promise<Paginated<Destination>> {
    const res = await http.get<Paginated<DestinationWire>>("/api/destinations/", { query });
    return { ...res, items: res.items.map(wireToDestination) };
  },

  async get(id: string): Promise<Destination> {
    return wireToDestination(await http.get<DestinationWire>(`/api/destinations/${id}/`));
  },

  async create(input: Omit<Destination, "id">): Promise<Destination> {
    return wireToDestination(
      await http.post<DestinationWire>("/api/destinations/", { body: destinationToWire(input) }),
    );
  },

  async update(id: string, patch: Partial<Destination>): Promise<Destination> {
    return wireToDestination(
      await http.patch<DestinationWire>(`/api/destinations/${id}/`, {
        body: destinationToWire(patch),
      }),
    );
  },

  async remove(id: string): Promise<void> {
    await http.delete(`/api/destinations/${id}/`);
  },

  async setEnabled(id: string, enabled: boolean): Promise<Destination> {
    return wireToDestination(
      await http.patch<DestinationWire>(`/api/destinations/${id}/`, { body: { enabled } }),
    );
  },

  async stats(): Promise<DestinationStats> {
    const w = await http.get<DestinationStatsWire>("/api/destinations/stats/");
    return {
      activeLive: w.activeLive ?? 0,
      totalLive: w.totalLive ?? 0,
      totalCC: w.totalCc ?? 0,
      activeTfns: w.activeTfns ?? 0,
      vacantCC: w.vacantCc ?? 0,
    };
  },
};
