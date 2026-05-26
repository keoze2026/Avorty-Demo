/**
 * HourRhythm — vertical bar chart of call volume by hour, paired with
 * a stacked conversion overlay. Uses BracketCard chrome.
 */

"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { BracketCard } from "@/components/shared/bracket-card";
import { SectionLabel } from "@/components/shared/section-label";
import { formatNumber } from "@/lib/format";
import { TODAY_HOURLY } from "@/lib/mock/timeseries";

export function HourRhythm() {
  const data = TODAY_HOURLY.map((p) => ({
    x: p.label.slice(0, 2),
    calls: p.calls,
    conv: p.conversions,
  }));

  const peakHour = data.reduce((best, p) => (p.calls > best.calls ? p : best), data[0]);
  const totalCalls = data.reduce((s, p) => s + p.calls, 0);
  const totalConv = data.reduce((s, p) => s + p.conv, 0);

  return (
    <BracketCard>
      <SectionLabel
        index={3}
        title="Hour rhythm"
        meta="calls + conversions"
        action={
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-accent/30" />
              calls
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-accent" />
              conv
            </span>
          </div>
        }
      />

      <div className="mb-3 grid grid-cols-3 gap-3 border-b border-border/40 pb-3 text-center sm:text-left">
        <Statlet label="Calls today" value={formatNumber(totalCalls)} />
        <Statlet label="Conversions" value={formatNumber(totalConv)} />
        <Statlet label="Peak hour" value={`${peakHour.x}:00 · ${peakHour.calls}`} />
      </div>

      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 4, left: -22, bottom: 0 }} barCategoryGap={2}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
            <XAxis
              dataKey="x"
              tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              minTickGap={10}
              interval={1}
            />
            <YAxis
              tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <Tooltip
              cursor={{ fill: "var(--accent)", fillOpacity: 0.08 }}
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
                color: "var(--popover-foreground)",
              }}
              labelStyle={{ color: "var(--muted-foreground)", fontSize: 11 }}
              formatter={(v: number, n) => [formatNumber(v), n === "calls" ? "Calls" : "Conversions"]}
            />
            <Bar dataKey="calls" fill="var(--accent)" fillOpacity={0.22} radius={[2, 2, 0, 0]} />
            <Bar dataKey="conv" fill="var(--accent)" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </BracketCard>
  );
}

function Statlet({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-mono text-sm font-semibold tabular-nums">{value}</div>
    </div>
  );
}
