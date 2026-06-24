/**
 * Per-user read-state for notification rows.
 *
 * The backend's notification surfaces (AI anomalies + recommendations) don't
 * carry a per-row "read" flag — read state is a pure UI concern that lives
 * client-side. Persisted to localStorage so flips survive a refresh and stay
 * in sync between the topbar dropdown and the /notifications page.
 *
 * Storage shape is a plain object so JSON.stringify round-trips cleanly
 * (Sets don't serialize). Lookups are O(1) via `readIds[id]`.
 */

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface NotificationsReadState {
  readIds: Record<string, true>;
  /** Flag a single notification id as read. */
  markRead: (id: string) => void;
  /** Bulk flag — used by the "Mark all read" button. Idempotent. */
  markAllRead: (ids: string[]) => void;
  /** Test/debug helper — drop all read flags. */
  clearAll: () => void;
}

export const useNotificationsReadStore = create<NotificationsReadState>()(
  persist(
    (set) => ({
      readIds: {},
      markRead: (id) =>
        set((s) => (s.readIds[id] ? s : { readIds: { ...s.readIds, [id]: true } })),
      markAllRead: (ids) =>
        set((s) => {
          const next = { ...s.readIds };
          let changed = false;
          for (const id of ids) {
            if (!next[id]) {
              next[id] = true;
              changed = true;
            }
          }
          return changed ? { readIds: next } : s;
        }),
      clearAll: () => set({ readIds: {} }),
    }),
    {
      name: "vortyx.notifications.read",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
