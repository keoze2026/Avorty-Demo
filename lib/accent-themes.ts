/**
 * Color-theme registry.
 *
 * Each entry maps to one of the `.theme-*` classes defined in globals.css.
 * Selecting an entry swaps the full palette — background, foreground, cards,
 * sidebar, borders, ring, accent, chart-1 — across both light and dark mode.
 * "Default" is the original Vortyx Indigo+slate look (no class applied).
 */

export interface ColorTheme {
  /** Stable id stored in localStorage. */
  id: string;
  /** Human-readable label shown in the picker. */
  name: string;
  /** Solid color used for the swatch dot. */
  swatch: string;
  /** Class added to <html>. Empty string = use base :root/.dark tokens. */
  className: string;
}

export const ACCENTS: ColorTheme[] = [
  {
    id: "default",
    name: "Default (Indigo)",
    swatch: "#5266E0",
    className: "",
  },
  {
    id: "red",
    name: "Red",
    swatch: "#DC2626",
    className: "theme-red",
  },
  {
    id: "amber",
    name: "Amber",
    swatch: "#F59E0B",
    className: "theme-amber",
  },
  {
    id: "emerald",
    name: "Emerald",
    swatch: "#10B981",
    className: "theme-emerald",
  },
  {
    id: "violet",
    name: "Violet",
    swatch: "#8B5CF6",
    className: "theme-violet",
  },
  {
    id: "cyan",
    name: "Cyan",
    swatch: "#06B6D4",
    className: "theme-cyan",
  },
  {
    id: "rose",
    name: "Rose",
    swatch: "#F43F5E",
    className: "theme-rose",
  },
  {
    id: "lime",
    name: "Lime",
    swatch: "#84CC16",
    className: "theme-lime",
  },
  {
    id: "orange",
    name: "Orange",
    swatch: "#F97316",
    className: "theme-orange",
  },
  {
    id: "sky",
    name: "Sky",
    swatch: "#0EA5E9",
    className: "theme-sky",
  },
  {
    id: "teal",
    name: "Teal",
    swatch: "#14B8A6",
    className: "theme-teal",
  },
  {
    id: "fuchsia",
    name: "Fuchsia",
    swatch: "#D946EF",
    className: "theme-fuchsia",
  },
  {
    id: "yellow",
    name: "Yellow",
    swatch: "#EAB308",
    className: "theme-yellow",
  },
  {
    id: "slate",
    name: "Slate",
    swatch: "#64748B",
    className: "theme-slate",
  },
  {
    id: "mono",
    name: "Pure Black",
    swatch: "#000000",
    className: "theme-mono",
  },
];

export const DEFAULT_ACCENT_ID = "default";

export function findAccent(id: string | undefined): ColorTheme {
  return ACCENTS.find((a) => a.id === id) ?? ACCENTS[0];
}

/** Every class we ever add — used by the provider to wipe stale state. */
export const ALL_THEME_CLASSES = ACCENTS.map((a) => a.className).filter(
  (c) => c.length > 0,
);
