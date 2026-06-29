"use client";

/**
 * Hero revenue card — the focal point of the redesigned dashboard.
 *
 * Layout: one large card (8 cols × full hero row) carrying today's
 * headline revenue figure, an inline mini-KPI ribbon, and a full-bleed
 * area sparkline that visually anchors the top of the page. Gradient
 * border + accent glow gives it a "designed" weight that distinguishes
 * it from the supporting tiles.
 *
 * Numbers wire to the same `calls` slice the rest of the dashboard
 * reads from, so the hero and the rest of the page stay in lockstep.
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
} from "recharts";

import { useCountUp } from "@/hooks/use-count-up";
import { formatCompact, formatCurrency, formatPercent } from "@/lib/format";
import type { Call } from "@/lib/types";
import { cn } from "@/lib/utils";

interface HeroRevenueCardProps {
  calls: Call[];
  /** Optional headline override — if not provided, computed from `calls`. */
  totalRevenue?: number;
}

export function HeroRevenueCard({ calls, totalRevenue }: HeroRevenueCardProps) {
  const stats = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startMs = startOfToday.getTime();
    const today = calls.filter((c) => c.startedAt >= startMs);
    const completed = today.filter((c) => c.status === "completed");
    const revenue = totalRevenue ?? completed.reduce((s, c) => s + c.revenue, 0);
    const callsCount = today.length;
    const conversionRate = callsCount > 0 ? completed.length / callsCount : 0;
    const avgPayout = completed.length > 0
      ? completed.reduce((s, c) => s + c.payout, 0) / completed.length
      : 0;
    const salesCount = completed.length;

    // Morning vs afternoon delta for the trend chip.
    const midpoint = (() => {
      const d = new Date();
      d.setHours(12, 0, 0, 0);
      return d.getTime();
    })();
    const beforeNoon = today.filter((c) => c.startedAt < midpoint).reduce((s, c) => s + c.revenue, 0);
    const afterNoon = today.filter((c) => c.startedAt >= midpoint).reduce((s, c) => s + c.revenue, 0);
    const trend = beforeNoon > 0 ? ((afterNoon - beforeNoon) / beforeNoon) * 100 : 0;

    // Sparkline — revenue per hour bucket of today.
    const buckets = new Array(24).fill(0) as number[];
    for (const c of today) {
      const h = new Date(c.startedAt).getHours();
      buckets[h] += c.revenue;
    }
    const spark = buckets.map((v, i) => ({ i, v }));

    return { revenue, callsCount, conversionRate, avgPayout, salesCount, trend, spark };
  }, [calls, totalRevenue]);

  const animatedRevenue = useCountUp(stats.revenue);
  const positiveTrend = stats.trend >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative h-full overflow-hidden rounded-2xl border border-accent/30"
      style={{
        background:
          "radial-gradient(ellipse 80% 100% at 80% 0%, color-mix(in oklab, var(--accent) 24%, transparent), transparent 60%), linear-gradient(135deg, var(--card) 0%, color-mix(in oklab, var(--accent) 6%, var(--card)) 100%)",
      }}
    >
      {/* Subtle dot-grid backdrop — same texture the billing page hero uses. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30 bg-dot-grid"
        style={{
          maskImage: "radial-gradient(ellipse 60% 70% at 30% 0%, #000 30%, transparent 70%)",
        }}
      />

      {/* Full-bleed sparkline behind the content — sets the hero's mood. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={stats.spark} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="hero-spark-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.32} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke="var(--accent)"
              strokeWidth={1.5}
              fill="url(#hero-spark-fill)"
              isAnimationActive
              animationDuration={900}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="relative flex h-full flex-col justify-between gap-5 p-6 sm:p-7">
        {/* Top row: eyebrow + trend chip */}
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/12 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-[0.16em] text-accent">
            <Sparkles className="h-2.5 w-2.5" />
            Today's revenue
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium tabular-nums",
              positiveTrend
                ? "bg-[color:var(--success)]/10 text-[color:var(--success)]"
                : "bg-destructive/10 text-destructive",
            )}
          >
            {positiveTrend ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {positiveTrend ? "+" : ""}
            {stats.trend.toFixed(1)}%
            <span className="opacity-60">vs morning</span>
          </span>
        </div>

        {/* Headline number — display-size, tabular nums, accent gradient text. */}
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-semibold tabular-nums tracking-tight sm:text-5xl">
              {formatCurrency(animatedRevenue)}
            </span>
            <ArrowUpRight className="h-5 w-5 text-accent" />
          </div>
          <p className="text-[13px] text-muted-foreground">
            From{" "}
            <span className="font-mono tabular-nums text-foreground">
              {formatCompact(stats.salesCount)}
            </span>{" "}
            converted calls today
          </p>
        </div>

        {/* Inline mini-KPI ribbon — four supporting numbers in one strip
            that anchors the bottom of the hero. */}
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-border/60 bg-background/40 p-3 backdrop-blur-sm sm:grid-cols-4">
          <Mini label="Calls" value={formatCompact(stats.callsCount)} />
          <Mini label="Conv. rate" value={formatPercent(stats.conversionRate * 100, 1)} />
          <Mini label="Avg payout" value={formatCurrency(stats.avgPayout, true)} />
          <Mini label="Sales" value={formatCompact(stats.salesCount)} />
        </div>
      </div>
    </motion.div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[9px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </span>
      <span className="font-mono text-lg font-semibold tabular-nums text-foreground">
        {value}
      </span>
    </div>
  );
}
