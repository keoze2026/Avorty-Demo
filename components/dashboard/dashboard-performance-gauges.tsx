"use client";

/**
 * Performance gauges — four SVG radial dials sitting under the hero KPI
 * strip. Each gauge maps a percentage (0–100) to a sweep arc; color
 * shifts green → amber → red as the value drops below thresholds, so the
 * operator can read health at a glance.
 *
 *   Connect rate    = (completed + in-progress) / total
 *   Conversion rate = completed / total
 *   Quality score   = derived heuristic from avg duration + completion
 *   Capacity used   = live concurrent / capacity (mock, demo-friendly)
 *
 * All four values derive from the same `calls` slice that drives the
 * donut + hourly chart, so the gauges stay in lockstep with the rest of
 * the dashboard.
 */

import { useMemo } from "react";
import { motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import type { Call } from "@/lib/types";
import { cn } from "@/lib/utils";

interface DashboardPerformanceGaugesProps {
  calls: Call[];
  liveCalls?: number;
}

interface GaugeDef {
  key: string;
  label: string;
  /** Percentage 0–100. */
  value: number;
  /** Optional sub-label rendered under the percentage. */
  detail?: string;
}

const THRESH = {
  good: 70,
  warn: 50,
};

function toneFor(pct: number): { stroke: string; text: string; bg: string } {
  if (pct >= THRESH.good) {
    return {
      stroke: "var(--success)",
      text: "text-[color:var(--success)]",
      bg: "bg-[color:var(--success)]/10",
    };
  }
  if (pct >= THRESH.warn) {
    return {
      stroke: "var(--warning)",
      text: "text-[color:var(--warning)]",
      bg: "bg-[color:var(--warning)]/10",
    };
  }
  return {
    stroke: "var(--destructive)",
    text: "text-destructive",
    bg: "bg-destructive/10",
  };
}

export function DashboardPerformanceGauges({ calls, liveCalls }: DashboardPerformanceGaugesProps) {
  const gauges = useMemo<GaugeDef[]>(() => {
    const total = calls.length;
    const completed = calls.filter((c) => c.status === "completed").length;
    const inFlight = calls.filter((c) => c.status === "in-progress" || c.status === "ringing").length;
    const missed = calls.filter((c) => c.status === "missed").length;
    const rejected = calls.filter((c) => c.status === "rejected").length;

    const connectRate = total > 0 ? ((completed + inFlight) / total) * 100 : 0;
    const conversionRate = total > 0 ? (completed / total) * 100 : 0;

    // Quality score — composite signal weighted on completion rate (heavy),
    // missed rate (penalty), and avg-duration thresholds (light bonus).
    const avgDuration = completed > 0
      ? calls.filter((c) => c.status === "completed").reduce((s, c) => s + c.durationSec, 0) / completed
      : 0;
    const durationBonus = Math.min(1, avgDuration / 180); // 3 min = full bonus
    const missRate = total > 0 ? missed / total : 0;
    const rejectRate = total > 0 ? rejected / total : 0;
    const qualityRaw =
      0.6 * (completed / Math.max(total, 1)) +
      0.25 * durationBonus +
      0.15 * (1 - (missRate + rejectRate));
    const quality = Math.max(0, Math.min(100, qualityRaw * 100));

    // Capacity utilization — live calls / a soft cap derived from peak
    // hour. Reads as "how busy is the floor right now."
    const live = typeof liveCalls === "number" ? liveCalls : inFlight;
    const peakHourCount = (() => {
      const buckets = new Array(24).fill(0) as number[];
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      for (const c of calls) {
        if (c.startedAt < startOfToday.getTime()) continue;
        const h = new Date(c.startedAt).getHours();
        buckets[h] += 1;
      }
      return Math.max(50, ...buckets);
    })();
    const capacityUsed = Math.min(100, (live / peakHourCount) * 100);

    return [
      {
        key: "connect",
        label: "Connect rate",
        value: Math.round(connectRate * 10) / 10,
        detail: `${completed.toLocaleString()} of ${total.toLocaleString()}`,
      },
      {
        key: "conversion",
        label: "Conversion rate",
        value: Math.round(conversionRate * 10) / 10,
        detail: `${completed.toLocaleString()} converted`,
      },
      {
        key: "quality",
        label: "Quality score",
        value: Math.round(quality * 10) / 10,
        detail: `Composite signal`,
      },
      {
        key: "capacity",
        label: "Capacity used",
        value: Math.round(capacityUsed * 10) / 10,
        detail: `${live} live / ${peakHourCount} peak`,
      },
    ];
  }, [calls, liveCalls]);

  return (
    <Card className="flex h-full flex-col">
      <CardContent className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-baseline justify-between">
          <h3 className="text-sm font-semibold">Performance</h3>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Live health
          </p>
        </div>
        <div className="grid flex-1 grid-cols-2 place-items-center gap-3 sm:grid-cols-4">
          {gauges.map((g, i) => (
            <Gauge
              key={g.key}
              label={g.label}
              value={g.value}
              detail={g.detail}
              delay={i * 0.07}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */

interface GaugeProps {
  label: string;
  value: number;
  detail?: string;
  delay?: number;
}

function Gauge({ label, value, detail, delay = 0 }: GaugeProps) {
  const tone = toneFor(value);
  const size = 124;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(1, Math.max(0, value / 100)));

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center gap-1.5"
    >
      <div className={cn("relative inline-flex h-[124px] w-[124px] items-center justify-center rounded-full", tone.bg)}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--border)"
            strokeWidth={stroke}
            fill="none"
            strokeOpacity={0.4}
          />
          {/* Progress */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={tone.stroke}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut", delay }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-2xl font-semibold tabular-nums tracking-tight", tone.text)}>
            {value.toFixed(1)}
            <span className="ml-0.5 text-xs">%</span>
          </span>
          {detail && (
            <span className="mt-0.5 max-w-[7rem] truncate text-[9px] uppercase tracking-wider text-muted-foreground">
              {detail}
            </span>
          )}
        </div>
      </div>
      <span className="text-[11px] font-medium text-foreground">{label}</span>
    </motion.div>
  );
}
