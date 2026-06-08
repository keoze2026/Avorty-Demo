/**
 * Phone Numbers + DNI Pools service.
 *
 *   /api/numbers/*       — tracking number CRUD, purchase, search, assignment
 *   /api/dni/pools/*     — number pools used by the rotation engine
 *
 * Returns frontend-shaped `TrackingNumber` and `NumberPool` objects.
 */

import { http } from "@/lib/api/http";
import type { Paginated } from "@/lib/api/types";
import type {
  NumberPool,
  NumberStatus,
  NumberType,
  RotationStrategy,
  TrackingNumber,
} from "@/lib/types";

/* ─── Tracking number wire shapes ─────────────────────────────────────── */

interface NumberWire {
  id: string;
  number: string;
  type?: string;
  status?: string;
  campaignId?: string;
  campaignName?: string;
  poolId?: string;
  poolName?: string;
  state?: string;
  city?: string;
  monthlyCost?: string | number;
  callsToday?: number;
  callsMonthly?: number;
  conversionRate?: number;
  provisionedAt?: string | number;
  lastCallAt?: string | number;
}

function normalizeNumberStatus(raw?: string): NumberStatus {
  const s = (raw ?? "").toLowerCase();
  if (s === "paused" || s === "pending" || s === "expired") return s;
  return "active";
}

function normalizeNumberType(raw?: string): NumberType {
  const s = (raw ?? "").toLowerCase();
  if (s === "tollfree" || s === "toll_free" || s === "toll-free") return "tollfree";
  if (s === "international") return "international";
  return "local";
}

function toNum(s: string | number | undefined, fallback = 0): number {
  if (typeof s === "number") return s;
  if (typeof s === "string") {
    const n = Number(s);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

function toTs(v: string | number | undefined): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const t = Date.parse(v);
    return Number.isFinite(t) ? t : Date.now();
  }
  return Date.now();
}

function wireToNumber(w: NumberWire): TrackingNumber {
  return {
    id: w.id,
    number: w.number,
    type: normalizeNumberType(w.type),
    status: normalizeNumberStatus(w.status),
    campaignId: w.campaignId,
    campaignName: w.campaignName,
    poolId: w.poolId,
    poolName: w.poolName,
    state: w.state,
    city: w.city,
    monthlyCost: toNum(w.monthlyCost),
    callsToday: w.callsToday ?? 0,
    callsMonthly: w.callsMonthly ?? 0,
    conversionRate: w.conversionRate ?? 0,
    provisionedAt: toTs(w.provisionedAt),
    lastCallAt: w.lastCallAt !== undefined ? toTs(w.lastCallAt) : undefined,
  };
}

/* ─── DNI pool wire shapes ────────────────────────────────────────────── */

interface PoolWire {
  id: string;
  name: string;
  campaignId: string;
  campaignName?: string;
  rotationStrategy?: string;
  numberCount?: number;
  callsToday?: number;
  active?: boolean;
  country?: string;
  closedBrowserDelaySec?: number;
  idleTimeSec?: number;
  autoBuy?: boolean;
  attachedNumberIds?: string[];
}

function normalizeRotation(raw?: string): RotationStrategy {
  const s = (raw ?? "").toLowerCase();
  if (s === "weighted") return "weighted";
  if (s === "priority") return "priority";
  return "round-robin";
}

function wireToPool(w: PoolWire): NumberPool {
  return {
    id: w.id,
    name: w.name,
    campaignId: w.campaignId,
    campaignName: w.campaignName ?? "",
    rotationStrategy: normalizeRotation(w.rotationStrategy),
    numberCount: w.numberCount ?? (w.attachedNumberIds?.length ?? 0),
    callsToday: w.callsToday ?? 0,
    active: w.active ?? true,
    country: w.country,
    closedBrowserDelaySec: w.closedBrowserDelaySec,
    idleTimeSec: w.idleTimeSec,
    autoBuy: w.autoBuy,
    attachedNumberIds: w.attachedNumberIds,
  };
}

/* ─── Public services ─────────────────────────────────────────────────── */

export const numbersService = {
  async list(
    query: { page?: number; pageSize?: number } = {},
  ): Promise<Paginated<TrackingNumber>> {
    const res = await http.get<Paginated<NumberWire>>("/api/numbers/", { query });
    return { ...res, items: res.items.map(wireToNumber) };
  },

  async get(id: string): Promise<TrackingNumber> {
    return wireToNumber(await http.get<NumberWire>(`/api/numbers/${id}`));
  },

  async update(id: string, patch: Partial<TrackingNumber>): Promise<TrackingNumber> {
    const body: Record<string, unknown> = {};
    if (patch.campaignId !== undefined) body.campaignId = patch.campaignId;
    if (patch.status !== undefined) body.status = patch.status;
    return wireToNumber(
      await http.patch<NumberWire>(`/api/numbers/${id}`, { body }),
    );
  },

  async release(id: string): Promise<void> {
    await http.delete(`/api/numbers/${id}/release`);
  },

  async search(query: {
    type?: NumberType;
    areaCode?: string;
    country?: string;
  }): Promise<NumberWire[]> {
    return http.post<NumberWire[]>("/api/numbers/search", { body: query });
  },

  async purchase(input: {
    number: string;
    campaignId?: string;
  }): Promise<TrackingNumber> {
    return wireToNumber(
      await http.post<NumberWire>("/api/numbers/purchase", { body: input }),
    );
  },

  async importNumber(input: { number: string; vendor?: string }): Promise<TrackingNumber> {
    return wireToNumber(
      await http.post<NumberWire>("/api/numbers/import", { body: input }),
    );
  },

  async assign(id: string, campaignId: string): Promise<void> {
    await http.post(`/api/numbers/${id}/assign`, { body: { campaignId } });
  },
};

export const poolsService = {
  async list(
    query: { page?: number; pageSize?: number } = {},
  ): Promise<Paginated<NumberPool>> {
    const res = await http.get<Paginated<PoolWire>>("/api/dni/pools", { query });
    return { ...res, items: res.items.map(wireToPool) };
  },

  async get(id: string): Promise<NumberPool> {
    return wireToPool(await http.get<PoolWire>(`/api/dni/pools/${id}`));
  },

  async create(input: Omit<NumberPool, "id">): Promise<NumberPool> {
    return wireToPool(
      await http.post<PoolWire>("/api/dni/pools", {
        body: {
          name: input.name,
          campaignId: input.campaignId,
          rotationStrategy: input.rotationStrategy,
          country: input.country,
          closedBrowserDelaySec: input.closedBrowserDelaySec,
          idleTimeSec: input.idleTimeSec,
          autoBuy: input.autoBuy,
        },
      }),
    );
  },

  async update(id: string, patch: Partial<NumberPool>): Promise<NumberPool> {
    return wireToPool(await http.patch<PoolWire>(`/api/dni/pools/${id}`, { body: patch }));
  },

  async remove(id: string): Promise<void> {
    await http.delete(`/api/dni/pools/${id}`);
  },

  async addNumber(poolId: string, numberId: string): Promise<void> {
    await http.post(`/api/dni/pools/${poolId}/numbers`, { body: { numberId } });
  },

  async removeNumber(poolId: string, numberId: string): Promise<void> {
    await http.delete(`/api/dni/pools/${poolId}/numbers/${numberId}`);
  },
};
