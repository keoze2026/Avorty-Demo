"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { DEFAULT_ACCENT_ID } from "@/lib/accent-themes";

interface AccentState {
  accent: string;
  setAccent: (id: string) => void;
}

export const useAccentStore = create<AccentState>()(
  persist(
    (set) => ({
      accent: DEFAULT_ACCENT_ID,
      setAccent: (id) => set({ accent: id }),
    }),
    {
      name: "vortyx.accent",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
