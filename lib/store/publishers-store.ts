"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { MOCK_PAYOUTS, MOCK_PUBLISHERS } from "@/lib/mock/publishers";
import type { PayoutRecord, Publisher, PublisherStatus } from "@/lib/types";

interface PublishersState {
  publishers: Publisher[];
  payouts: PayoutRecord[];

  getById: (id: string) => Publisher | undefined;
  payoutsFor: (publisherId: string) => PayoutRecord[];
  add: (input: Omit<Publisher, "id" | "createdAt">) => Publisher;
  update: (id: string, patch: Partial<Publisher>) => void;
  remove: (id: string) => void;
  setStatus: (id: string, status: PublisherStatus) => void;
}

function makeId() {
  return `p_${Math.random().toString(36).slice(2, 8)}`;
}

export const usePublishersStore = create<PublishersState>()(
  persist(
    (set, get) => ({
      publishers: MOCK_PUBLISHERS,
      payouts: MOCK_PAYOUTS,

      getById: (id) => get().publishers.find((p) => p.id === id),
      payoutsFor: (publisherId) =>
        get()
          .payouts.filter((r) => r.publisherId === publisherId)
          .sort((a, b) => b.scheduledFor - a.scheduledFor),
      add: (input) => {
        const created: Publisher = { ...input, id: makeId(), createdAt: Date.now() };
        set((s) => ({ publishers: [created, ...s.publishers] }));
        return created;
      },
      update: (id, patch) =>
        set((s) => ({
          publishers: s.publishers.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      remove: (id) => set((s) => ({ publishers: s.publishers.filter((p) => p.id !== id) })),
      setStatus: (id, status) =>
        set((s) => ({
          publishers: s.publishers.map((p) => (p.id === id ? { ...p, status } : p)),
        })),
    }),
    {
      name: "vortyx.publishers",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
