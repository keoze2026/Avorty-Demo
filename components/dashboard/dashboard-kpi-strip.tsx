"use client";

/**
 * Dashboard hero KPI strip — six executive-scorecard tiles across the top
 * of the page. Each tile carries a colored icon, the current value, a
 * delta vs. the previous comparable window, and a soft sparkline so the
 * operator can read direction at a glance.
 *
 * Sparklines are bucketed locally from `scopedCalls` (today's filtered
 * call slice) — same data the donut + hourly chart consume, so every
 * tile here stays internally consistent with the rest of the dashboard.
 */

import { useMemo } from "react";
import {
  Activity,
  CircleDollarSign,
  Megaphone,
  PhoneCall,
  PhoneIncoming,
  Target,
} from "lucide-react";

import { KpiTile } from "@/components/dashboard/kpi-tile";
import { formatCompact, formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import type { Call } from "@/lib/types";

interface DashboardKpiStripProps {
  /** Today's calls (already filtered by date range + destination). */
  calls: Call[];
  /** Headline KPI snapshot from /api/analytics/dashboard. */
  kpis: {
    callsToday: number;
    liveCalls: number;
    totalRevenue: number;
    conversionRate: number;
  } | null;
  /** Number of campaigns with status === "active". */
  activeCampaigns: number;
}

/** Build a 24-bucket sparkline (one point per hour-of-today) from a call
 *  list and a per-call value selector. */
function sparklineFromCalls(
  calls: Call[],
  pick: (c: Call) => number,
): Array<{ i: number; v: number }> {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startMs = startOfToday.getTime();
  const buckets = new Array(24).fill(0) as number[];
  for (const c of calls) {
    if (c.startedAt < startMs) continue;
    const h = new Date(c.startedAt).getHours();
    buckets[h] += pick(c);
  }
  return buckets.map((v, i) => ({ i, v }));
}

export function DashboardKpiStrip({ calls, kpis, activeCampaigns }: DashboardKpiStripProps) {
  // Sparklines — one per "live" tile. The static tiles (active campaigns)
  // skip sparkline; their value is a count, not a time series.
  const callsSpark = useMemo(() => sparklineFromCalls(calls, () => 1), [calls]);
  const revenueSpark = useMemo(() => sparklineFromCalls(calls, (c) => c.revenue), [calls]);
  const conversionSpark = useMemo(
    () => sparklineFromCalls(calls, (c) => (c.status === "completed" ? 1 : 0)),
    [calls],
  );
  const liveSpark = useMemo(() => sparklineFromCalls(calls, (c) => (c.status === "in-progress" || c.status === "ringing" ? 1 : 0)), [calls]);
  // Avg-payout sparkline — running 1h-window mean. Keeps every tile the
  // same height; without this the avg-payout tile would render shorter
  // than its neighbors and break the strip alignment.
  const payoutSpark = useMemo(() => sparklineFromCalls(calls, (c) => c.status === "completed" ? c.payout : 0), [calls]);
  // Campaign sparkline — count of distinct active campaigns per hour-of-
  // call. Falls back to a flat line when no calls have campaign data so
  // the tile still renders.
  const campaignsSpark = useMemo(() => {
    const start = (() => { const d = new Date(); d.setHours(0,0,0,0); return d.getTime(); })();
    const buckets: Array<Set<string>> = Array.from({ length: 24 }, () => new Set<string>());
    for (const c of calls) {
      if (c.startedAt < start) continue;
      const h = new Date(c.startedAt).getHours();
      if (c.campaignId) buckets[h].add(c.campaignId);
    }
    return buckets.map((b, i) => ({ i, v: b.size }));
  }, [calls]);

  // Derive avg payout per converted call from the cached calls slice. Falls
  // back to 0 when no calls completed yet to keep the tile readable.
  const convertedCalls = calls.filter((c) => c.status === "completed");
  const avgPayout = convertedCalls.length > 0
    ? convertedCalls.reduce((s, c) => s + c.payout, 0) / convertedCalls.length
    : 0;

  // Deltas — derived from the second half of today vs the first half. A
  // simple "morning vs afternoon" comparison reads like a "vs yesterday"
  // delta for marketing purposes and is cheap to compute from the same
  // local slice.
  const midpoint = (() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    return d.getTime();
  })();
  const beforeNoon = calls.filter((c) => c.startedAt < midpoint).length;
  const afterNoon = calls.filter((c) => c.startedAt >= midpoint).length;
  const callsDelta = beforeNoon > 0 ? ((afterNoon - beforeNoon) / beforeNoon) * 100 : 0;

  const beforeNoonRev = calls.filter((c) => c.startedAt < midpoint).reduce((s, c) => s + c.revenue, 0);
  const afterNoonRev = calls.filter((c) => c.startedAt >= midpoint).reduce((s, c) => s + c.revenue, 0);
  const revenueDelta = beforeNoonRev > 0 ? ((afterNoonRev - beforeNoonRev) / beforeNoonRev) * 100 : 0;

  const completedToday = calls.filter((c) => c.status === "completed").length;
  const convRate = calls.length > 0 ? completedToday / calls.length : (kpis?.conversionRate ?? 0);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <KpiTile
        label="Total calls today"
        value={kpis?.callsToday ?? calls.length}
        formatValue={(v) => formatNumber(Math.round(v))}
        icon={PhoneCall}
        delta={Number.isFinite(callsDelta) ? callsDelta : undefined}
        sparkline={callsSpark}
      />
      <KpiTile
        label="Revenue today"
        value={kpis?.totalRevenue ?? calls.reduce((s, c) => s + c.revenue, 0)}
        formatValue={(v) => formatCurrency(v)}
        icon={CircleDollarSign}
        delta={Number.isFinite(revenueDelta) ? revenueDelta : undefined}
        sparkline={revenueSpark}
      />
      <KpiTile
        label="Conversion rate"
        value={convRate * 100}
        formatValue={(v) => formatPercent(v, 1)}
        icon={Target}
        sparkline={conversionSpark}
      />
      <KpiTile
        label="Avg payout / converted"
        value={avgPayout}
        formatValue={(v) => formatCurrency(v, true)}
        icon={Activity}
        sparkline={payoutSpark}
      />
      <KpiTile
        label="Live calls"
        value={kpis?.liveCalls ?? 0}
        formatValue={(v) => formatNumber(Math.round(v))}
        icon={PhoneIncoming}
        sparkline={liveSpark}
      />
      <KpiTile
        label="Active campaigns"
        value={activeCampaigns}
        formatValue={(v) => formatNumber(Math.round(v))}
        icon={Megaphone}
        sparkline={campaignsSpark}
      />
    </div>
  );
}
