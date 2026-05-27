/**
 * Dashboard chart palette — tetrad spread evenly around the OKLCH hue wheel,
 * at consistent lightness/chroma so the colors read as one harmonious family.
 *
 *  amber  75°  ─┐
 *  teal  165°   │  ~90° between each pair
 *  azure 230°   │  L ≈ 0.68–0.78
 *  indigo 280°  │  C ≈ 0.15–0.22
 *  magenta 320° ─┘
 *
 * Order is deterministic — map verticals/series to slots by index so the
 * same series shows the same color across every chart on the page.
 */

export const DASHBOARD_PALETTE = [
  "oklch(0.72 0.15 165)", // teal — slot 0
  "oklch(0.68 0.18 230)", // azure — slot 1
  "oklch(0.65 0.22 280)", // indigo — slot 2
  "oklch(0.78 0.16 75)", // amber — slot 3
  "oklch(0.70 0.20 320)", // magenta — slot 4
] as const;

export function paletteAt(i: number) {
  return DASHBOARD_PALETTE[i % DASHBOARD_PALETTE.length];
}
