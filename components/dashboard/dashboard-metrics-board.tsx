"use client";

/**
 * Dashboard metrics board — replaces the 6-tile KPI strip with a single
 * dense data table that reads like a trading-floor metrics panel. Each
 * row carries: a colored status dot, the metric label, the current
 * value, a 24-hour micro-sparkline, a change-delta chip, and a "vs peak"
 * progress bar showing how close the metric is to today's hourly high.
 *
 * Why a table instead of tiles: the client asked for something more
 * distinctive than another row of cards. A table-style layout reads as
 * a unified board (one composition), packs more information per pixel,
 * and gives the page a more sophisticated information-density rhythm
 * — closer to Bloomberg/Stripe than to bento dashboards.
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  CircleDollarSign,
  Megaphone,
  PhoneCall,
  PhoneIncoming,
  Target,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
} from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import type { Call } from "@/lib/types";
import { cn } from "@/lib/utils";

interface DashboardMetricsBoardProps {
  calls: Call[];
  kpis: {
    callsToday: number;
    liveCalls: number;
    totalRevenue: number;
    conversionRate: number;
  } | null;
  activeCampaigns: number;
}

type AccentKey = "indigo" | "emerald" | "violet" | "orange" | "rose" | "amber";

interface MetricRow {
  key: string;
  accent: AccentKey;
  icon: LucideIcon;
  label: string;
  value: number;
  formattedValue: string;
  spark: Array<{ i: number; v: number }>;
  delta: number;
  /** Today's current value as a fraction of the 24h peak for this metric (0–1). */
  vsPeak: number;
}

const ACCENT_DOT: Record<AccentKey, string> = {
  indigo: "bg-[oklch(0.6_0.2_265)]",
  emerald: "bg-[oklch(0.62_0.18_155)]",
  violet: "bg-[oklch(0.6_0.2_290)]",
  orange: "bg-[oklch(0.7_0.18_50)]",
  rose: "bg-[oklch(0.62_0.2_15)]",
  amber: "bg-[oklch(0.78_0.16_75)]",
};

const ACCENT_STROKE: Record<AccentKey, string> = {
  indigo: "oklch(0.6 0.2 265)",
  emerald: "oklch(0.62 0.18 155)",
  violet: "oklch(0.6 0.2 290)",
  orange: "oklch(0.7 0.18 50)",
  rose: "oklch(0.62 0.2 15)",
  amber: "oklch(0.78 0.16 75)",
};

const ACCENT_BAR: Record<AccentKey, string> = {
  indigo: "from-[oklch(0.6_0.2_265)]/40 to-[oklch(0.6_0.2_265)]",
  emerald: "from-[oklch(0.62_0.18_155)]/40 to-[oklch(0.62_0.18_155)]",
  violet: "from-[oklch(0.6_0.2_290)]/40 to-[oklch(0.6_0.2_290)]",
  orange: "from-[oklch(0.7_0.18_50)]/40 to-[oklch(0.7_0.18_50)]",
  rose: "from-[oklch(0.62_0.2_15)]/40 to-[oklch(0.62_0.2_15)]",
  amber: "from-[oklch(0.78_0.16_75)]/40 to-[oklch(0.78_0.16_75)]",
};

const ACCENT_ICON_TEXT: Record<AccentKey, string> = {
  indigo: "text-[oklch(0.58_0.2_265)] dark:text-[oklch(0.78_0.2_265)]",
  emerald: "text-[oklch(0.55_0.18_155)] dark:text-[oklch(0.78_0.18_155)]",
  violet: "text-[oklch(0.58_0.2_290)] dark:text-[oklch(0.78_0.2_290)]",
  orange: "text-[oklch(0.6_0.18_50)] dark:text-[oklch(0.78_0.18_50)]",
  rose: "text-[oklch(0.58_0.2_15)] dark:text-[oklch(0.78_0.2_15)]",
  amber: "text-[oklch(0.6_0.16_75)] dark:text-[oklch(0.82_0.16_75)]",
};

/** Build a 24-bucket time series from a call list. */
function bucketize(calls: Call[], pick: (c: Call) => number): number[] {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startMs = startOfToday.getTime();
  const out = new Array(24).fill(0) as number[];
  for (const c of calls) {
    if (c.startedAt < startMs) continue;
    const h = new Date(c.startedAt).getHours();
    out[h] += pick(c);
  }
  return out;
}

/** Same as bucketize but track a SET per bucket (used for "distinct
 *  campaigns active per hour"). */
function bucketizeSet(calls: Call[], pick: (c: Call) => string | null | undefined): number[] {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startMs = startOfToday.getTime();
  const sets: Array<Set<string>> = Array.from({ length: 24 }, () => new Set<string>());
  for (const c of calls) {
    if (c.startedAt < startMs) continue;
    const h = new Date(c.startedAt).getHours();
    const k = pick(c);
    if (k) sets[h].add(k);
  }
  return sets.map((s) => s.size);
}

export function DashboardMetricsBoard({ calls, kpis, activeCampaigns }: DashboardMetricsBoardProps) {
  const rows = useMemo<MetricRow[]>(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startMs = startOfToday.getTime();
    const today = calls.filter((c) => c.startedAt >= startMs);
    const completed = today.filter((c) => c.status === "completed");

    // ─── Buckets ───
    const callsBuckets = bucketize(today, () => 1);
    const revenueBuckets = bucketize(today, (c) => c.revenue);
    const conversionBuckets = (() => {
      const totals = bucketize(today, () => 1);
      const conv = bucketize(today, (c) => c.status === "completed" ? 1 : 0);
      return conv.map((v, i) => totals[i] > 0 ? (v / totals[i]) * 100 : 0);
    })();
    const payoutBuckets = (() => {
      const totals = bucketize(today, (c) => c.status === "completed" ? 1 : 0);
      const sum = bucketize(today, (c) => c.status === "completed" ? c.payout : 0);
      return sum.map((v, i) => totals[i] > 0 ? v / totals[i] : 0);
    })();
    const liveBuckets = bucketize(today, (c) => c.status === "in-progress" || c.status === "ringing" ? 1 : 0);
    const campaignsBuckets = bucketizeSet(today, (c) => c.campaignId);

    // ─── Current values ───
    const totalCalls = kpis?.callsToday ?? today.length;
    const totalRevenue = kpis?.totalRevenue ?? completed.reduce((s, c) => s + c.revenue, 0);
    const conversionRate = today.length > 0 ? (completed.length / today.length) * 100 : (kpis?.conversionRate ?? 0) * 100;
    const avgPayout = completed.length > 0 ? completed.reduce((s, c) => s + c.payout, 0) / completed.length : 0;
    const liveCalls = kpis?.liveCalls ?? 0;

    // ─── Deltas — half-day comparison ───
    const midpoint = (() => {
      const d = new Date();
      d.setHours(12, 0, 0, 0);
      return d.getTime();
    })();
    const before = today.filter((c) => c.startedAt < midpoint);
    const after = today.filter((c) => c.startedAt >= midpoint);
    const safeDelta = (a: number, b: number) => (a > 0 ? ((b - a) / a) * 100 : 0);
    const callsDelta = safeDelta(before.length, after.length);
    const revenueDelta = safeDelta(
      before.reduce((s, c) => s + c.revenue, 0),
      after.reduce((s, c) => s + c.revenue, 0),
    );
    const completedBefore = before.filter((c) => c.status === "completed").length;
    const completedAfter = after.filter((c) => c.status === "completed").length;
    const conversionDelta = safeDelta(
      before.length > 0 ? completedBefore / before.length : 0,
      after.length > 0 ? completedAfter / after.length : 0,
    );
    const payoutBefore = before.filter((c) => c.status === "completed").reduce((s, c) => s + c.payout, 0);
    const payoutAfter = after.filter((c) => c.status === "completed").reduce((s, c) => s + c.payout, 0);
    const payoutDelta = safeDelta(
      completedBefore > 0 ? payoutBefore / completedBefore : 0,
      completedAfter > 0 ? payoutAfter / completedAfter : 0,
    );

    const peakOf = (b: number[]) => Math.max(1, ...b);

    return [
      {
        key: "calls",
        accent: "indigo",
        icon: PhoneCall,
        label: "Total calls today",
        value: totalCalls,
        formattedValue: formatNumber(totalCalls),
        spark: callsBuckets.map((v, i) => ({ i, v })),
        delta: callsDelta,
        vsPeak: totalCalls / Math.max(peakOf(callsBuckets) * 24, totalCalls || 1),
      },
      {
        key: "revenue",
        accent: "emerald",
        icon: CircleDollarSign,
        label: "Revenue today",
        value: totalRevenue,
        formattedValue: formatCurrency(totalRevenue),
        spark: revenueBuckets.map((v, i) => ({ i, v })),
        delta: revenueDelta,
        vsPeak: totalRevenue / Math.max(peakOf(revenueBuckets) * 24, totalRevenue || 1),
      },
      {
        key: "conversion",
        accent: "violet",
        icon: Target,
        label: "Conversion rate",
        value: conversionRate,
        formattedValue: formatPercent(conversionRate, 1),
        spark: conversionBuckets.map((v, i) => ({ i, v })),
        delta: conversionDelta,
        vsPeak: conversionRate / 100,
      },
      {
        key: "payout",
        accent: "orange",
        icon: Activity,
        label: "Avg payout / converted",
        value: avgPayout,
        formattedValue: formatCurrency(avgPayout, true),
        spark: payoutBuckets.map((v, i) => ({ i, v })),
        delta: payoutDelta,
        vsPeak: avgPayout / Math.max(peakOf(payoutBuckets), avgPayout || 1),
      },
      {
        key: "live",
        accent: "rose",
        icon: PhoneIncoming,
        label: "Live calls",
        value: liveCalls,
        formattedValue: formatNumber(liveCalls),
        spark: liveBuckets.map((v, i) => ({ i, v })),
        delta: 0,
        vsPeak: liveCalls / Math.max(peakOf(liveBuckets), liveCalls || 1),
      },
      {
        key: "campaigns",
        accent: "amber",
        icon: Megaphone,
        label: "Active campaigns",
        value: activeCampaigns,
        formattedValue: formatNumber(activeCampaigns),
        spark: campaignsBuckets.map((v, i) => ({ i, v })),
        delta: 0,
        vsPeak: activeCampaigns / Math.max(peakOf(campaignsBuckets), activeCampaigns || 1),
      },
    ];
  }, [calls, kpis, activeCampaigns]);

  return (
    <Card className="overflow-hidden p-0">
      {/* Header strip — title + column labels */}
      <div className="flex items-center justify-between border-b border-border/60 bg-secondary/20 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold">Key metrics</h3>
          <p className="text-[11px] text-muted-foreground">
            Snapshot of today's headline KPIs · sparklines = 24h hourly · peak %
            = current vs today's hourly high
          </p>
        </div>
        <span className="hidden text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground sm:inline">
          Auto-updating · {rows.length} metrics
        </span>
      </div>

      {/* Column header row — desktop only, hidden on small screens */}
      <div className="hidden border-b border-border/40 px-4 py-2 lg:grid lg:grid-cols-[2fr_1fr_1.5fr_0.8fr_1.2fr] lg:gap-4 lg:items-center">
        <div className="text-[9px] font-mono font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Metric
        </div>
        <div className="text-right text-[9px] font-mono font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Current
        </div>
        <div className="text-[9px] font-mono font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          24h trend
        </div>
        <div className="text-right text-[9px] font-mono font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Change
        </div>
        <div className="text-[9px] font-mono font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Vs peak
        </div>
      </div>

      {/* Data rows */}
      <CardContent className="p-0">
        <ul className="divide-y divide-border/40">
          {rows.map((row, i) => (
            <MetricsRow key={row.key} row={row} delay={i * 0.04} />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */

function MetricsRow({ row, delay = 0 }: { row: MetricRow; delay?: number }) {
  const Icon = row.icon;
  const stroke = ACCENT_STROKE[row.accent];
  const gradId = `metric-spark-${row.key}`;
  const positive = row.delta >= 0;
  const flat = Math.abs(row.delta) < 0.1;
  const vsPeakPct = Math.max(0, Math.min(1, row.vsPeak)) * 100;

  return (
    <motion.li
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="grid grid-cols-1 gap-3 px-4 py-3.5 transition-colors hover:bg-secondary/15 lg:grid-cols-[2fr_1fr_1.5fr_0.8fr_1.2fr] lg:items-center"
    >
      {/* Col 1 — Metric label (with icon) */}
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className={cn("inline-flex h-2 w-2 shrink-0 rounded-full", ACCENT_DOT[row.accent])}
        />
        <span
          className={cn(
            "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-secondary/40",
            ACCENT_ICON_TEXT[row.accent],
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="text-sm font-medium text-foreground">{row.label}</span>
      </div>

      {/* Col 2 — Current value (right-aligned, mono, large) */}
      <div className="flex justify-end">
        <span className="font-mono text-xl font-semibold tabular-nums text-foreground">
          {row.formattedValue}
        </span>
      </div>

      {/* Col 3 — 24h sparkline */}
      <div className="-my-1 h-9">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={row.spark} margin={{ top: 1, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={stroke} stopOpacity={0.4} />
                <stop offset="100%" stopColor={stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke={stroke}
              strokeWidth={1.5}
              fill={`url(#${gradId})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Col 4 — Change delta chip */}
      <div className="flex justify-end">
        {flat ? (
          <span className="inline-flex items-center gap-0.5 rounded-full bg-muted/40 px-2 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground">
            →0%
          </span>
        ) : (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium tabular-nums",
              positive
                ? "bg-[color:var(--success)]/10 text-[color:var(--success)]"
                : "bg-destructive/10 text-destructive",
            )}
          >
            {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {positive ? "+" : ""}
            {row.delta.toFixed(1)}%
          </span>
        )}
      </div>

      {/* Col 5 — Vs peak progress bar */}
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary/40">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${vsPeakPct}%` }}
            transition={{ delay: delay + 0.1, duration: 0.9, ease: "easeOut" }}
            className={cn("h-full rounded-full bg-gradient-to-r", ACCENT_BAR[row.accent])}
          />
        </div>
        <span className="w-10 text-right font-mono text-[11px] tabular-nums text-muted-foreground">
          {Math.round(vsPeakPct)}%
        </span>
      </div>
    </motion.li>
  );
}
