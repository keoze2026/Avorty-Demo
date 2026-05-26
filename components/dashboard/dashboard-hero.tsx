/**
 * Mission Control hero — full-width command panel for the Dashboard.
 *
 * Layout (12-col):
 *   ┌──────────────────────────────┬─────────────────────┐
 *   │  primary KPI (revenue)       │  satellite KPIs     │
 *   │  + integrated sparkline      │  (calls / conv /    │
 *   │  + delta · live tag          │   avg dur)          │
 *   └──────────────────────────────┴─────────────────────┘
 */

"use client";

import { motion } from "framer-motion";
import { Activity, DollarSign, PhoneCall, Timer, TrendingUp } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

import { LiveBadge } from "@/components/shared/live-badge";
import { useCountUp } from "@/hooks/use-count-up";
import { formatCompact, formatCurrency, formatDuration, formatPercent } from "@/lib/format";
import { TODAY_HOURLY } from "@/lib/mock/timeseries";
import { cn } from "@/lib/utils";

interface DashboardHeroProps {
  callsToday: number;
  revenueToday: number;
  conversionRate: number; // 0..1
  avgDurationSec: number;
}

export function DashboardHero({
  callsToday,
  revenueToday,
  conversionRate,
  avgDurationSec,
}: DashboardHeroProps) {
  const animatedRevenue = useCountUp(revenueToday, { duration: 900 });
  const data = TODAY_HOURLY.map((p) => ({ x: p.label, v: p.revenue }));
  const peak = Math.max(...data.map((p) => p.v));

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl border border-border bg-card"
    >
      {/* Background motifs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-hex-dot opacity-40" />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-32 h-[420px] w-[420px] rounded-full blur-3xl"
        style={{ background: "var(--vortyx-glow)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-0 h-[320px] w-[320px] rounded-full blur-3xl opacity-70"
        style={{ background: "radial-gradient(circle, rgba(34,211,238,0.22), transparent 70%)" }}
      />

      {/* Top accent rule + corner crosshairs */}
      <div aria-hidden className="absolute inset-x-8 top-0 h-px edge-rule-top" />
      <Crosshair className="left-3 top-3" />
      <Crosshair className="right-3 top-3" />
      <Crosshair className="left-3 bottom-3" />
      <Crosshair className="right-3 bottom-3" />

      <div className="relative grid grid-cols-1 gap-0 xl:grid-cols-12">
        {/* Primary KPI — Revenue today.
            Below xl the satellites flow underneath as a 3-up grid so neither
            side gets squeezed when the sidebar eats horizontal space. */}
        <div className="relative flex flex-col justify-between p-7 xl:col-span-7 xl:border-r xl:border-border/60">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-semibold tracking-[0.22em] text-accent">
              00 / TODAY
            </span>
            <span aria-hidden className="h-3 w-px bg-border" />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Revenue
            </span>
            <LiveBadge className="ml-2" label="Streaming" />
          </div>

          <div className="mt-4">
            <div className="flex items-end gap-3">
              <span className="font-mono text-[56px] font-bold leading-none tracking-tight tabular-nums sm:text-[68px]">
                {formatCurrency(animatedRevenue)}
              </span>
              <span className="mb-2 inline-flex items-center gap-1 rounded-md border border-[oklch(0.74_0.18_155)]/40 bg-[oklch(0.74_0.18_155)]/10 px-2 py-1 font-mono text-xs text-[oklch(0.6_0.18_155)] dark:text-[oklch(0.78_0.18_155)]">
                <TrendingUp className="h-3 w-3" /> +12.8%
              </span>
            </div>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              vs yesterday · peak {formatCurrency(peak)} at 14:00
            </p>
          </div>

          {/* Integrated baseline sparkline */}
          <div className="-mx-1 mt-5 h-16">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="hero-rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  fill="url(#hero-rev)"
                  isAnimationActive
                  animationDuration={700}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Tick rail — pure typography */}
          <div className="mt-1 flex justify-between font-mono text-[9px] uppercase tracking-wider text-muted-foreground/70">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>now</span>
          </div>
        </div>

        {/* Satellite KPIs — 3-up grid below the primary KPI on small screens,
            stacked vertically on the right at xl+ */}
        <div className="grid grid-cols-1 divide-y divide-border/60 sm:grid-cols-3 sm:divide-x sm:divide-y-0 xl:col-span-5 xl:grid-cols-1 xl:divide-x-0 xl:divide-y">
          <SatKpi
            icon={PhoneCall}
            label="Calls today"
            value={callsToday}
            display={formatCompact(callsToday)}
            delta={+12.4}
            seqIndex="01"
          />
          <SatKpi
            icon={Activity}
            label="Conversion rate"
            value={conversionRate * 100}
            display={formatPercent(conversionRate * 100)}
            delta={-2.1}
            seqIndex="02"
            note="7-day rolling"
          />
          <SatKpi
            icon={Timer}
            label="Avg call duration"
            value={avgDurationSec}
            display={formatDuration(Math.round(avgDurationSec))}
            delta={+5.2}
            seqIndex="03"
            note="completed calls"
          />
        </div>
      </div>

      {/* Bottom strip — coordinate footer */}
      <div className="relative flex items-center justify-between gap-3 border-t border-border/50 px-7 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/80">
        <span className="inline-flex items-center gap-2">
          <DollarSign className="h-3 w-3 text-accent" />
          ledger v3 · live
        </span>
        <span className="hidden sm:inline">node us-east · jitter 12ms</span>
        <span className="inline-flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-count-tick" />
          tick 1s
        </span>
      </div>
    </motion.section>
  );
}

function Crosshair({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute h-2.5 w-2.5",
        "before:absolute before:left-1/2 before:top-0 before:h-full before:w-px before:-translate-x-1/2 before:bg-accent/55",
        "after:absolute after:left-0 after:top-1/2 after:h-px after:w-full after:-translate-y-1/2 after:bg-accent/55",
        className,
      )}
    />
  );
}

interface SatKpiProps {
  icon: typeof PhoneCall;
  label: string;
  value: number;
  display: string;
  delta?: number;
  seqIndex: string;
  note?: string;
}

function SatKpi({ icon: Icon, label, display, delta, seqIndex, note }: SatKpiProps) {
  return (
    <div className="group/sat flex min-h-[7rem] items-center gap-4 px-6 py-4 transition-colors hover:bg-secondary/30">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary/40 text-accent">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] tracking-[0.18em] text-accent">{seqIndex}</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {label}
          </span>
        </div>
        <div className="mt-1 flex items-baseline gap-2.5">
          <span className="font-mono text-2xl font-bold tabular-nums">{display}</span>
          {typeof delta === "number" && (
            <span
              className={cn(
                "font-mono text-[11px]",
                delta >= 0
                  ? "text-[oklch(0.6_0.18_155)] dark:text-[oklch(0.78_0.18_155)]"
                  : "text-destructive",
              )}
            >
              {delta >= 0 ? "+" : ""}
              {delta.toFixed(1)}%
            </span>
          )}
        </div>
        {note && (
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
            {note}
          </p>
        )}
      </div>
    </div>
  );
}
