/**
 * Hourly / daily bucket helpers used by the dashboard charts when they need
 * to re-aggregate from a *filtered* set of calls (e.g. destination scope).
 *
 * The shapes are intentionally compatible with TODAY_HOURLY / LAST_14_DAYS in
 * lib/mock/timeseries.ts, so the charts can switch between static seeded data
 * and freshly bucketed data without any other changes.
 */

import type { Call } from "@/lib/types";

const DAY_MS = 1000 * 60 * 60 * 24;
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export interface HourBucket {
  hour: number;
  label: string;
  calls: number;
  conversions: number;
  revenue: number;
}

export interface DayBucket {
  offset: number;
  label: string;
  calls: number;
  conversions: number;
  revenue: number;
}

/** 24 buckets, one per hour of today (local time). */
export function bucketHourly(calls: Call[]): HourBucket[] {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const buckets: HourBucket[] = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    label: `${h.toString().padStart(2, "0")}:00`,
    calls: 0,
    conversions: 0,
    revenue: 0,
  }));
  for (const c of calls) {
    if (c.startedAt < start.getTime()) continue;
    const h = new Date(c.startedAt).getHours();
    buckets[h].calls += 1;
    buckets[h].revenue += c.revenue;
    if (c.status === "completed") buckets[h].conversions += 1;
  }
  return buckets;
}

/** N daily buckets ending today (oldest first, today last). */
export function bucketDaily(calls: Call[], days: number): DayBucket[] {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const buckets: DayBucket[] = Array.from({ length: days }, (_, i) => {
    const d = new Date(start.getTime() - (days - 1 - i) * DAY_MS);
    return {
      offset: days - 1 - i,
      label: i === days - 1 ? "Today" : DAY_NAMES[d.getDay()],
      calls: 0,
      conversions: 0,
      revenue: 0,
    };
  });
  for (const c of calls) {
    const d = new Date(c.startedAt);
    d.setHours(0, 0, 0, 0);
    const offsetDays = Math.round((start.getTime() - d.getTime()) / DAY_MS);
    if (offsetDays < 0 || offsetDays >= days) continue;
    const idx = days - 1 - offsetDays;
    buckets[idx].calls += 1;
    buckets[idx].revenue += c.revenue;
    if (c.status === "completed") buckets[idx].conversions += 1;
  }
  return buckets;
}
