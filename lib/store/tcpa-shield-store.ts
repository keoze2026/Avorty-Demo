/**
 * TCPA Shield store — persists providers (records) plus their attached
 * campaigns and per-provider API configuration. Mirrors the VoIP-Shield store
 * shape so the two suppression surfaces stay consistent.
 */

"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  MOCK_TCPA_SHIELD,
  emptyTcpaConfig,
  type TcpaProviderConfig,
  type TcpaProviderType,
  type TcpaShieldEntry,
} from "@/lib/mock/suppression";

interface TcpaShieldState {
  providers: TcpaShieldEntry[];
  getById: (id: string) => TcpaShieldEntry | undefined;
  add: (name: string, type: TcpaProviderType) => TcpaShieldEntry;
  rename: (id: string, name: string) => void;
  remove: (id: string) => void;
  setActive: (id: string, active: boolean) => void;
  addCampaign: (id: string, campaignId: string) => void;
  removeCampaign: (id: string, campaignId: string) => void;
  updateConfig: (id: string, patch: Partial<TcpaProviderConfig>) => void;
}

function makeId() {
  return `t_${Math.random().toString(36).slice(2, 8)}`;
}

export const useTcpaShieldStore = create<TcpaShieldState>()(
  persist(
    (set, get) => ({
      providers: MOCK_TCPA_SHIELD,
      getById: (id) => get().providers.find((p) => p.id === id),

      add: (name, type) => {
        const created: TcpaShieldEntry = {
          id: makeId(),
          name,
          campaignIds: [],
          type,
          active: true,
          config: emptyTcpaConfig(),
        };
        set((s) => ({ providers: [created, ...s.providers] }));
        return created;
      },

      rename: (id, name) =>
        set((s) => ({
          providers: s.providers.map((x) => (x.id === id ? { ...x, name } : x)),
        })),

      remove: (id) =>
        set((s) => ({ providers: s.providers.filter((x) => x.id !== id) })),

      setActive: (id, active) =>
        set((s) => ({
          providers: s.providers.map((x) =>
            x.id === id ? { ...x, active } : x,
          ),
        })),

      addCampaign: (id, campaignId) =>
        set((s) => ({
          providers: s.providers.map((x) =>
            x.id === id && !x.campaignIds.includes(campaignId)
              ? { ...x, campaignIds: [...x.campaignIds, campaignId] }
              : x,
          ),
        })),

      removeCampaign: (id, campaignId) =>
        set((s) => ({
          providers: s.providers.map((x) =>
            x.id === id
              ? { ...x, campaignIds: x.campaignIds.filter((c) => c !== campaignId) }
              : x,
          ),
        })),

      updateConfig: (id, patch) =>
        set((s) => ({
          providers: s.providers.map((x) =>
            x.id === id ? { ...x, config: { ...x.config, ...patch } } : x,
          ),
        })),
    }),
    {
      name: "vortyx.tcpa-shield",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
