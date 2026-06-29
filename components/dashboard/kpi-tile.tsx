"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import { useCountUp } from "@/hooks/use-count-up";
import { cn } from "@/lib/utils";

export type KpiAccent = "cyan" | "emerald" | "violet" | "amber" | "indigo" | "orange" | "rose";

/** Per-accent visual palette. Each KPI on the dashboard gets a distinct
 *  identity instead of every tile blurring into the same brand blue. */
const ACCENT_STYLES: Record<KpiAccent, {
  iconBg: string;
  iconText: string;
  border: string;
  sparkColor: string;
  sparkGradient: [string, string];
}> = {
  cyan: {
    iconBg: "bg-accent/15",
    iconText: "text-accent",
    border: "before:bg-accent/40",
    sparkColor: "var(--accent)",
    sparkGradient: ["var(--accent)", "var(--accent)"],
  },
  emerald: {
    iconBg: "bg-[oklch(0.62_0.18_155)]/15",
    iconText: "text-[oklch(0.55_0.18_155)] dark:text-[oklch(0.78_0.18_155)]",
    border: "before:bg-[oklch(0.62_0.18_155)]/40",
    sparkColor: "oklch(0.62 0.18 155)",
    sparkGradient: ["oklch(0.62 0.18 155)", "oklch(0.62 0.18 155)"],
  },
  violet: {
    iconBg: "bg-[oklch(0.6_0.2_290)]/15",
    iconText: "text-[oklch(0.58_0.2_290)] dark:text-[oklch(0.78_0.2_290)]",
    border: "before:bg-[oklch(0.6_0.2_290)]/40",
    sparkColor: "oklch(0.6 0.2 290)",
    sparkGradient: ["oklch(0.6 0.2 290)", "oklch(0.6 0.2 290)"],
  },
  amber: {
    iconBg: "bg-[oklch(0.78_0.16_75)]/15",
    iconText: "text-[oklch(0.6_0.16_75)] dark:text-[oklch(0.82_0.16_75)]",
    border: "before:bg-[oklch(0.78_0.16_75)]/40",
    sparkColor: "oklch(0.78 0.16 75)",
    sparkGradient: ["oklch(0.78 0.16 75)", "oklch(0.78 0.16 75)"],
  },
  indigo: {
    iconBg: "bg-[oklch(0.6_0.2_265)]/15",
    iconText: "text-[oklch(0.58_0.2_265)] dark:text-[oklch(0.78_0.2_265)]",
    border: "before:bg-[oklch(0.6_0.2_265)]/40",
    sparkColor: "oklch(0.6 0.2 265)",
    sparkGradient: ["oklch(0.6 0.2 265)", "oklch(0.6 0.2 265)"],
  },
  orange: {
    iconBg: "bg-[oklch(0.7_0.18_50)]/15",
    iconText: "text-[oklch(0.6_0.18_50)] dark:text-[oklch(0.78_0.18_50)]",
    border: "before:bg-[oklch(0.7_0.18_50)]/40",
    sparkColor: "oklch(0.7 0.18 50)",
    sparkGradient: ["oklch(0.7 0.18 50)", "oklch(0.7 0.18 50)"],
  },
  rose: {
    iconBg: "bg-[oklch(0.62_0.2_15)]/15",
    iconText: "text-[oklch(0.58_0.2_15)] dark:text-[oklch(0.78_0.2_15)]",
    border: "before:bg-[oklch(0.62_0.2_15)]/40",
    sparkColor: "oklch(0.62 0.2 15)",
    sparkGradient: ["oklch(0.62 0.2 15)", "oklch(0.62 0.2 15)"],
  },
};

interface KpiTileProps {
  label: string;
  value: number;
  formatValue: (v: number) => string;
  icon: LucideIcon;
  delta?: number;
  sparkline?: { i: number; v: number }[];
  /** Per-tile accent — drives icon color, sparkline color, and the
   *  thin top-edge accent bar. Defaults to brand cyan. */
  accent?: KpiAccent;
  foot?: string;
}

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
  const gradId = React.useId().replace(/:/g, "");
  const positive = typeof delta === "number" && delta >= 0;
  const palette = ACCENT_STYLES[accent];

  return (
    <Card
      className={cn(
        "relative h-full overflow-hidden",
        // Thin accent bar across the top edge — a tiny detail that
        // gives each tile its own identity at a glance.
        "before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:rounded-t-xl",
        palette.border,
      )}
    >
      <CardContent className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <div
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-lg shadow-sm",
              palette.iconBg,
              palette.iconText,
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
          {typeof delta === "number" && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium tabular-nums",
                positive
                  ? "bg-[color:var(--success)]/10 text-[color:var(--success)]"
                  : "bg-destructive/10 text-destructive",
              )}
            >
              {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {positive ? "+" : ""}
              {delta.toFixed(1)}%
            </span>
          )}
        </div>

        <div className="mt-4 flex-1">
          <div className="text-3xl font-semibold tracking-tight tabular-nums">
            {formatValue(animated)}
          </div>
          <p className="mt-1 text-[12px] font-medium text-muted-foreground">{label}</p>
        </div>

        {sparkline && (
          <div className="-mx-1 mt-3 h-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkline} margin={{ top: 2, right: 2, bottom: 0, left: 2 }}>
                <defs>
                  <linearGradient id={`spark-${gradId}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={palette.sparkGradient[0]} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={palette.sparkGradient[1]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={palette.sparkColor}
                  strokeWidth={1.75}
                  fill={`url(#spark-${gradId})`}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {foot && <p className="mt-2 text-xs text-muted-foreground">{foot}</p>}
      </CardContent>
    </Card>
  );
}
