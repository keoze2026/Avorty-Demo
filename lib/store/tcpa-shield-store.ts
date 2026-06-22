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

/** Reconstruct the full wire-level Shield from a stored TCPA entry.
 *  The TCPA store doesn't track Shield-level `isActive` (the toggle is
 *  stored INSIDE the meta blob), so we default the wire field to `true`.
 *  PUT requires a complete object — backend rejects PATCH and GET-single. */
function entryToShield(e: TcpaShieldEntry): Omit<Shield, "id"> {
  return {
    name: e.name,
    shieldType: "tcpa",
    campaignIds: e.campaignIds,
    blockedCarriers: entryToCarriers(e),
    isActive: true,
  };
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

async function pushFullEntry(id: string, current: TcpaShieldEntry): Promise<void> {
  // PUT semantics — must send the complete Shield body. `entryToShield`
  // packs the TCPA meta (type/active/config) into blockedCarriers as we
  // already do, and includes the wire-level name + campaignIds.
  await spamService.updateShield(id, entryToShield(current));
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
    const current = get().providers.find((x) => x.id === id);
    if (!current) return;
    const next: TcpaShieldEntry = { ...current, name };
    const prev = get().providers;
    set((s) => ({
      providers: s.providers.map((x) => (x.id === id ? next : x)),
    }));
    try {
      await pushFullEntry(id, next);
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
    const next: TcpaShieldEntry = { ...current, active };
    const prev = get().providers;
    set((s) => ({
      providers: s.providers.map((x) => (x.id === id ? next : x)),
    }));
    try {
      await pushFullEntry(id, next);
    } catch (e) {
      set({ providers: prev, error: messageFromError(e) });
      throw e;
    }
  },

  addCampaign: async (id, campaignId) => {
    const current = get().providers.find((x) => x.id === id);
    if (!current || current.campaignIds.includes(campaignId)) return;
    const next: TcpaShieldEntry = {
      ...current,
      campaignIds: [...current.campaignIds, campaignId],
    };
    const prev = get().providers;
    set((s) => ({
      providers: s.providers.map((x) => (x.id === id ? next : x)),
    }));
    try {
      await pushFullEntry(id, next);
    } catch (e) {
      set({ providers: prev, error: messageFromError(e) });
      throw e;
    }
  },

  removeCampaign: async (id, campaignId) => {
    const current = get().providers.find((x) => x.id === id);
    if (!current) return;
    const next: TcpaShieldEntry = {
      ...current,
      campaignIds: current.campaignIds.filter((c) => c !== campaignId),
    };
    const prev = get().providers;
    set((s) => ({
      providers: s.providers.map((x) => (x.id === id ? next : x)),
    }));
    try {
      await pushFullEntry(id, next);
    } catch (e) {
      set({ providers: prev, error: messageFromError(e) });
      throw e;
    }
  },

  updateConfig: async (id, patch) => {
    const current = get().providers.find((x) => x.id === id);
    if (!current) return;
    const next: TcpaShieldEntry = {
      ...current,
      config: { ...current.config, ...patch },
    };
    const prev = get().providers;
    set((s) => ({
      providers: s.providers.map((x) => (x.id === id ? next : x)),
    }));
    try {
      await pushFullEntry(id, next);
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
