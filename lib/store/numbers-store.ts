/**
 * Numbers + DNI pools store — backed by /api/numbers/* and /api/dni/pools/*.
 *
 * Two parallel fetches keep numbers and pools in sync. Mutations call
 * through the service layer and patch local state on success.
 */

"use client";

import { create } from "zustand";

import { numbersService, poolsService } from "@/lib/api/services/numbers.service";
import type { NumberPool, NumberStatus, TrackingNumber } from "@/lib/types";

interface NumbersState {
  numbers: TrackingNumber[];
  pools: NumberPool[];
  loading: boolean;
  error: string | null;
  hydrated: boolean;

  fetch: () => Promise<void>;

  addNumber: (input: Omit<TrackingNumber, "id" | "provisionedAt">) => Promise<TrackingNumber>;
  updateNumber: (id: string, patch: Partial<TrackingNumber>) => Promise<void>;
  setNumberStatus: (id: string, status: NumberStatus) => Promise<void>;
  removeNumber: (id: string) => Promise<void>;

  addPool: (input: Omit<NumberPool, "id">) => Promise<NumberPool>;
  updatePool: (id: string, patch: Partial<NumberPool>) => Promise<void>;
  setPoolActive: (id: string, active: boolean) => Promise<void>;
  removePool: (id: string) => Promise<void>;
}

export const useNumbersStore = create<NumbersState>()((set, get) => ({
  numbers: [],
  pools: [],
  loading: false,
  error: null,
  hydrated: false,

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const [numbers, pools] = await Promise.all([
        numbersService.list({ page: 1, pageSize: 500 }),
        poolsService.list({ page: 1, pageSize: 200 }),
      ]);
      set({
        numbers: numbers.items,
        pools: pools.items,
        loading: false,
        hydrated: true,
      });
    } catch (e) {
      set({ loading: false, error: messageFromError(e) });
    }
  },

  /* ─── Numbers ────────────────────────────────────────────────────── */

  addNumber: async (input) => {
    // Map the frontend "addNumber" call to the closest backend endpoint:
    //   - if the input looks like a search result with no real number yet,
    //     use /api/numbers/purchase
    //   - otherwise import an existing number via /api/numbers/import
    const created = input.number?.startsWith("+")
      ? await numbersService.importNumber({ number: input.number })
      : await numbersService.purchase({
          number: input.number,
          campaignId: input.campaignId,
        });
    set((s) => ({ numbers: [created, ...s.numbers] }));
    return created;
  },

  updateNumber: async (id, patch) => {
    const prev = get().numbers;
    set((s) => ({
      numbers: s.numbers.map((n) => (n.id === id ? { ...n, ...patch } : n)),
    }));
    try {
      const fresh = await numbersService.update(id, patch);
      set((s) => ({
        numbers: s.numbers.map((n) => (n.id === id ? fresh : n)),
      }));
    } catch (e) {
      set({ numbers: prev, error: messageFromError(e) });
      throw e;
    }
  },

  setNumberStatus: async (id, status) => {
    const prev = get().numbers;
    set((s) => ({
      numbers: s.numbers.map((n) => (n.id === id ? { ...n, status } : n)),
    }));
    try {
      await numbersService.update(id, { status });
    } catch (e) {
      set({ numbers: prev, error: messageFromError(e) });
      throw e;
    }
  },

  removeNumber: async (id) => {
    const prev = get().numbers;
    set((s) => ({ numbers: s.numbers.filter((n) => n.id !== id) }));
    try {
      await numbersService.release(id);
    } catch (e) {
      set({ numbers: prev, error: messageFromError(e) });
      throw e;
    }
  },

  /* ─── Pools ──────────────────────────────────────────────────────── */

  addPool: async (input) => {
    const created = await poolsService.create(input);
    set((s) => ({ pools: [created, ...s.pools] }));
    return created;
  },

  updatePool: async (id, patch) => {
    const prev = get().pools;
    set((s) => ({
      pools: s.pools.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
    try {
      const fresh = await poolsService.update(id, patch);
      set((s) => ({
        pools: s.pools.map((p) => (p.id === id ? fresh : p)),
      }));
    } catch (e) {
      set({ pools: prev, error: messageFromError(e) });
      throw e;
    }
  },

  setPoolActive: async (id, active) => {
    const prev = get().pools;
    set((s) => ({
      pools: s.pools.map((p) => (p.id === id ? { ...p, active } : p)),
    }));
    try {
      await poolsService.update(id, { active });
    } catch (e) {
      set({ pools: prev, error: messageFromError(e) });
      throw e;
    }
  },

  removePool: async (id) => {
    const prev = get().pools;
    set((s) => ({ pools: s.pools.filter((p) => p.id !== id) }));
    try {
      await poolsService.remove(id);
    } catch (e) {
      set({ pools: prev, error: messageFromError(e) });
      throw e;
    }
  },
}));

function messageFromError(e: unknown): string {
  if (e instanceof Error) return e.message;
  return "Numbers request failed";
}
