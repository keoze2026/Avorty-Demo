/**
 * Locale registry — the single source of truth for supported languages.
 *
 * Add a new locale by:
 *   1. Appending an entry here (id, label, flag).
 *   2. Creating `lib/i18n/translations/<id>.ts` exporting a Translation map.
 *   3. Importing + registering it in `lib/i18n/index.ts`.
 */

export type LocaleId = "en" | "ru" | "ja";

export interface LocaleDef {
  id: LocaleId;
  /** Native-language name shown in the picker. */
  label: string;
  /** Short English name, used for tooltips. */
  english: string;
  /** Two-letter ISO 639 code for `<html lang>`. */
  htmlLang: string;
  /** Flag emoji for the picker chip. */
  flag: string;
}

export const LOCALES: LocaleDef[] = [
  { id: "en", label: "English",  english: "English",  htmlLang: "en", flag: "🇺🇸" },
  { id: "ru", label: "Русский",  english: "Russian",  htmlLang: "ru", flag: "🇷🇺" },
  { id: "ja", label: "日本語",     english: "Japanese", htmlLang: "ja", flag: "🇯🇵" },
];

export const DEFAULT_LOCALE: LocaleId = "en";

export function findLocale(id: string | undefined): LocaleDef {
  return LOCALES.find((l) => l.id === id) ?? LOCALES[0];
}
