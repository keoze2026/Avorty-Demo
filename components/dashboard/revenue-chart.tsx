"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CHART_TOOLTIP_PROPS } from "@/lib/chart-tooltip";
import { bucketDaily, bucketHourly } from "@/lib/dashboard-buckets";
import { LAST_14_DAYS, TODAY_HOURLY } from "@/lib/mock/timeseries";
import { formatCurrency } from "@/lib/format";
import type { Call } from "@/lib/types";
import { cn } from "@/lib/utils";

type Range = "24h" | "14d";

const RANGES: Array<{ id: Range; label: string }> = [
  { id: "24h", label: "Today" },
  { id: "14d", label: "14 days" },
];

interface RevenueChartProps {
  /** When provided, the chart buckets from these calls instead of TODAY_HOURLY/LAST_14_DAYS. */
  calls?: Call[];
}

export function RevenueChart({ calls }: RevenueChartProps = {}) {
  const [range, setRange] = React.useState<Range>("24h");
  const hourly = React.useMemo(
    () => (calls ? bucketHourly(calls) : TODAY_HOURLY),
    [calls],
  );
  const daily = React.useMemo(
    () => (calls ? bucketDaily(calls, 14) : LAST_14_DAYS),
    [calls],
  );
  const data =
    range === "24h"
      ? hourly.map((p) => ({ x: p.label, revenue: p.revenue }))
      : daily.map((p) => ({ x: p.label, revenue: p.revenue }));

  const total = data.reduce((s, p) => s + p.revenue, 0);
  const peak = Math.max(...data.map((p) => p.revenue));
  const avg = Math.round(total / Math.max(data.length, 1));

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-2">
        <div>
          <CardTitle className="text-base">Revenue</CardTitle>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tight tabular-nums">
              {formatCurrency(total)}
            </span>
            <span className="text-xs text-muted-foreground">
              peak {formatCurrency(peak)} · avg {formatCurrency(avg)}
            </span>
          </div>
        </div>
        <div className="flex gap-1 rounded-md border border-border bg-muted p-0.5">
          {RANGES.map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={cn(
                "rounded px-2.5 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                range === r.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 12, right: 8, left: -12, bottom: 0 }}>
              <defs>
                {/* Fill — single indigo fading to transparent */}
                <linearGradient id="rev-step-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.40} />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="x"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                minTickGap={24}
                tickMargin={8}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${Math.round(v / 1000)}k`}
                width={48}
              />
              <ReferenceLine
                y={avg}
                stroke="var(--muted-foreground)"
                strokeDasharray="4 4"
                strokeOpacity={0.55}
                label={{
                  value: `avg`,
                  position: "insideTopRight",
                  fontSize: 10,
                  fill: "var(--muted-foreground)",
                }}
              />
              <Tooltip
                {...CHART_TOOLTIP_PROPS}
                cursor={{ stroke: "var(--accent)", strokeOpacity: 0.4, strokeWidth: 1 }}
                formatter={(value: number) => [formatCurrency(value), "Revenue"]}
              />
              <Area
                type="stepAfter"
                dataKey="revenue"
                stroke="var(--accent)"
                strokeWidth={2.5}
                fill="url(#rev-step-fill)"
                dot={{
                  r: 2.5,
                  stroke: "var(--accent)",
                  strokeWidth: 1.5,
                  fill: "var(--card)",
                }}
                activeDot={{
                  r: 4,
                  stroke: "var(--accent)",
                  strokeWidth: 2,
                  fill: "var(--card)",
                }}
                isAnimationActive
                animationDuration={500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
