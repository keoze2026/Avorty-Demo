"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
      ? TODAY_HOURLY.map((p) => ({ x: p.label, revenue: p.revenue, calls: p.calls }))
      : LAST_14_DAYS.map((p) => ({ x: p.label, revenue: p.revenue, calls: p.calls }));

  const total = data.reduce((s, p) => s + p.revenue, 0);

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
        <div>
          <CardTitle className="text-base">Revenue</CardTitle>
          <p className="mt-1 font-mono text-2xl font-bold tracking-tight">{formatCurrency(total)}</p>
        </div>
        <div className="flex gap-1 rounded-md border border-border bg-secondary/40 p-0.5">
          {RANGES.map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={cn(
                "rounded px-2 py-1 text-xs font-mono transition-colors",
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
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
              <XAxis
                dataKey="x"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                minTickGap={20}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${Math.round(v / 1000)}k`}
                width={48}
              />
              <Tooltip
                cursor={{ stroke: "var(--accent)", strokeOpacity: 0.4, strokeWidth: 1 }}
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "var(--popover-foreground)",
                }}
                labelStyle={{ color: "var(--muted-foreground)", fontSize: 11 }}
                formatter={(value: number, name) =>
                  name === "revenue" ? [formatCurrency(value), "Revenue"] : [value, "Calls"]
                }
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--accent)"
                strokeWidth={2}
                fill="url(#revGrad)"
                isAnimationActive
                animationDuration={700}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            <Badge variant="default" className="border-transparent bg-accent/15 text-accent">
              {range === "24h" ? "Live" : "Trend"}
            </Badge>
            <span className="ml-2 font-mono">{data.length} points</span>
          </span>
          <span className="font-mono">
            Peak {formatCurrency(Math.max(...data.map((p) => p.revenue)))}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
