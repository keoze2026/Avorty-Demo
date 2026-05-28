/**
 * Chart palette — strict two-color binary.
 *
 *   indigo (slot 0) → positive / highlighted outcomes
 *   red    (slot 1) → negative / failure outcomes
 *
 * Lighter intensity variants (slots 2-4) ride the same two hues at reduced
 * opacity so adjacent series stay distinguishable inside the binary system.
 *
 * Use `var(--accent)` / `var(--destructive)` from CSS variables when possible;
 * this array exists for places that need a literal color string (Recharts
 * <Cell> fills, gradient stops, SVG strokes).
 */

export const DASHBOARD_PALETTE = [
  "var(--accent)",            // indigo — positive (slot 0)
  "var(--destructive)",       // red — negative (slot 1)
  "color-mix(in oklab, var(--accent) 70%, transparent)",      // softened indigo
  "color-mix(in oklab, var(--destructive) 60%, transparent)", // softened red
  "var(--muted-foreground)",  // neutral fallback
] as const;

export function paletteAt(i: number) {
  return DASHBOARD_PALETTE[i % DASHBOARD_PALETTE.length];
}
