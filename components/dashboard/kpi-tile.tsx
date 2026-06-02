"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import { useCountUp } from "@/hooks/use-count-up";
import { cn } from "@/lib/utils";

export type KpiAccent = "cyan" | "emerald" | "violet" | "amber";

interface KpiTileProps {
  label: string;
  value: number;
  formatValue: (v: number) => string;
  icon: LucideIcon;
  delta?: number;
  sparkline?: { i: number; v: number }[];
  /** Kept for backwards compatibility with detail-tab stat rows; ignored visually. */
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
  foot,
}: KpiTileProps) {
  const animated = useCountUp(value);
  const gradId = React.useId().replace(/:/g, "");
  const positive = typeof delta === "number" && delta >= 0;

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2">
          {/* Gradient pill — picks up `--accent-gradient` so gradient themes
              show their full sweep while solid themes get an auto-derived
              dark→accent→bright self-gradient. */}
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent-gradient text-[color:var(--accent-foreground)] shadow-sm">
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

        <div className="mt-4">
          <div className="text-3xl font-semibold tracking-tight tabular-nums">
            {formatValue(animated)}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{label}</p>
        </div>

        {sparkline && (
          <div className="-mx-1 mt-3 h-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkline} margin={{ top: 2, right: 2, bottom: 0, left: 2 }}>
                <defs>
                  <linearGradient id={`spark-${gradId}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="var(--chart-1)"
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
