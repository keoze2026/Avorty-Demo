"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { MOCK_NUMBERS, MOCK_POOLS } from "@/lib/mock/numbers";
import type { NumberPool, NumberStatus, TrackingNumber } from "@/lib/types";

interface NumbersState {
  numbers: TrackingNumber[];
  pools: NumberPool[];

  addNumber: (input: Omit<TrackingNumber, "id" | "provisionedAt">) => TrackingNumber;
  setNumberStatus: (id: string, status: NumberStatus) => void;
  removeNumber: (id: string) => void;

  addPool: (input: Omit<NumberPool, "id">) => NumberPool;
  updatePool: (id: string, patch: Partial<NumberPool>) => void;
  setPoolActive: (id: string, active: boolean) => void;
  removePool: (id: string) => void;
}

function makeId() {
  return `n_${Math.random().toString(36).slice(2, 8)}`;
}

export const useNumbersStore = create<NumbersState>()(
  persist(
    (set) => ({
      numbers: MOCK_NUMBERS,
      pools: MOCK_POOLS,

      addNumber: (input) => {
        const created: TrackingNumber = {
          ...input,
          id: makeId(),
          provisionedAt: Date.now(),
        };
        set((s) => ({ numbers: [created, ...s.numbers] }));
        return created;
      },
      setNumberStatus: (id, status) =>
        set((s) => ({
          numbers: s.numbers.map((n) => (n.id === id ? { ...n, status } : n)),
        })),
      removeNumber: (id) =>
        set((s) => ({ numbers: s.numbers.filter((n) => n.id !== id) })),

      addPool: (input) => {
        const created: NumberPool = { ...input, id: `p_${Math.random().toString(36).slice(2, 8)}` };
        set((s) => ({ pools: [created, ...s.pools] }));
        return created;
      },
      updatePool: (id, patch) =>
        set((s) => ({
          pools: s.pools.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      setPoolActive: (id, active) =>
        set((s) => ({
          pools: s.pools.map((p) => (p.id === id ? { ...p, active } : p)),
        })),
      removePool: (id) =>
        set((s) => ({ pools: s.pools.filter((p) => p.id !== id) })),
    }),
    {
      name: "vortyx.numbers",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
