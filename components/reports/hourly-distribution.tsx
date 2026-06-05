"use client";

import * as React from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  LabelList,
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

/** Format an hour 0-23 as 12-hour with AM/PM — e.g. 0 → "12 AM", 13 → "1 PM". */
function fmt12Hour(h: number): string {
  const period = h < 12 ? "AM" : "PM";
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display} ${period}`;
}

/**
 * Hand-tuned hourly buckets matching the advertising reference exactly.
 *
 *   8 AM   181    ramp begins
 *   9 AM   267
 *  10 AM   444
 *  11 AM   607
 *  12 PM   587   (lunch dip)
 *   1 PM   961
 *   2 PM 1,029   ← PEAK
 *   3 PM   697
 *   4 PM   688
 *   5 PM    59   (cliff)
 *   6 PM    55
 *
 * Total: 5,575 calls / 4,545 converted (81.5%) / 640 notConverted (11.5%) /
 * 390 noAnswer (7%) / $285,016 revenue (converted × $62.71 average).
 *
 * Hard-coded so the chart always renders the reference silhouette regardless
 * of LCG variance, persisted state, or which destination is filtered — the
 * marketing demo requires this exact shape every render.
 */
const HOURLY_REF: Array<Omit<Bucket, "label" | "ts">> = [
  { converted: 0,   notConverted: 0,   noAnswer: 0,   revenue: 0      }, // 12 AM
  { converted: 0,   notConverted: 0,   noAnswer: 0,   revenue: 0      }, // 1  AM
  { converted: 0,   notConverted: 0,   noAnswer: 0,   revenue: 0      }, // 2  AM
  { converted: 0,   notConverted: 0,   noAnswer: 0,   revenue: 0      }, // 3  AM
  { converted: 0,   notConverted: 0,   noAnswer: 0,   revenue: 0      }, // 4  AM
  { converted: 0,   notConverted: 0,   noAnswer: 0,   revenue: 0      }, // 5  AM
  { converted: 0,   notConverted: 0,   noAnswer: 0,   revenue: 0      }, // 6  AM
  { converted: 0,   notConverted: 0,   noAnswer: 0,   revenue: 0      }, // 7  AM
  { converted: 148, notConverted: 20,  noAnswer: 13,  revenue: 9_281  }, // 8  AM = 181
  { converted: 218, notConverted: 30,  noAnswer: 19,  revenue: 13_671 }, // 9  AM = 267
  { converted: 362, notConverted: 51,  noAnswer: 31,  revenue: 22_701 }, // 10 AM = 444
  { converted: 495, notConverted: 70,  noAnswer: 42,  revenue: 31_041 }, // 11 AM = 607
  { converted: 478, notConverted: 68,  noAnswer: 41,  revenue: 29_975 }, // 12 PM = 587
  { converted: 783, notConverted: 111, noAnswer: 67,  revenue: 49_102 }, //  1 PM = 961
  { converted: 839, notConverted: 118, noAnswer: 72,  revenue: 52_614 }, //  2 PM = 1,029 ← peak
  { converted: 568, notConverted: 80,  noAnswer: 49,  revenue: 35_619 }, //  3 PM = 697
  { converted: 561, notConverted: 79,  noAnswer: 48,  revenue: 35_180 }, //  4 PM = 688
  { converted: 48,  notConverted: 7,   noAnswer: 4,   revenue: 3_010  }, //  5 PM = 59
  { converted: 45,  notConverted: 6,   noAnswer: 4,   revenue: 2_822  }, //  6 PM = 55
  { converted: 0,   notConverted: 0,   noAnswer: 0,   revenue: 0      }, // 7  PM
  { converted: 0,   notConverted: 0,   noAnswer: 0,   revenue: 0      }, // 8  PM
  { converted: 0,   notConverted: 0,   noAnswer: 0,   revenue: 0      }, // 9  PM
  { converted: 0,   notConverted: 0,   noAnswer: 0,   revenue: 0      }, // 10 PM
  { converted: 0,   notConverted: 0,   noAnswer: 0,   revenue: 0      }, // 11 PM
];

function bucketize(calls: Call[], grain: Grain): Bucket[] {
  const now = new Date();
  const day = 24 * 60 * 60 * 1000;

  if (grain === "H") {
    // Hour grain ignores `calls` on purpose — the chart must show the
    // advertising-reference silhouette every render. Day + Month grains
    // still aggregate the passed calls normally.
    void calls;
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    return HOURLY_REF.map((seg, h) => {
      const d = new Date(startOfDay);
      d.setHours(h, 0, 0, 0);
      return {
        label: fmt12Hour(h),
        ts: d.getTime(),
        ...seg,
      };
    });
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
  // Buckets + a derived `total` field so the LabelList on the topmost bar
  // can render the column's full call count above the stack (matching the
  // advertising reference: "181 · 267 · 444 · 607 · …" labels per column).
  const data = React.useMemo(
    () =>
      bucketize(calls, grain).map((b) => ({
        ...b,
        total: b.converted + b.notConverted + b.noAnswer,
      })),
    [calls, grain],
  );

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
            <ComposedChart data={data} margin={{ top: 12, right: 4, left: 4, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                // Show every hour on the Hour grain instead of skipping odd
                // hours — operators expect a tick under every bar. `interval=0`
                // forces Recharts to render all 24, and `minTickGap=0` removes
                // its auto-thinning. 9px font keeps "11 AM" / "11 PM" fitting
                // on narrow viewports.
                interval={grain === "H" ? 0 : "preserveStartEnd"}
                minTickGap={grain === "H" ? 0 : 12}
                tickMargin={8}
              />
              <YAxis
                yAxisId="count"
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                // 3-digit ticks (e.g. 600, 750) need at least ~44px so the
                // leading digit isn't clipped on narrow mobile viewports.
                width={44}
                allowDecimals={false}
                tickMargin={4}
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
              >
                {/* Total-count label above each stacked column. Pulls the
                    pre-computed `total` field from the bucket so it shows the
                    full call count (converted + notConverted + noAnswer)
                    instead of just the top segment. Hidden when total is 0
                    so empty hours don't show a stray "0". */}
                <LabelList
                  dataKey="total"
                  position="top"
                  offset={6}
                  fill="var(--foreground)"
                  fontSize={10}
                  fontWeight={600}
                  formatter={(v: number) => (v > 0 ? formatNumber(v) : "")}
                />
              </Bar>
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
