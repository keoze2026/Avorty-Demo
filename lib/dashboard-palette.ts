/**
 * Dashboard chart palette — leads with the brand indigo (#7064f2 ≈ 280°),
 * then spreads ~90° around the hue wheel for distinct-but-harmonious series.
 *
 *   indigo  280° ─┐
 *   azure   230°  │  L ≈ 0.62–0.78
 *   pink    330°  │  C ≈ 0.16–0.22
 *   amber    75° ─┤
 *   teal    165° ─┘
 *
 * Order is deterministic — map verticals/series to slots by index so the
 * same series shows the same color across every chart on the page.
 */

export const DASHBOARD_PALETTE = [
  "oklch(0.62 0.22 280)", // indigo — brand (slot 0)
  "oklch(0.68 0.18 230)", // azure  — slot 1
  "oklch(0.70 0.20 330)", // pink   — slot 2
  "oklch(0.78 0.16 75)",  // amber  — slot 3
  "oklch(0.72 0.15 165)", // teal   — slot 4
] as const;

export function paletteAt(i: number) {
  return DASHBOARD_PALETTE[i % DASHBOARD_PALETTE.length];
}
