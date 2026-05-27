"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CHART_TOOLTIP_PROPS } from "@/lib/chart-tooltip";
import { DASHBOARD_PALETTE } from "@/lib/dashboard-palette";
import { LAST_14_DAYS, TODAY_HOURLY } from "@/lib/mock/timeseries";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

type Range = "24h" | "14d";

const RANGES: Array<{ id: Range; label: string }> = [
  { id: "24h", label: "Today" },
  { id: "14d", label: "14 days" },
];

const PRIMARY = DASHBOARD_PALETTE[1]; // azure — base
const PEAK = DASHBOARD_PALETTE[0]; // teal — emphasis for the peak bar

export function CallsChart() {
  const [range, setRange] = React.useState<Range>("24h");
  const data =
    range === "24h"
      ? TODAY_HOURLY.map((p) => ({ x: p.label.slice(0, 2), calls: p.calls, full: p.label }))
      : LAST_14_DAYS.map((p) => ({ x: p.label, calls: p.calls, full: p.label }));

  const total = data.reduce((s, p) => s + p.calls, 0);
  const peak = Math.max(...data.map((p) => p.calls));
  const avg = Math.round(total / Math.max(data.length, 1));
  const peakPoint = data.find((p) => p.calls === peak);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-2">
        <div>
          <CardTitle className="text-base">Calls</CardTitle>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tight tabular-nums">
              {formatNumber(total)}
            </span>
            <span className="text-xs text-muted-foreground">
              peak {formatNumber(peak)}
              {range === "24h" && peakPoint ? ` at ${peakPoint.full}` : null}
              {" · avg "}
              {formatNumber(avg)}
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
            <BarChart
              data={data}
              margin={{ top: 12, right: 8, left: -12, bottom: 0 }}
              barCategoryGap={range === "24h" ? "18%" : "26%"}
            >
              <defs>
                <linearGradient id="calls-bar-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.95} />
                  <stop offset="80%" stopColor={PRIMARY} stopOpacity={0.18} />
                  <stop offset="100%" stopColor={PRIMARY} stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="calls-peak-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={PEAK} stopOpacity={1} />
                  <stop offset="80%" stopColor={PEAK} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={PEAK} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="x"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                interval={range === "24h" ? 2 : 0}
                tickMargin={8}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                width={36}
                allowDecimals={false}
              />
              <ReferenceLine
                y={avg}
                stroke="var(--muted-foreground)"
                strokeDasharray="4 4"
                strokeOpacity={0.55}
                label={{
                  value: `avg ${avg}`,
                  position: "insideTopRight",
                  fontSize: 10,
                  fill: "var(--muted-foreground)",
                }}
              />
              <Tooltip
                {...CHART_TOOLTIP_PROPS}
                cursor={{ fill: "var(--muted)", fillOpacity: 0.4 }}
                formatter={(value: number) => [formatNumber(value), "Calls"]}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.full ?? ""}
              />
              <Bar
                dataKey="calls"
                radius={[4, 4, 0, 0]}
                isAnimationActive
                animationDuration={500}
              >
                {data.map((d) => (
                  <Cell
                    key={d.x}
                    fill={d.calls === peak ? "url(#calls-peak-grad)" : "url(#calls-bar-grad)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
