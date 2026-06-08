/**
 * Publishers store — backed by /api/publishers/*.
 * Mirrors the buyers + campaigns store pattern. Payout history stays
 * client-side until a /api/publishers/{id}/payouts endpoint is added.
 */

"use client";

import { create } from "zustand";

import { publishersService } from "@/lib/api/services/publishers.service";
import { MOCK_PAYOUTS } from "@/lib/mock/publishers";
import type { PayoutRecord, Publisher, PublisherStatus } from "@/lib/types";

interface PublishersState {
  publishers: Publisher[];
  /** Payout history is not yet exposed by the backend — kept as demo data. */
  payouts: PayoutRecord[];
  loading: boolean;
  error: string | null;
  hydrated: boolean;

  fetch: () => Promise<void>;
  getById: (id: string) => Publisher | undefined;
  payoutsFor: (publisherId: string) => PayoutRecord[];
  add: (input: Omit<Publisher, "id" | "createdAt">) => Promise<Publisher>;
  update: (id: string, patch: Partial<Publisher>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setStatus: (id: string, status: PublisherStatus) => Promise<void>;
}

export const usePublishersStore = create<PublishersState>()((set, get) => ({
  publishers: [],
  payouts: MOCK_PAYOUTS,
  loading: false,
  error: null,
  hydrated: false,

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const page = await publishersService.list({ page: 1, pageSize: 200 });
      set({ publishers: page.items, loading: false, hydrated: true });
    } catch (e) {
      set({ loading: false, error: messageFromError(e) });
    }
  },

  getById: (id) => get().publishers.find((p) => p.id === id),

  payoutsFor: (publisherId) =>
    get()
      .payouts.filter((r) => r.publisherId === publisherId)
      .sort((a, b) => b.scheduledFor - a.scheduledFor),

  add: async (input) => {
    const created = await publishersService.create(input);
    set((s) => ({ publishers: [created, ...s.publishers] }));
    return created;
  },

  update: async (id, patch) => {
    const prev = get().publishers;
    set((s) => ({
      publishers: s.publishers.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
    try {
      const fresh = await publishersService.update(id, patch);
      set((s) => ({
        publishers: s.publishers.map((p) => (p.id === id ? fresh : p)),
      }));
    } catch (e) {
      set({ publishers: prev, error: messageFromError(e) });
      throw e;
    }
  },

  remove: async (id) => {
    const prev = get().publishers;
    set((s) => ({ publishers: s.publishers.filter((p) => p.id !== id) }));
    try {
      await publishersService.remove(id);
    } catch (e) {
      set({ publishers: prev, error: messageFromError(e) });
      throw e;
    }
  },

  setStatus: async (id, status) => {
    const prev = get().publishers;
    set((s) => ({
      publishers: s.publishers.map((p) => (p.id === id ? { ...p, status } : p)),
    }));
    try {
      await publishersService.setStatus(id, status);
    } catch (e) {
      set({ publishers: prev, error: messageFromError(e) });
      throw e;
    }
  },
}));

function messageFromError(e: unknown): string {
  if (e instanceof Error) return e.message;
  return "Publishers request failed";
}
