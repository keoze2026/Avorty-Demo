/**
 * Shared Recharts tooltip styling. Spread these onto a <Tooltip /> to get
 * theme-aware popover surfaces with high-contrast text in light AND dark mode.
 *
 * Why this exists: Recharts' DefaultTooltipContent sets `backgroundColor: '#fff'`
 * and each item's text color defaults to the series color, which can vanish on
 * a dark popover background. We override both explicitly with popover tokens.
 *
 * Use `backgroundColor` (not the `background` shorthand) so it overrides
 * Recharts' default cleanly when React merges inline styles.
 */
export const CHART_TOOLTIP_PROPS = {
  contentStyle: {
    backgroundColor: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    fontSize: 12,
    color: "var(--popover-foreground)",
    boxShadow: "0 4px 12px rgb(0 0 0 / 0.12)",
    padding: "8px 12px",
  },
  itemStyle: {
    color: "var(--popover-foreground)",
    padding: 0,
  },
  labelStyle: {
    color: "var(--muted-foreground)",
    fontSize: 11,
    marginBottom: 4,
  },
} as const;
