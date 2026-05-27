/**
 * Per-campaign advanced + sub-tab settings store. Keyed by campaignId.
 * Falls back to DEFAULT_CAMPAIGN_SETTINGS when a campaign hasn't been touched.
 */

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import {
  DEFAULT_CAMPAIGN_SETTINGS,
  type CampaignAdvancedSettings,
} from "@/lib/types";

interface CampaignSettingsState {
  byId: Record<string, CampaignAdvancedSettings>;
  /** Returns the campaign's settings, or defaults if unset. */
  get: (campaignId: string) => CampaignAdvancedSettings;
  /** Patch a specific feature on a campaign. */
  update: <K extends keyof CampaignAdvancedSettings>(
    campaignId: string,
    key: K,
    value: CampaignAdvancedSettings[K],
  ) => void;
  /** Replace the whole bundle for a campaign. */
  replace: (campaignId: string, settings: CampaignAdvancedSettings) => void;
}

export const useCampaignSettingsStore = create<CampaignSettingsState>()(
  persist(
    (set, get) => ({
      byId: {},
      get: (campaignId) =>
        get().byId[campaignId] ?? DEFAULT_CAMPAIGN_SETTINGS,
      update: (campaignId, key, value) =>
        set((s) => {
          const current = s.byId[campaignId] ?? DEFAULT_CAMPAIGN_SETTINGS;
          return {
            byId: {
              ...s.byId,
              [campaignId]: { ...current, [key]: value },
            },
          };
        }),
      replace: (campaignId, settings) =>
        set((s) => ({ byId: { ...s.byId, [campaignId]: settings } })),
    }),
    {
      name: "vortyx.campaign-settings",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
