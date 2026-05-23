"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

import { useCountUp } from "@/hooks/use-count-up";
import { cn } from "@/lib/utils";

export type KpiAccent = "cyan" | "emerald" | "violet" | "amber";

interface KpiTileProps {
  label: string;
  /** Numeric value used for animation; pass formatted version via `formatValue`. */
  value: number;
  /** Render the value (handles currency, %, etc.) */
  formatValue: (v: number) => string;
  icon: LucideIcon;
  /** Percent change (positive = good) */
  delta?: number;
  /** Optional sparkline data ({i, v} points) */
  sparkline?: { i: number; v: number }[];
  accent?: KpiAccent;
  /** Optional foot label e.g. "vs yesterday" */
  foot?: string;
}

const ACCENT_STYLES: Record<KpiAccent, { icon: string; line: string; glow: string }> = {
  cyan: {
    icon: "bg-accent/10 text-accent",
    line: "var(--accent)",
    glow: "rgba(59, 182, 255, 0.18)",
  },
  emerald: {
    icon: "bg-[oklch(0.74_0.18_155)]/10 text-[oklch(0.6_0.18_155)] dark:text-[oklch(0.78_0.18_155)]",
    line: "oklch(0.6 0.18 155)",
    glow: "rgba(40, 175, 110, 0.18)",
  },
  violet: {
    icon: "bg-[oklch(0.65_0.18_290)]/10 text-[oklch(0.55_0.2_290)] dark:text-[oklch(0.72_0.2_290)]",
    line: "oklch(0.6 0.2 290)",
    glow: "rgba(150, 95, 220, 0.18)",
  },
  amber: {
    icon: "bg-[oklch(0.78_0.16_75)]/10 text-[oklch(0.6_0.16_75)] dark:text-[oklch(0.82_0.16_75)]",
    line: "oklch(0.6 0.16 75)",
    glow: "rgba(220, 160, 60, 0.18)",
  },
};

export function KpiTile({
  label,
  value,
  formatValue,
  icon: Icon,
  delta,
  sparkline,
  accent = "cyan",
  foot,
}: KpiTileProps) {
  const animated = useCountUp(value);
  const styles = ACCENT_STYLES[accent];
  const gradId = React.useId().replace(/:/g, "");

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18 }}
      className="group relative overflow-hidden rounded-xl border border-border bg-card p-5"
    >
      {/* Ambient glow corner */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: styles.glow }}
      />

      <div className="flex items-start justify-between gap-2">
        <div className={cn("inline-flex h-9 w-9 items-center justify-center rounded-lg", styles.icon)}>
          <Icon className="h-4 w-4" />
        </div>
        {typeof delta === "number" && (
          <div
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-mono",
              delta >= 0
                ? "border-[oklch(0.74_0.18_155)]/40 bg-[oklch(0.74_0.18_155)]/10 text-[oklch(0.6_0.18_155)] dark:text-[oklch(0.78_0.18_155)]"
                : "border-destructive/40 bg-destructive/10 text-destructive",
            )}
          >
            {delta >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {delta >= 0 ? "+" : ""}
            {delta.toFixed(1)}%
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="font-mono text-3xl font-bold tracking-tight">{formatValue(animated)}</span>
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>

      {/* Sparkline */}
      {sparkline && (
        <div className="-mx-1 mt-3 h-12">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkline} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
              <defs>
                <linearGradient id={`spark-${gradId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={styles.line} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={styles.line} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={styles.line}
                strokeWidth={2}
                fill={`url(#spark-${gradId})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {foot && <p className="mt-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70">{foot}</p>}
    </motion.div>
  );
}
