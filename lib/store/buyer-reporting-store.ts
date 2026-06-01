/**
 * Per-buyer reporting visibility.
 *
 * Mirrors the per-publisher visibility model in `publisher-access-store` — an
 * admin un-checks columns here to hide them from the buyer's reporting views.
 * Defaults to every column visible.
 */

"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  REPORTING_COLUMNS,
  type ReportingColumnKey,
  type ReportingVisibility,
} from "@/lib/store/publisher-access-store";

const DEFAULT_REPORTING: ReportingVisibility = {
  incoming: true,
  connected: true,
  qualified: true,
  notConnected: true,
  acl: true,
  tcl: true,
  cost: true,
};

interface Store {
  byBuyer: Record<string, ReportingVisibility>;
  getReporting: (buyerId: string) => ReportingVisibility;
  toggleReportingColumn: (buyerId: string, key: ReportingColumnKey) => void;
}

export const useBuyerReportingStore = create<Store>()(
  persist(
    (set, get) => ({
      byBuyer: {},

      getReporting: (buyerId) =>
        get().byBuyer[buyerId] ?? { ...DEFAULT_REPORTING },

      toggleReportingColumn: (buyerId, key) =>
        set((s) => {
          const cur = s.byBuyer[buyerId] ?? { ...DEFAULT_REPORTING };
          return {
            byBuyer: {
              ...s.byBuyer,
              [buyerId]: { ...cur, [key]: !cur[key] },
            },
          };
        }),
    }),
    {
      name: "vortyx.buyer-reporting",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);

export { REPORTING_COLUMNS };
export type { ReportingColumnKey, ReportingVisibility };
