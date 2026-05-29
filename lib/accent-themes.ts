/**
 * Accent palette registry.
 *
 * Each entry maps to a complete `--accent` swap on the document root.
 * The first item (Indigo) is the original Vortyx brand color, kept as the
 * default. Operators can pick a different hue from the topbar theme picker;
 * the selection is persisted via the accent Zustand store.
 */

export interface AccentConfig {
  /** Stable id stored in localStorage. */
  id: string;
  /** Human-readable label shown in the picker. */
  name: string;
  /** Solid color used for the swatch dot. */
  swatch: string;
  /** Computed `--accent` value (HSL token). */
  accent: string;
  /** Foreground color paired with the accent — keeps text legible on accent fills. */
  accentForeground: string;
}

export const ACCENTS: AccentConfig[] = [
  {
    id: "indigo",
    name: "Indigo (default)",
    swatch: "#5266E0",
    accent: "hsl(231 70% 58%)",
    accentForeground: "hsl(0 0% 100%)",
  },
  {
    id: "red",
    name: "Red",
    swatch: "#DC2626",
    accent: "hsl(0 72% 51%)",
    accentForeground: "hsl(0 0% 100%)",
  },
  {
    id: "amber",
    name: "Amber",
    swatch: "#F59E0B",
    accent: "hsl(38 92% 50%)",
    accentForeground: "hsl(0 0% 11%)",
  },
  {
    id: "emerald",
    name: "Emerald",
    swatch: "#10B981",
    accent: "hsl(160 70% 42%)",
    accentForeground: "hsl(0 0% 100%)",
  },
  {
    id: "cyan",
    name: "Cyan",
    swatch: "#06B6D4",
    accent: "hsl(190 80% 45%)",
    accentForeground: "hsl(0 0% 100%)",
  },
  {
    id: "violet",
    name: "Violet",
    swatch: "#8B5CF6",
    accent: "hsl(263 70% 60%)",
    accentForeground: "hsl(0 0% 100%)",
  },
  {
    id: "rose",
    name: "Rose",
    swatch: "#F43F5E",
    accent: "hsl(346 77% 60%)",
    accentForeground: "hsl(0 0% 100%)",
  },
];

export const DEFAULT_ACCENT_ID = "indigo";

export function findAccent(id: string | undefined): AccentConfig {
  return ACCENTS.find((a) => a.id === id) ?? ACCENTS[0];
}
