"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CHART_TOOLTIP_PROPS } from "@/lib/chart-tooltip";
import { DASHBOARD_PALETTE } from "@/lib/dashboard-palette";
import { TODAY_HOURLY } from "@/lib/mock/timeseries";
import { formatNumber } from "@/lib/format";

const CALLS_COLOR = DASHBOARD_PALETTE[1]; // azure
const CONV_COLOR = DASHBOARD_PALETTE[0]; // teal

export function CallVolumeChart() {
  const data = TODAY_HOURLY.map((p) => ({
    x: p.label.slice(0, 2),
    calls: p.calls,
    conversions: p.conversions,
  }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base">Call volume</CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">By hour, today</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="h-2 w-2 rounded-sm"
              style={{ background: CALLS_COLOR }}
            />
            Calls
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="h-2 w-2 rounded-sm"
              style={{ background: CONV_COLOR }}
            />
            Conversions
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
              barCategoryGap={4}
            >
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="x"
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                interval={2}
                tickMargin={8}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip
                {...CHART_TOOLTIP_PROPS}
                cursor={{ fill: "var(--muted)", fillOpacity: 0.5 }}
                formatter={(v: number, n) => [
                  formatNumber(v),
                  n === "calls" ? "Calls" : "Conversions",
                ]}
              />
              <Bar dataKey="calls" fill={CALLS_COLOR} radius={[3, 3, 0, 0]} />
              <Bar dataKey="conversions" fill={CONV_COLOR} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
