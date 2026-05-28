/**
 * VoIP Shield store. Holds shield records (one row per shield) plus helpers
 * for adding/removing protected campaigns and blocked carriers from within a
 * shield's detail page. Persisted to localStorage so changes survive reloads.
 */

"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { MOCK_VOIP_SHIELD, type VoipShieldEntry } from "@/lib/mock/suppression";

interface VoipShieldState {
  shields: VoipShieldEntry[];
  getById: (id: string) => VoipShieldEntry | undefined;
  add: (name: string) => VoipShieldEntry;
  rename: (id: string, name: string) => void;
  remove: (id: string) => void;
  setCampaigns: (id: string, campaignIds: string[]) => void;
  addCampaign: (id: string, campaignId: string) => void;
  removeCampaign: (id: string, campaignId: string) => void;
  addCarrier: (id: string, carrier: string) => void;
  removeCarrier: (id: string, carrier: string) => void;
}

function makeId() {
  return `v_${Math.random().toString(36).slice(2, 8)}`;
}

export const useVoipShieldStore = create<VoipShieldState>()(
  persist(
    (set, get) => ({
      shields: MOCK_VOIP_SHIELD,
      getById: (id) => get().shields.find((s) => s.id === id),

      add: (name) => {
        const created: VoipShieldEntry = {
          id: makeId(),
          name,
          campaignIds: [],
          blockedCarriers: [],
        };
        set((s) => ({ shields: [created, ...s.shields] }));
        return created;
      },

      rename: (id, name) =>
        set((s) => ({
          shields: s.shields.map((x) => (x.id === id ? { ...x, name } : x)),
        })),

      remove: (id) =>
        set((s) => ({ shields: s.shields.filter((x) => x.id !== id) })),

      setCampaigns: (id, campaignIds) =>
        set((s) => ({
          shields: s.shields.map((x) =>
            x.id === id ? { ...x, campaignIds } : x,
          ),
        })),

      addCampaign: (id, campaignId) =>
        set((s) => ({
          shields: s.shields.map((x) =>
            x.id === id && !x.campaignIds.includes(campaignId)
              ? { ...x, campaignIds: [...x.campaignIds, campaignId] }
              : x,
          ),
        })),

      removeCampaign: (id, campaignId) =>
        set((s) => ({
          shields: s.shields.map((x) =>
            x.id === id
              ? { ...x, campaignIds: x.campaignIds.filter((c) => c !== campaignId) }
              : x,
          ),
        })),

      addCarrier: (id, carrier) =>
        set((s) => ({
          shields: s.shields.map((x) =>
            x.id === id && !x.blockedCarriers.includes(carrier)
              ? { ...x, blockedCarriers: [...x.blockedCarriers, carrier] }
              : x,
          ),
        })),

      removeCarrier: (id, carrier) =>
        set((s) => ({
          shields: s.shields.map((x) =>
            x.id === id
              ? {
                  ...x,
                  blockedCarriers: x.blockedCarriers.filter((c) => c !== carrier),
                }
              : x,
          ),
        })),
    }),
    {
      name: "vortyx.voip-shield",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
