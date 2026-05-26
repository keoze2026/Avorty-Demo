"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { MOCK_BUYERS } from "@/lib/mock/buyers";
import type { Buyer, BuyerStatus } from "@/lib/types";

interface BuyersState {
  buyers: Buyer[];

  getById: (id: string) => Buyer | undefined;
  add: (input: Omit<Buyer, "id" | "createdAt">) => Buyer;
  update: (id: string, patch: Partial<Buyer>) => void;
  remove: (id: string) => void;
  setStatus: (id: string, status: BuyerStatus) => void;
}

function makeId() {
  return `b_${Math.random().toString(36).slice(2, 8)}`;
}

export const useBuyersStore = create<BuyersState>()(
  persist(
    (set, get) => ({
      buyers: MOCK_BUYERS,
      getById: (id) => get().buyers.find((b) => b.id === id),
      add: (input) => {
        const created: Buyer = { ...input, id: makeId(), createdAt: Date.now() };
        set((s) => ({ buyers: [created, ...s.buyers] }));
        return created;
      },
      update: (id, patch) =>
        set((s) => ({ buyers: s.buyers.map((b) => (b.id === id ? { ...b, ...patch } : b)) })),
      remove: (id) => set((s) => ({ buyers: s.buyers.filter((b) => b.id !== id) })),
      setStatus: (id, status) =>
        set((s) => ({ buyers: s.buyers.map((b) => (b.id === id ? { ...b, status } : b)) })),
    }),
    {
      name: "vortyx.buyers",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
