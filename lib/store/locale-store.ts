/**
 * Locale store — persists the active language to localStorage and exposes
 * `setLocale` for the language picker. Mirrors the existing accent-store
 * pattern so themes and language share one mental model.
 */

"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  DEFAULT_LOCALE,
  LOCALES,
  type LocaleId,
} from "@/lib/i18n/locales";

interface State {
  locale: LocaleId;
  setLocale: (locale: LocaleId) => void;
}

const VALID = new Set<LocaleId>(LOCALES.map((l) => l.id));

export const useLocaleStore = create<State>()(
  persist(
    (set) => ({
      locale: DEFAULT_LOCALE,
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: "vortyx.locale",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (state && !VALID.has(state.locale)) {
          state.locale = DEFAULT_LOCALE;
        }
      },
    },
  ),
);
