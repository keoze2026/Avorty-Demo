/**
 * TCPA Shield store — backed by /api/spam/shields/ (shieldType=tcpa).
 *
 * TCPA providers carry a per-provider config (API keys, endpoint, sandbox
 * flag, etc.) that the backend's flat shield schema doesn't model. We pack
 * the config + provider type into the blockedCarriers array as a single
 * JSON string so it round-trips without backend changes:
 *
 *   blockedCarriers = ["__tcpa_meta__|{ \"type\": \"trustedform\",
 *                        \"active\": true, \"config\": { … } }"]
 */

"use client";

import { create } from "zustand";

import { spamService, type Shield } from "@/lib/api/services/spam.service";
import {
  emptyTcpaConfig,
  type TcpaProviderConfig,
  type TcpaProviderType,
  type TcpaShieldEntry,
} from "@/lib/mock/suppression";

const META_PREFIX = "__tcpa_meta__|";

interface TcpaMeta {
  type: TcpaProviderType;
  active: boolean;
  config: TcpaProviderConfig;
}

function encodeMeta(m: TcpaMeta): string {
  return META_PREFIX + JSON.stringify(m);
}

function decodeMeta(carriers: string[]): TcpaMeta | null {
  for (const c of carriers) {
    if (typeof c === "string" && c.startsWith(META_PREFIX)) {
      try {
        const parsed = JSON.parse(c.slice(META_PREFIX.length));
        return {
          type: (parsed.type ?? "trustedform") as TcpaProviderType,
          active: parsed.active ?? true,
          config: { ...emptyTcpaConfig(), ...(parsed.config ?? {}) },
        };
      } catch {
        // fall through
      }
    }
  }
  return null;
}

function shieldToEntry(s: Shield): TcpaShieldEntry {
  const meta = decodeMeta(s.blockedCarriers) ?? {
    type: "trustedform" as TcpaProviderType,
    active: true,
    config: emptyTcpaConfig(),
  };
  return {
    id: s.id,
    name: s.name,
    campaignIds: s.campaignIds,
    type: meta.type,
    active: meta.active,
    config: meta.config,
  };
}

function entryToCarriers(e: Pick<TcpaShieldEntry, "type" | "active" | "config">): string[] {
  return [encodeMeta({ type: e.type, active: e.active, config: e.config })];
}

interface TcpaShieldState {
  providers: TcpaShieldEntry[];
  loading: boolean;
  error: string | null;
  hydrated: boolean;

  fetch: () => Promise<void>;
  getById: (id: string) => TcpaShieldEntry | undefined;
  add: (name: string, type: TcpaProviderType) => Promise<TcpaShieldEntry>;
  rename: (id: string, name: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setActive: (id: string, active: boolean) => Promise<void>;
  addCampaign: (id: string, campaignId: string) => Promise<void>;
  removeCampaign: (id: string, campaignId: string) => Promise<void>;
  updateConfig: (id: string, patch: Partial<TcpaProviderConfig>) => Promise<void>;
}

async function pushMeta(id: string, current: TcpaShieldEntry): Promise<void> {
  await spamService.updateShield(id, {
    blockedCarriers: entryToCarriers(current),
  });
}

export const useTcpaShieldStore = create<TcpaShieldState>()((set, get) => ({
  providers: [],
  loading: false,
  error: null,
  hydrated: false,

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const items = await spamService.listShields({ shieldType: "tcpa" });
      set({ providers: items.map(shieldToEntry), loading: false, hydrated: true });
    } catch (e) {
      set({ loading: false, error: messageFromError(e) });
    }
  },

  getById: (id) => get().providers.find((p) => p.id === id),

  add: async (name, type) => {
    const entry: Omit<TcpaShieldEntry, "id"> = {
      name,
      campaignIds: [],
      type,
      active: true,
      config: emptyTcpaConfig(),
    };
    const created = await spamService.createShield({
      name,
      shieldType: "tcpa",
      campaignIds: [],
      blockedCarriers: entryToCarriers(entry),
    });
    const full = shieldToEntry(created);
    set((s) => ({ providers: [full, ...s.providers] }));
    return full;
  },

  rename: async (id, name) => {
    const prev = get().providers;
    set((s) => ({
      providers: s.providers.map((x) => (x.id === id ? { ...x, name } : x)),
    }));
    try {
      await spamService.updateShield(id, { name });
    } catch (e) {
      set({ providers: prev, error: messageFromError(e) });
      throw e;
    }
  },

  remove: async (id) => {
    const prev = get().providers;
    set((s) => ({ providers: s.providers.filter((x) => x.id !== id) }));
    try {
      await spamService.deleteShield(id);
    } catch (e) {
      set({ providers: prev, error: messageFromError(e) });
      throw e;
    }
  },

  setActive: async (id, active) => {
    const current = get().providers.find((x) => x.id === id);
    if (!current) return;
    const next = { ...current, active };
    const prev = get().providers;
    set((s) => ({
      providers: s.providers.map((x) => (x.id === id ? next : x)),
    }));
    try {
      await pushMeta(id, next);
    } catch (e) {
      set({ providers: prev, error: messageFromError(e) });
      throw e;
    }
  },

  addCampaign: async (id, campaignId) => {
    const current = get().providers.find((x) => x.id === id);
    if (!current || current.campaignIds.includes(campaignId)) return;
    const next = [...current.campaignIds, campaignId];
    const prev = get().providers;
    set((s) => ({
      providers: s.providers.map((x) => (x.id === id ? { ...x, campaignIds: next } : x)),
    }));
    try {
      await spamService.updateShield(id, { campaignIds: next });
    } catch (e) {
      set({ providers: prev, error: messageFromError(e) });
      throw e;
    }
  },

  removeCampaign: async (id, campaignId) => {
    const current = get().providers.find((x) => x.id === id);
    if (!current) return;
    const next = current.campaignIds.filter((c) => c !== campaignId);
    const prev = get().providers;
    set((s) => ({
      providers: s.providers.map((x) => (x.id === id ? { ...x, campaignIds: next } : x)),
    }));
    try {
      await spamService.updateShield(id, { campaignIds: next });
    } catch (e) {
      set({ providers: prev, error: messageFromError(e) });
      throw e;
    }
  },

  updateConfig: async (id, patch) => {
    const current = get().providers.find((x) => x.id === id);
    if (!current) return;
    const next = { ...current, config: { ...current.config, ...patch } };
    const prev = get().providers;
    set((s) => ({
      providers: s.providers.map((x) => (x.id === id ? next : x)),
    }));
    try {
      await pushMeta(id, next);
    } catch (e) {
      set({ providers: prev, error: messageFromError(e) });
      throw e;
    }
  },
}));

function messageFromError(e: unknown): string {
  if (e instanceof Error) return e.message;
  return "TCPA shield request failed";
}
