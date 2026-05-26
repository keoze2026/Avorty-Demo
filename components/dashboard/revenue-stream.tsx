/**
 * RevenueStream — bracket-card wrapped revenue area chart.
 * Replaces the boxed RevenueChart for the redesigned Dashboard.
 */

"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { BracketCard } from "@/components/shared/bracket-card";
import { SectionLabel } from "@/components/shared/section-label";
import { formatCurrency } from "@/lib/format";
import { LAST_14_DAYS, TODAY_HOURLY } from "@/lib/mock/timeseries";
import { cn } from "@/lib/utils";

type Range = "24h" | "14d";

const RANGES: Array<{ id: Range; label: string }> = [
  { id: "24h", label: "24H" },
  { id: "14d", label: "14D" },
];

export function RevenueStream() {
  const [range, setRange] = React.useState<Range>("24h");
  const data =
    range === "24h"
      ? TODAY_HOURLY.map((p) => ({ x: p.label, revenue: p.revenue }))
      : LAST_14_DAYS.map((p) => ({ x: p.label, revenue: p.revenue }));

  const total = data.reduce((s, p) => s + p.revenue, 0);
  const peak = Math.max(...data.map((p) => p.revenue));
  const avg = Math.round(total / Math.max(data.length, 1));

  return (
    <BracketCard grid>
      <SectionLabel
        index={1}
        title="Revenue stream"
        meta={range === "24h" ? "hour buckets" : "daily totals"}
        action={
          <div className="flex gap-0.5 rounded-md border border-border bg-secondary/40 p-0.5">
            {RANGES.map((r) => (
              <button
                key={r.id}
                onClick={() => setRange(r.id)}
                className={cn(
                  "rounded px-2 py-1 font-mono text-[10px] tracking-wider transition-colors",
                  range === r.id
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        }
      />

      {/* Header stat row */}
      <div className="mb-3 grid grid-cols-3 gap-3 border-t border-b border-border/40 py-3">
        <Statlet label="Total" value={formatCurrency(total)} highlight />
        <Statlet label="Peak" value={formatCurrency(peak)} />
        <Statlet label="Avg / bucket" value={formatCurrency(avg)} />
      </div>

      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="rev-stream-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
            <XAxis
              dataKey="x"
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              minTickGap={28}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${Math.round(v / 1000)}k`}
              width={42}
            />
            <Tooltip
              cursor={{ stroke: "var(--accent)", strokeOpacity: 0.5, strokeWidth: 1 }}
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
                color: "var(--popover-foreground)",
              }}
              labelStyle={{ color: "var(--muted-foreground)", fontSize: 11 }}
              formatter={(value: number) => [formatCurrency(value), "Revenue"]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--accent)"
              strokeWidth={2}
              fill="url(#rev-stream-grad)"
              isAnimationActive
              animationDuration={700}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </BracketCard>
  );
}

function Statlet({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="min-w-0">
      <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "mt-1 truncate font-mono text-lg font-semibold tabular-nums",
          highlight && "text-accent",
        )}
      >
        {value}
      </div>
    </div>
  );
}
