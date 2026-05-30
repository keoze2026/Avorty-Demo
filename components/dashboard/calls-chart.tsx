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
import { bucketDaily, bucketHourly } from "@/lib/dashboard-buckets";
import { LAST_14_DAYS, TODAY_HOURLY } from "@/lib/mock/timeseries";
import { formatNumber } from "@/lib/format";
import type { Call } from "@/lib/types";
import { cn } from "@/lib/utils";

type Range = "24h" | "14d";

const RANGES: Array<{ id: Range; label: string }> = [
  { id: "24h", label: "Today" },
  { id: "14d", label: "14 days" },
];

/* Bars use a single indigo brand color with a soft top→bottom fade.
   The peak bar shifts to the bright variant so it stands out without
   introducing a second hue. */
const BAR_COLOR = "var(--accent)";
const PEAK_COLOR = "#818CF8"; // bright indigo (matches --vortyx-bright)

interface CallsChartProps {
  /** When provided, the chart buckets from these calls instead of TODAY_HOURLY/LAST_14_DAYS. */
  calls?: Call[];
}

export function CallsChart({ calls }: CallsChartProps = {}) {
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
      ? hourly.map((p) => ({ x: p.label.slice(0, 2), calls: p.calls, full: p.label }))
      : daily.map((p) => ({ x: p.label, calls: p.calls, full: p.label }));

  const total = data.reduce((s, p) => s + p.calls, 0);
  const peak = Math.max(...data.map((p) => p.calls));
  const avg = Math.round(total / Math.max(data.length, 1));
  const peakPoint = data.find((p) => p.calls === peak);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-semibold">Calls</CardTitle>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-semibold tracking-tight tabular-nums">
              {formatNumber(total)}
            </span>
            <span className="text-[11px] text-muted-foreground">
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
                {/* Standard bar — solid indigo (no gradient fade). */}
                <linearGradient id="calls-bar-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={BAR_COLOR} stopOpacity={1} />
                  <stop offset="100%" stopColor={BAR_COLOR} stopOpacity={1} />
                </linearGradient>
                {/* Peak bar — solid brighter indigo. */}
                <linearGradient id="calls-peak-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={PEAK_COLOR} stopOpacity={1} />
                  <stop offset="100%" stopColor={PEAK_COLOR} stopOpacity={1} />
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
                cursor={false}
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
