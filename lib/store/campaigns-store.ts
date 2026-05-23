/**
 * Campaigns store. Seeded from MOCK_CAMPAIGNS so the demo state survives reloads
 * via Zustand persist; reset by clearing localStorage.
 */

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { MOCK_CAMPAIGNS } from "@/lib/mock/campaigns";
import type { Campaign, CampaignStatus } from "@/lib/types";

interface CampaignsState {
  campaigns: Campaign[];
  getById: (id: string) => Campaign | undefined;
  add: (input: Omit<Campaign, "id" | "createdAt">) => Campaign;
  update: (id: string, patch: Partial<Campaign>) => void;
  remove: (id: string) => void;
  setStatus: (id: string, status: CampaignStatus) => void;
}

function makeId() {
  return `c_${Math.random().toString(36).slice(2, 8)}`;
}

export const useCampaignsStore = create<CampaignsState>()(
  persist(
    (set, get) => ({
      campaigns: MOCK_CAMPAIGNS,
      getById: (id) => get().campaigns.find((c) => c.id === id),
      add: (input) => {
        const created: Campaign = { ...input, id: makeId(), createdAt: Date.now() };
        set((s) => ({ campaigns: [created, ...s.campaigns] }));
        return created;
      },
      update: (id, patch) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      remove: (id) => set((s) => ({ campaigns: s.campaigns.filter((c) => c.id !== id) })),
      setStatus: (id, status) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) => (c.id === id ? { ...c, status } : c)),
        })),
    }),
    {
      name: "vortyx.campaigns",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
