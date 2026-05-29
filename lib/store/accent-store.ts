"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { ACCENTS, DEFAULT_ACCENT_ID } from "@/lib/accent-themes";

interface AccentState {
  accent: string;
  setAccent: (id: string) => void;
}

const VALID_IDS = new Set(ACCENTS.map((a) => a.id));

export const useAccentStore = create<AccentState>()(
  persist(
    (set) => ({
      accent: DEFAULT_ACCENT_ID,
      setAccent: (id) => set({ accent: id }),
    }),
    {
      name: "vortyx.accent",
      storage: createJSONStorage(() => localStorage),
      // v2: switched from accent-only picker (indigo/red/amber/emerald/cyan/
      // violet/rose) to full color themes (default/red/amber/emerald/violet).
      // Any unknown id rehydrates to the default theme.
      version: 2,
      migrate: () => ({ accent: DEFAULT_ACCENT_ID }),
      onRehydrateStorage: () => (state) => {
        if (state && !VALID_IDS.has(state.accent)) {
          state.accent = DEFAULT_ACCENT_ID;
        }
      },
    },
  ),
);
