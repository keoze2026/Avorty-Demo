/**
 * Destinations store. Seeded from MOCK_DESTINATIONS so the demo state survives
 * reloads via Zustand persist; reset by clearing localStorage.
 *
 * Mirrors the buyers / campaigns store pattern: add / update / remove / set
 * helpers that the destinations page and dashboard summary table both read.
 */

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { MOCK_DESTINATIONS } from "@/lib/mock/destinations";
import type { Destination } from "@/lib/types";

interface DestinationsState {
  destinations: Destination[];
  getById: (id: string) => Destination | undefined;
  /** Returns the freshly-created Destination (id assigned). */
  add: (input: Omit<Destination, "id">) => Destination;
  update: (id: string, patch: Partial<Destination>) => void;
  remove: (id: string) => void;
  setEnabled: (id: string, enabled: boolean) => void;
}

function makeId() {
  return `dest_${Math.random().toString(36).slice(2, 8)}`;
}

export const useDestinationsStore = create<DestinationsState>()(
  persist(
    (set, get) => ({
      destinations: MOCK_DESTINATIONS,
      getById: (id) => get().destinations.find((d) => d.id === id),
      add: (input) => {
        const created: Destination = { ...input, id: makeId() };
        set((s) => ({ destinations: [created, ...s.destinations] }));
        return created;
      },
      update: (id, patch) =>
        set((s) => ({
          destinations: s.destinations.map((d) =>
            d.id === id ? { ...d, ...patch } : d,
          ),
        })),
      remove: (id) =>
        set((s) => ({ destinations: s.destinations.filter((d) => d.id !== id) })),
      setEnabled: (id, enabled) =>
        set((s) => ({
          destinations: s.destinations.map((d) =>
            d.id === id ? { ...d, enabled } : d,
          ),
        })),
    }),
    {
      name: "vortyx.destinations",
      storage: createJSONStorage(() => localStorage),
      // Bumped to 2 to invalidate older persisted state and pick up the
      // BULK_ROSTER (+100) rows added to MOCK_DESTINATIONS.
      version: 2,
    },
  ),
);
