/**
 * CampaignsOverview — "Atlas" aggregate band shown above the campaign list.
 *
 *   ┌───────────────────────────────────────────────────────────┐
 *   │ ATLAS · 24 campaigns ▸ 18 active · 5 paused · 1 draft      │
 *   │ ░░░░ massive numerals ░░░░  · split by vertical chips     │
 *   └───────────────────────────────────────────────────────────┘
 */

"use client";

import { motion } from "framer-motion";
import { Activity, DollarSign, PhoneCall, TrendingUp } from "lucide-react";

import { useCountUp } from "@/hooks/use-count-up";
import { formatCompact, formatCurrency, formatPercent } from "@/lib/format";
import type { Campaign } from "@/lib/types";
import { VERTICAL_ACCENT } from "@/lib/types";
import { cn } from "@/lib/utils";

const DOT: Record<string, string> = {
  cyan: "bg-accent",
  emerald: "bg-[oklch(0.6_0.18_155)]",
  violet: "bg-[oklch(0.6_0.2_290)]",
  amber: "bg-[oklch(0.6_0.16_75)]",
  rose: "bg-[oklch(0.6_0.2_10)]",
};

export function CampaignsOverview({ campaigns }: { campaigns: Campaign[] }) {
  const active = campaigns.filter((c) => c.status === "active").length;
  const paused = campaigns.filter((c) => c.status === "paused").length;
  const draft = campaigns.filter((c) => c.status === "draft").length;
  const totalCalls = campaigns.reduce((s, c) => s + c.callsToday, 0);
  const totalRevenue = campaigns.reduce((s, c) => s + c.revenueToday, 0);
  const avgConv =
    campaigns.length > 0
      ? campaigns.reduce((s, c) => s + c.conversionRate, 0) / campaigns.length
      : 0;

  // Distribution by vertical
  const byVertical = Array.from(
    campaigns.reduce<Map<string, number>>((m, c) => {
      m.set(c.vertical, (m.get(c.vertical) ?? 0) + 1);
      return m;
    }, new Map<string, number>()),
  ).sort((a, b) => b[1] - a[1]);

  const animatedTotal = useCountUp(campaigns.length, { duration: 400 });
  const animatedRevenue = useCountUp(totalRevenue, { duration: 800 });

  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl border border-border bg-card"
    >
      {/* Ambient + diagonal axis */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl"
        style={{ background: "var(--vortyx-glow)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-diagonal opacity-30"
      />
      {/* Crosshairs */}
      <Crosshair className="left-3 top-3" />
      <Crosshair className="right-3 top-3" />
      <Crosshair className="left-3 bottom-3" />
      <Crosshair className="right-3 bottom-3" />

      <div aria-hidden className="absolute inset-x-8 top-0 h-px edge-rule-top" />

      <div className="relative grid grid-cols-1 gap-0 lg:grid-cols-12">
        {/* Left — big count */}
        <div className="relative p-6 lg:col-span-5 lg:border-r lg:border-border/60">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-semibold tracking-[0.22em] text-accent">
              00 / ATLAS
            </span>
            <span aria-hidden className="h-3 w-px bg-border" />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Active campaigns
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-mono text-[68px] font-bold leading-none tracking-tight tabular-nums">
              {Math.round(animatedTotal).toString().padStart(2, "0")}
            </span>
            <div className="ml-2 flex flex-col gap-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              <span>
                <span className="text-[oklch(0.6_0.18_155)] dark:text-[oklch(0.78_0.18_155)]">
                  {active}
                </span>{" "}
                active
              </span>
              <span>
                <span className="text-[oklch(0.6_0.16_75)] dark:text-[oklch(0.82_0.16_75)]">
                  {paused}
                </span>{" "}
                paused
              </span>
              <span>
                <span className="text-foreground/80">{draft}</span> draft
              </span>
            </div>
          </div>

          {/* Status mini-bar */}
          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-secondary/60">
            <div className="flex h-full">
              <Slice
                width={(active / Math.max(campaigns.length, 1)) * 100}
                className="bg-[oklch(0.6_0.18_155)]"
              />
              <Slice
                width={(paused / Math.max(campaigns.length, 1)) * 100}
                className="bg-[oklch(0.6_0.16_75)]"
              />
              <Slice
                width={(draft / Math.max(campaigns.length, 1)) * 100}
                className="bg-muted-foreground/40"
              />
            </div>
          </div>
          <div className="mt-2 flex justify-between font-mono text-[9px] uppercase tracking-wider text-muted-foreground/70">
            <span>portfolio mix</span>
            <span>
              {((active / Math.max(campaigns.length, 1)) * 100).toFixed(0)}% live
            </span>
          </div>
        </div>

        {/* Right — aggregate KPIs */}
        <div className="grid grid-cols-1 divide-y divide-border/60 lg:col-span-7 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <Aggregate icon={PhoneCall} index="01" label="Calls today" display={formatCompact(totalCalls)} />
          <Aggregate
            icon={DollarSign}
            index="02"
            label="Revenue today"
            display={formatCurrency(Math.round(animatedRevenue))}
            highlight
          />
          <Aggregate
            icon={TrendingUp}
            index="03"
            label="Avg conversion"
            display={formatPercent(avgConv * 100, 0)}
          />
        </div>
      </div>

      {/* Vertical breakdown chips */}
      <div className="relative flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/50 px-6 py-3">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          <Activity className="h-3 w-3 text-accent" />
          verticals
        </div>
        {byVertical.map(([v, count]) => {
          const tone = VERTICAL_ACCENT[v] ?? "cyan";
          return (
            <span
              key={v}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/40 px-2 py-1 font-mono text-[10px]"
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", DOT[tone])} />
              <span className="text-foreground/80">{v}</span>
              <span className="text-muted-foreground">·</span>
              <span className="tabular-nums">{count}</span>
            </span>
          );
        })}
      </div>
    </motion.section>
  );
}

function Slice({ width, className }: { width: number; className?: string }) {
  return <div style={{ width: `${width}%` }} className={cn("h-full", className)} />;
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

interface AggregateProps {
  icon: typeof DollarSign;
  index: string;
  label: string;
  display: string;
  highlight?: boolean;
}

function Aggregate({ icon: Icon, index, label, display, highlight }: AggregateProps) {
  return (
    <div className="group/agg flex flex-col justify-center px-6 py-5 transition-colors hover:bg-secondary/30">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-secondary/40 text-accent">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] tracking-[0.18em] text-accent">{index}</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {label}
            </span>
          </div>
        </div>
      </div>
      <div
        className={cn(
          "mt-3 font-mono text-3xl font-bold tabular-nums",
          highlight && "text-accent",
        )}
      >
        {display}
      </div>
    </div>
  );
}
