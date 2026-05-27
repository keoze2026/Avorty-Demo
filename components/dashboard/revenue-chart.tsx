"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CHART_TOOLTIP_PROPS } from "@/lib/chart-tooltip";
import { LAST_14_DAYS, TODAY_HOURLY } from "@/lib/mock/timeseries";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

type Range = "24h" | "14d";

const RANGES: Array<{ id: Range; label: string }> = [
  { id: "24h", label: "Today" },
  { id: "14d", label: "14 days" },
];

export function RevenueChart() {
  const [range, setRange] = React.useState<Range>("24h");
  const data =
    range === "24h"
      ? TODAY_HOURLY.map((p) => ({ x: p.label, revenue: p.revenue }))
      : LAST_14_DAYS.map((p) => ({ x: p.label, revenue: p.revenue }));

  const total = data.reduce((s, p) => s + p.revenue, 0);
  const peak = Math.max(...data.map((p) => p.revenue));

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
              peak {formatCurrency(peak)}
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
                <linearGradient id="rev-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
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
              <Tooltip
                {...CHART_TOOLTIP_PROPS}
                cursor={{ stroke: "var(--chart-1)", strokeOpacity: 0.4, strokeWidth: 1 }}
                formatter={(value: number) => [formatCurrency(value), "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--chart-1)"
                strokeWidth={2}
                fill="url(#rev-grad)"
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
