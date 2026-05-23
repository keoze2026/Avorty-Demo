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

/** 24h of data (most recent hour last). */
export const TODAY_HOURLY: HourPoint[] = Array.from({ length: 24 }, (_, i) => {
  const wave = Math.sin((i / 24) * Math.PI * 2 - Math.PI / 2) + 1.2; // ~0.2..2.2
  const noise = rng(i + 7) * 0.4 + 0.8;
  const calls = Math.round(wave * 28 * noise + 8);
  const conversions = Math.round(calls * (0.32 + rng(i + 11) * 0.18));
  const revenue = Math.round(conversions * (28 + rng(i + 21) * 12));
  return {
    hour: i,
    label: `${i.toString().padStart(2, "0")}:00`,
    calls,
    conversions,
    revenue,
  };
});

export interface DayPoint {
  /** Days ago (0 = today) */
  offset: number;
  label: string;
  revenue: number;
  calls: number;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Last 14 days, oldest first. */
export const LAST_14_DAYS: DayPoint[] = Array.from({ length: 14 }, (_, i) => {
  const offset = 13 - i;
  const base = 9_000 + i * 380;
  const noise = (rng(i + 1) - 0.5) * 2_500;
  const revenue = Math.max(2000, Math.round(base + noise));
  const calls = Math.round(revenue / (28 + rng(i + 3) * 14));
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

export const GEO_DISTRIBUTION: GeoPoint[] = [
  { state: "TX", name: "Texas", calls: 312, revenue: 13_260 },
  { state: "CA", name: "California", calls: 287, revenue: 12_140 },
  { state: "FL", name: "Florida", calls: 198, revenue: 8_910 },
  { state: "NY", name: "New York", calls: 164, revenue: 7_380 },
  { state: "PA", name: "Pennsylvania", calls: 122, revenue: 5_490 },
  { state: "OH", name: "Ohio", calls: 96, revenue: 4_320 },
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
