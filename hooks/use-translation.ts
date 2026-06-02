"use client";

/**
 * `useTranslation()` — the only hook components need for i18n.
 *
 *   const { t, locale } = useTranslation();
 *   return <h1>{t("page.dashboard.title")}</h1>;
 *
 * Keys are dotted paths into the translation tree (see
 * `lib/i18n/translations/en.ts` for the full shape). Missing keys fall back
 * to English, then to the raw key, so partial translations never blank out
 * the UI.
 */

import * as React from "react";

import { tFor } from "@/lib/i18n";
import type { LocaleId } from "@/lib/i18n/locales";
import { useLocaleStore } from "@/lib/store/locale-store";

interface UseTranslation {
  t: (key: string) => string;
  locale: LocaleId;
  setLocale: (locale: LocaleId) => void;
}

export function useTranslation(): UseTranslation {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  const t = React.useCallback((key: string) => tFor(locale, key), [locale]);

  return { t, locale, setLocale };
}
