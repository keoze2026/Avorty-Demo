"use client";

import * as React from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";
import type { Call } from "@/lib/types";
import { formatCurrency, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

type Grain = "H" | "D" | "M";

const GRAINS: Array<{ id: Grain; label: string }> = [
  { id: "H", label: "H" },
  { id: "D", label: "D" },
  { id: "M", label: "M" },
];

// Strict two-color binary: indigo for the positive outcome, red for the rest.
// "Not converted" and "No answer" both ride the destructive red so the chart
// reads as good-vs-bad at a glance; "No answer" sits at full strength while
// "Not converted" steps down in opacity to keep them distinguishable.
const COLOR_CONVERTED = "var(--accent)";
const COLOR_NOTCONV = "var(--destructive)";
const COLOR_NOANS = "var(--destructive)";
const COLOR_REVENUE = "var(--accent)";

interface HourlyDistributionProps {
  calls: Call[];
}

interface Bucket {
  label: string;
  /** Start-of-bucket timestamp (ms). Drives the tooltip header. */
  ts: number;
  converted: number;
  notConverted: number;
  noAnswer: number;
  revenue: number;
}

function classify(c: Call): "converted" | "notConverted" | "noAnswer" {
  if (c.status === "missed") return "noAnswer";
  if (c.status === "completed" && c.payout > 0) return "converted";
  return "notConverted";
}

function bucketize(calls: Call[], grain: Grain): Bucket[] {
  const now = new Date();
  const day = 24 * 60 * 60 * 1000;

  if (grain === "H") {
    // Today's calls grouped by hour 0..23
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const slots: Bucket[] = Array.from({ length: 24 }, (_, h) => {
      const d = new Date(startOfDay);
      d.setHours(h, 0, 0, 0);
      return {
        label: `${h.toString().padStart(2, "0")}:00`,
        ts: d.getTime(),
        converted: 0,
        notConverted: 0,
        noAnswer: 0,
        revenue: 0,
      };
    });
    for (const c of calls) {
      if (c.startedAt < startOfDay.getTime()) continue;
      const h = new Date(c.startedAt).getHours();
      const k = classify(c);
      slots[h][k] += 1;
      slots[h].revenue += c.revenue;
    }
    return slots;
  }

  if (grain === "D") {
    // Last 14 days
    const days = 14;
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const slots: Bucket[] = Array.from({ length: days }, (_, i) => {
      const d = new Date(start.getTime() - (days - 1 - i) * day);
      return {
        label: `${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`,
        ts: d.getTime(),
        converted: 0,
        notConverted: 0,
        noAnswer: 0,
        revenue: 0,
      };
    });
    for (const c of calls) {
      const d = new Date(c.startedAt);
      d.setHours(0, 0, 0, 0);
      const offsetDays = Math.round((start.getTime() - d.getTime()) / day);
      if (offsetDays < 0 || offsetDays >= days) continue;
      const idx = days - 1 - offsetDays;
      const k = classify(c);
      slots[idx][k] += 1;
      slots[idx].revenue += c.revenue;
    }
    return slots;
  }

  // M: last 30 days grouped into 5 weekly buckets
  const weeks = 5;
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const slots: Bucket[] = Array.from({ length: weeks }, (_, i) => {
    const d = new Date(start.getTime() - (weeks - 1 - i) * 7 * day);
    return {
      label: `${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`,
      ts: d.getTime(),
      converted: 0,
      notConverted: 0,
      noAnswer: 0,
      revenue: 0,
    };
  });
  for (const c of calls) {
    const offsetDays = Math.round((start.getTime() - c.startedAt) / day);
    if (offsetDays < 0 || offsetDays >= weeks * 7) continue;
    const weekFromOldest = weeks - 1 - Math.floor(offsetDays / 7);
    const k = classify(c);
    slots[weekFromOldest][k] += 1;
    slots[weekFromOldest].revenue += c.revenue;
  }
  return slots;
}

export function HourlyDistribution({ calls }: HourlyDistributionProps) {
  const { t } = useTranslation();
  const [grain, setGrain] = React.useState<Grain>("H");
  const data = React.useMemo(() => bucketize(calls, grain), [calls, grain]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-1 rounded-md border border-border bg-muted p-0.5">
          {GRAINS.map((g) => (
            <button
              key={g.id}
              onClick={() => setGrain(g.id)}
              className={cn(
                "h-7 w-7 rounded text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                grain === g.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {g.label}
            </button>
          ))}
        </div>
        <div className="flex-1 text-center text-xs text-muted-foreground">
          {t("dashboard.chart.callsByHour")}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 12, right: 4, left: -8, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                minTickGap={16}
                tickMargin={8}
              />
              <YAxis
                yAxisId="count"
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                width={32}
                allowDecimals={false}
              />
              {/* Right-side revenue axis — $ ticks for the Revenue line. */}
              <YAxis
                yAxisId="rev"
                orientation="right"
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                width={48}
                tickFormatter={(v: number) => {
                  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
                  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
                  return `$${v}`;
                }}
              />
              <Tooltip
                cursor={{ fill: "var(--muted)", fillOpacity: 0.5 }}
                content={<HourlyTooltipWrapper grain={grain} />}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                iconSize={8}
                formatter={(v) =>
                  v === "converted"
                    ? t("toolsUI.reports.hourly.legend.converted")
                    : v === "notConverted"
                      ? t("toolsUI.reports.hourly.legend.notConverted")
                      : v === "noAnswer"
                        ? t("toolsUI.reports.hourly.legend.noAnswer")
                        : t("toolsUI.reports.hourly.legend.revenue")
                }
              />
              <Bar
                yAxisId="count"
                dataKey="converted"
                stackId="calls"
                fill={COLOR_CONVERTED}
                radius={[0, 0, 0, 0]}
              />
              <Bar
                yAxisId="count"
                dataKey="notConverted"
                stackId="calls"
                fill={COLOR_NOTCONV}
                radius={[0, 0, 0, 0]}
              />
              <Bar
                yAxisId="count"
                dataKey="noAnswer"
                stackId="calls"
                fill={COLOR_NOANS}
                radius={[3, 3, 0, 0]}
              />
              <Line
                yAxisId="rev"
                type="monotone"
                dataKey="revenue"
                stroke={COLOR_REVENUE}
                strokeWidth={2}
                dot={{ r: 2, stroke: COLOR_REVENUE, strokeWidth: 1.5, fill: "var(--card)" }}
                activeDot={{ r: 4, stroke: COLOR_REVENUE, strokeWidth: 2, fill: "var(--card)" }}
                isAnimationActive
                animationDuration={500}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Custom tooltip                                                      */
/* ─────────────────────────────────────────────────────────────────── */

interface TooltipPayload {
  payload?: Bucket;
}

interface HourlyTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  grain: Grain;
}

const DOW = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function headerForBucket(b: Bucket, grain: Grain, weekOfLabel: string): string {
  const d = new Date(b.ts);
  if (grain === "H") {
    // "Friday, May 29, 13:00"
    return `${DOW[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${b.label}`;
  }
  if (grain === "D") {
    // "Friday, May 29"
    return `${DOW[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
  }
  // M: "Week of May 22"
  return `${weekOfLabel} ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

function HourlyTooltipWrapper(props: HourlyTooltipProps) {
  const { t } = useTranslation();
  return <HourlyTooltipInner {...props} t={t} />;
}

function HourlyTooltipInner({ active, payload, grain, t }: HourlyTooltipProps & { t: (k: string) => string }) {
  if (!active || !payload || payload.length === 0) return null;
  const b = payload[0]?.payload;
  if (!b) return null;

  const total = b.converted + b.notConverted + b.noAnswer;
  const rows: Array<{ color: string; label: string; value: string }> = [
    { color: "var(--muted-foreground)", label: t("toolsUI.reports.hourly.tooltip.totalCalls"), value: formatNumber(total) },
    { color: COLOR_CONVERTED, label: t("toolsUI.reports.hourly.tooltip.converted"), value: formatNumber(b.converted) },
    { color: COLOR_NOTCONV, label: t("toolsUI.reports.hourly.tooltip.notConverted"), value: formatNumber(b.notConverted) },
    { color: COLOR_NOANS, label: t("toolsUI.reports.hourly.tooltip.noAnswer"), value: formatNumber(b.noAnswer) },
    { color: COLOR_REVENUE, label: t("toolsUI.reports.hourly.tooltip.revenue"), value: formatCurrency(b.revenue, true) },
  ];

  return (
    <div className="rounded-md border border-border bg-popover/95 px-3 py-2 text-xs shadow-lg backdrop-blur-md">
      <div className="mb-1.5 font-semibold text-foreground">
        {headerForBucket(b, grain, t("toolsUI.reports.hourly.tooltip.weekOf"))}
      </div>
      <ul className="space-y-1">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center gap-2">
            <span
              aria-hidden
              className="inline-block h-2 w-2 shrink-0 rounded-full"
              style={{ background: r.color }}
            />
            <span className="text-muted-foreground">{r.label}</span>
            <span className="ml-auto font-semibold tabular-nums text-foreground">
              {r.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
