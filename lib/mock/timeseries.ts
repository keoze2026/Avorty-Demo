/**
 * Deterministic time-series fixtures for dashboard charts.
 * Same seed → same data so SSR and hydration agree.
 */

import { MOCK_CAMPAIGNS } from "./campaigns";

function rng(seed: number) {
  // Tiny LCG so values are stable
  return ((seed * 9301 + 49297) % 233280) / 233280;
}

export interface HourPoint {
  /** 0–23 */
  hour: number;
  label: string;
  revenue: number;
  calls: number;
  conversions: number;
}

/**
 * 24h of data — hand-tuned to **exactly** mirror the advertising reference:
 *
 *   8 AM   181    ramp begins
 *   9 AM   267
 *  10 AM   444
 *  11 AM   607
 *  12 PM   587    (slight lunch dip)
 *   1 PM   961
 *   2 PM 1,029    ← PEAK
 *   3 PM   697
 *   4 PM   688
 *   5 PM    59    (sharp cliff)
 *   6 PM    55
 *
 * No traffic outside the 8 AM–6 PM window. Totals: **5,575 calls /
 * 4,544 conversions (81.5%) / $284,959 revenue**. Per-conversion revenue
 * averages $62.71 (matches campaign payouts × 1.18 buyer margin so the
 * dashboard, reports, and marketing hero card all read "$285K Revenue
 * today").
 */
export const TODAY_HOURLY: HourPoint[] = (() => {
  const buckets: Array<[number, number, number]> = [
    // [calls, conversions, revenue]
    [0, 0, 0],            // 12 AM
    [0, 0, 0],            // 1  AM
    [0, 0, 0],            // 2  AM
    [0, 0, 0],            // 3  AM
    [0, 0, 0],            // 4  AM
    [0, 0, 0],            // 5  AM
    [0, 0, 0],            // 6  AM
    [0, 0, 0],            // 7  AM
    [181, 148, 9281],     // 8  AM — ramp begins
    [267, 218, 13670],    // 9  AM
    [444, 362, 22701],    // 10 AM
    [607, 495, 31041],    // 11 AM
    [587, 478, 29977],    // 12 PM — lunch dip
    [961, 783, 49083],    // 1  PM
    [1029, 839, 52612],   // 2  PM — PEAK
    [697, 568, 35619],    // 3  PM
    [688, 561, 35178],    // 4  PM
    [59, 48, 3010],       // 5  PM — cliff
    [55, 45, 2822],       // 6  PM
    [0, 0, 0],            // 7  PM
    [0, 0, 0],            // 8  PM
    [0, 0, 0],            // 9  PM
    [0, 0, 0],            // 10 PM
    [0, 0, 0],            // 11 PM
  ];
  return buckets.map(([calls, conversions, revenue], i) => ({
    hour: i,
    label: `${i.toString().padStart(2, "0")}:00`,
    calls,
    conversions,
    revenue,
  }));
})();

export interface DayPoint {
  /** Days ago (0 = today) */
  offset: number;
  label: string;
  revenue: number;
  calls: number;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Last 14 days, oldest first.
 *
 *   • Day 0 (14d ago)   : ~$210K / ~4,100 calls
 *   • Day 13 (Today)    : ~$285K / ~5,578 calls
 *
 * Clean upward trend so the 14-day revenue chart reads as a growth story
 * that lines up with today's headline ($285K) and the 24h bell curve. */
export const LAST_14_DAYS: DayPoint[] = Array.from({ length: 14 }, (_, i) => {
  const offset = 13 - i;
  const base = 210_000 + i * 5_770; // day 0 = $210k → day 13 ≈ $285k
  const noise = (rng(i + 1) - 0.5) * 12_000;
  const revenue = Math.max(180_000, Math.round(base + noise));
  // Avg ~$51 per call (revenue ÷ total calls when 81.5% convert at $62.7/conv).
  const calls = Math.round(revenue / (48 + rng(i + 3) * 6));
  const date = new Date();
  date.setDate(date.getDate() - offset);
  const dayIdx = date.getDay();
  return {
    offset,
    label: offset === 0 ? "Today" : DAY_NAMES[dayIdx],
    revenue,
    calls,
  };
});

/** State-level distribution for the dashboard geo widget. */
export interface GeoPoint {
  state: string;
  name: string;
  calls: number;
  revenue: number;
}

/** Top 6 states by today's call volume. Together they cover ~70% of the
 *  5,578 daily calls / $285K revenue figure used everywhere else, with
 *  per-state per-call revenue averaging ~$51 to stay consistent. */
export const GEO_DISTRIBUTION: GeoPoint[] = [
  { state: "TX", name: "Texas",        calls: 1_072, revenue: 54_672 },
  { state: "CA", name: "California",   calls:   943, revenue: 48_093 },
  { state: "FL", name: "Florida",      calls:   703, revenue: 35_853 },
  { state: "NY", name: "New York",     calls:   546, revenue: 27_846 },
  { state: "PA", name: "Pennsylvania", calls:   360, revenue: 18_360 },
  { state: "OH", name: "Ohio",         calls:   277, revenue: 14_127 },
];

/** Sparkline series (8 points) per KPI. */
export function makeSparkline(seed: number, len = 8, base = 50, jitter = 30) {
  return Array.from({ length: len }).map((_, i) => ({
    i,
    v: Math.round(base + (rng(seed + i) - 0.4) * jitter + i * 1.2),
  }));
}

/** Top campaigns sorted by revenueToday. */
export function topCampaignsByRevenue(limit = 4) {
  return [...MOCK_CAMPAIGNS]
    .sort((a, b) => b.revenueToday - a.revenueToday)
    .slice(0, limit);
}

/** AI recommendation cards. */
export interface Recommendation {
  id: string;
  kind: "scale" | "pause" | "rebalance" | "alert";
  title: string;
  body: string;
  impact: string;
}

export const AI_RECOMMENDATIONS: Recommendation[] = [
  {
    id: "r1",
    kind: "scale",
    title: "Scale Health Tier 1 publishers",
    body: "Conversion is +24% over the last 6h with budget headroom on 3 buyers.",
    impact: "+$1,840 / day projected",
  },
  {
    id: "r2",
    kind: "pause",
    title: "Pause Auto Warranty in OH, MI",
    body: "Acceptance is below 18% in those geos for the past 48h.",
    impact: "Save $620 / day",
  },
  {
    id: "r3",
    kind: "rebalance",
    title: "Rebalance Solar to morning slots",
    body: "07:00–11:00 calls convert 2.3× higher than the overall average.",
    impact: "+11% conversion",
  },
  {
    id: "r4",
    kind: "alert",
    title: "Buyer Apex hit daily cap early",
    body: "Routing currently bypassing — consider raising the cap or adding a backup buyer.",
    impact: "32 calls / day at risk",
  },
];
