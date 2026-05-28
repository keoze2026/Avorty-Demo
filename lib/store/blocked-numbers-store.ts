/**
 * Blocked Numbers store — persists manually-blocked phone numbers / prefixes
 * with optional per-campaign scoping. Mirrors the suppression sibling stores.
 */

"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  MOCK_BLOCKED_NUMBERS,
  type BlockedNumberEntry,
  type BlockedNumberScope,
} from "@/lib/mock/suppression";

interface BlockedNumbersState {
  numbers: BlockedNumberEntry[];
  getById: (id: string) => BlockedNumberEntry | undefined;
  add: (input: {
    number: string;
    scope: BlockedNumberScope;
    campaignId?: string;
  }) => BlockedNumberEntry;
  update: (
    id: string,
    patch: { number?: string; campaignId?: string | undefined },
  ) => void;
  remove: (id: string) => void;
}

function makeId() {
  return `b_${Math.random().toString(36).slice(2, 8)}`;
}

/** Strip every non-digit so the store always holds canonical digits-only values. */
function normalizeNumber(input: string): string {
  return input.replace(/\D/g, "");
}

export const useBlockedNumbersStore = create<BlockedNumbersState>()(
  persist(
    (set, get) => ({
      numbers: MOCK_BLOCKED_NUMBERS,
      getById: (id) => get().numbers.find((n) => n.id === id),

      add: ({ number, scope, campaignId }) => {
        const created: BlockedNumberEntry = {
          id: makeId(),
          number: normalizeNumber(number),
          scope,
          campaignId,
        };
        set((s) => ({ numbers: [created, ...s.numbers] }));
        return created;
      },

      update: (id, patch) =>
        set((s) => ({
          numbers: s.numbers.map((n) => {
            if (n.id !== id) return n;
            const next: BlockedNumberEntry = { ...n };
            if (patch.number !== undefined) next.number = normalizeNumber(patch.number);
            // Allow campaignId to be explicitly set to undefined (= "All Campaigns").
            if ("campaignId" in patch) next.campaignId = patch.campaignId;
            return next;
          }),
        })),

      remove: (id) =>
        set((s) => ({ numbers: s.numbers.filter((n) => n.id !== id) })),
    }),
    {
      name: "vortyx.blocked-numbers",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
