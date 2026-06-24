/**
 * Per-buyer reporting visibility — backed by /api/buyers/{id}/reporting-config.
 *
 * Admins flip column visibility on the Buyer settings tab; the change PATCHes
 * the backend, and the buyer's own reporting view honors the allowlist on
 * the server side. Local cache is keyed by buyer id and hydrates lazily on
 * the first time the settings tab opens for that buyer.
 *
 * Mirrors the per-publisher visibility model (kept aligned in
 * `publisher-access-store`) — the column key set is shared.
 */

"use client";

import { create } from "zustand";

import { buyersService } from "@/lib/api/services/buyers.service";
import {
  REPORTING_COLUMNS,
  type ReportingColumnKey,
  type ReportingVisibility,
} from "@/lib/store/publisher-access-store";

const DEFAULT_REPORTING: ReportingVisibility = {
  incoming: true,
  connected: true,
  qualified: true,
  converted: true,
  notConnected: true,
  acl: true,
  tcl: true,
  cost: true,
};

/** Map wire snake_case column keys → FE camelCase boolean keys, and back. */
const WIRE_TO_FE: Record<string, ReportingColumnKey> = {
  incoming: "incoming",
  connected: "connected",
  qualified: "qualified",
  converted: "converted",
  not_connected: "notConnected",
  acl: "acl",
  tcl: "tcl",
  cost: "cost",
};

const FE_TO_WIRE: Record<ReportingColumnKey, string> = {
  incoming: "incoming",
  connected: "connected",
  qualified: "qualified",
  converted: "converted",
  notConnected: "not_connected",
  acl: "acl",
  tcl: "tcl",
  cost: "cost",
};

function visibilityFromColumns(cols: string[]): ReportingVisibility {
  const v: ReportingVisibility = {
    incoming: false,
    connected: false,
    qualified: false,
    converted: false,
    notConnected: false,
    acl: false,
    tcl: false,
    cost: false,
  };
  for (const c of cols) {
    const k = WIRE_TO_FE[c];
    if (k) v[k] = true;
  }
  return v;
}

function visibilityToColumns(v: ReportingVisibility): string[] {
  return (Object.keys(FE_TO_WIRE) as ReportingColumnKey[])
    .filter((k) => v[k])
    .map((k) => FE_TO_WIRE[k]);
}

interface Store {
  /** Per-buyer cache, populated on `fetchReporting`. */
  byBuyer: Record<string, ReportingVisibility>;
  /** Which buyer ids have been hydrated this session. */
  hydratedFor: Record<string, true>;

  /** Lazy-load this buyer's visibility. Safe to call repeatedly; no-op when
   *  already hydrated. */
  fetchReporting: (buyerId: string) => Promise<void>;
  /** Synchronous read used by the section UI. Falls back to all-on. */
  getReporting: (buyerId: string) => ReportingVisibility;
  /** Optimistic flip + backend PUT. */
  toggleReportingColumn: (buyerId: string, key: ReportingColumnKey) => Promise<void>;
}

export const useBuyerReportingStore = create<Store>()((set, get) => ({
  byBuyer: {},
  hydratedFor: {},

  fetchReporting: async (buyerId) => {
    if (get().hydratedFor[buyerId]) return;
    try {
      const cols = await buyersService.getReportingConfig(buyerId);
      set((s) => ({
        byBuyer: { ...s.byBuyer, [buyerId]: visibilityFromColumns(cols) },
        hydratedFor: { ...s.hydratedFor, [buyerId]: true },
      }));
    } catch {
      // Endpoint unreachable — keep the default (all-on) so the UI doesn't
      // strand the user with empty checkboxes. Don't mark hydrated so we
      // retry on the next page open.
    }
  },

  getReporting: (buyerId) =>
    get().byBuyer[buyerId] ?? { ...DEFAULT_REPORTING },

  toggleReportingColumn: async (buyerId, key) => {
    const prev = get().byBuyer[buyerId] ?? { ...DEFAULT_REPORTING };
    const next: ReportingVisibility = { ...prev, [key]: !prev[key] };
    set((s) => ({ byBuyer: { ...s.byBuyer, [buyerId]: next } }));
    try {
      await buyersService.setReportingConfig(buyerId, visibilityToColumns(next));
    } catch {
      // Backend rejected the write — roll the toggle back.
      set((s) => ({ byBuyer: { ...s.byBuyer, [buyerId]: prev } }));
    }
  },
}));

export { REPORTING_COLUMNS };
export type { ReportingColumnKey, ReportingVisibility };
