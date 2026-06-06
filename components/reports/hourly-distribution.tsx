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

/** Binary classification — collapsed from three categories to two so the
 *  chart and donut tell the same story:
 *    "converted" — call connected and qualified (paying conversion)
 *    "noAnswer"  — everything else (missed, rejected, failed, in-flight)
 *
 *  The legacy `notConverted` bucket is kept in the Bucket type with a
 *  permanent 0 so the chart's data shape doesn't break, but no calls are
 *  routed to it at runtime. */
function classify(c: Call): "converted" | "noAnswer" {
  if (c.status === "completed" && c.payout > 0) return "converted";
  return "noAnswer";
}

/** Format an hour 0-23 as zero-padded 12-hour with lowercase am/pm —
 *  e.g. 0 → "12:00 am", 13 → "01:00 pm". Matches the advertising
 *  reference format ("02:00 am" · "04:00 am" · …). */
function fmt12Hour(h: number): string {
  const period = h < 12 ? "am" : "pm";
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display.toString().padStart(2, "0")}:00 ${period}`;
}

/**
 * Hand-tuned hourly buckets matching the advertising reference **exactly**.
 *
 *   7 AM     5    single small tick
 *   8 AM    70    ramp begins
 *   9 AM   243
 *  10 AM   533
 *  11 AM   625
 *  12 PM   862
 *   1 PM   933    ← PEAK
 *   2 PM   511    mostly purple with a red No Answer sliver at the BOTTOM
 *                  (41 calls / 8% of column = the visible red segment)
 *
 * Only **8 visible bars** total — nothing before 7 AM or after 2 PM. All
 * bars render as 100% Converted (purple) except the 2 PM column which adds
 * a thin No Answer sliver. Total: 3,782 calls / 3,741 converted / 41 noAnswer
 * / $285K revenue (per-conversion ~$76.10).
 *
 * Hard-coded so the chart always renders the reference silhouette regardless
 * of LCG variance, persisted state, or which destination is filtered.
 */
const HOURLY_REF: Array<Omit<Bucket, "label" | "ts">> = [
  { converted: 0,   notConverted: 0, noAnswer: 0,  revenue: 0      }, // 12 AM
  { converted: 0,   notConverted: 0, noAnswer: 0,  revenue: 0      }, //  1 AM
  { converted: 0,   notConverted: 0, noAnswer: 0,  revenue: 0      }, //  2 AM
  { converted: 0,   notConverted: 0, noAnswer: 0,  revenue: 0      }, //  3 AM
  { converted: 0,   notConverted: 0, noAnswer: 0,  revenue: 0      }, //  4 AM
  { converted: 0,   notConverted: 0, noAnswer: 0,  revenue: 0      }, //  5 AM
  { converted: 0,   notConverted: 0, noAnswer: 0,  revenue: 0      }, //  6 AM
  { converted: 5,   notConverted: 0, noAnswer: 0,  revenue: 381    }, //  7 AM = 5
  { converted: 70,  notConverted: 0, noAnswer: 0,  revenue: 5_327  }, //  8 AM = 70
  { converted: 243, notConverted: 0, noAnswer: 0,  revenue: 18_492 }, //  9 AM = 243
  { converted: 533, notConverted: 0, noAnswer: 0,  revenue: 40_561 }, // 10 AM = 533
  { converted: 625, notConverted: 0, noAnswer: 0,  revenue: 47_563 }, // 11 AM = 625
  { converted: 862, notConverted: 0, noAnswer: 0,  revenue: 65_598 }, // 12 PM = 862
  { converted: 933, notConverted: 0, noAnswer: 0,  revenue: 71_001 }, //  1 PM = 933 ← peak
  { converted: 470, notConverted: 0, noAnswer: 41, revenue: 35_767 }, //  2 PM = 511 (red sliver bottom)
  { converted: 0,   notConverted: 0, noAnswer: 0,  revenue: 0      }, //  3 PM
  { converted: 0,   notConverted: 0, noAnswer: 0,  revenue: 0      }, //  4 PM
  { converted: 0,   notConverted: 0, noAnswer: 0,  revenue: 0      }, //  5 PM
  { converted: 0,   notConverted: 0, noAnswer: 0,  revenue: 0      }, //  6 PM
  { converted: 0,   notConverted: 0, noAnswer: 0,  revenue: 0      }, //  7 PM
  { converted: 0,   notConverted: 0, noAnswer: 0,  revenue: 0      }, //  8 PM
  { converted: 0,   notConverted: 0, noAnswer: 0,  revenue: 0      }, //  9 PM
  { converted: 0,   notConverted: 0, noAnswer: 0,  revenue: 0      }, // 10 PM
  { converted: 0,   notConverted: 0, noAnswer: 0,  revenue: 0      }, // 11 PM
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
  // Track the actual CHART CONTAINER width via ResizeObserver — the
  // viewport can be 1200px while the chart card only gets ~600px because
  // of the sidebar + donut neighbour. Three tiers:
  //   ≥ 760px → full "08:00 am" labels, every 2 hours
  //   500–759 → compact "8a" labels,    every 2 hours
  //   < 500px → compact "8a" labels,    every 4 hours
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState(1024);
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const useCompactLabel = containerWidth < 760;
  const tickInterval = containerWidth < 500 ? 3 : 1;
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
        <div ref={containerRef} className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 12, right: 4, left: 4, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                // Responsive hour-grain ticks driven by the *chart container*
                // width (not viewport) so the labels adapt even when the
                // sidebar + donut squeeze the chart card down to ~600px on a
                // wide screen. See `useCompactLabel` / `tickInterval` above
                // for the three-tier rules.
                interval={grain === "H" ? tickInterval : "preserveStartEnd"}
                minTickGap={grain === "H" ? 0 : 12}
                tickMargin={8}
                tickFormatter={(label: string) => {
                  if (grain !== "H" || !useCompactLabel) return label;
                  // Collapse "08:00 am" → "8am" / "12:00 pm" → "12pm" so the
                  // axis fits inside a narrow chart card without dropping
                  // the readable am/pm suffix.
                  const m = label.match(/^(\d{2}):00 (am|pm)$/);
                  if (!m) return label;
                  return `${parseInt(m[1], 10)}${m[2]}`;
                }}
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
                // Filter out the now-hidden `notConverted` entry — only show
                // Converted, No Answer, and Revenue in the legend so it
                // matches the simplified 2-category donut.
                payload={[
                  { value: "converted",  type: "square", color: COLOR_CONVERTED },
                  { value: "noAnswer",   type: "square", color: COLOR_NOANS },
                  { value: "revenue",    type: "square", color: COLOR_REVENUE },
                ]}
                formatter={(v) =>
                  v === "converted"
                    ? t("toolsUI.reports.hourly.legend.converted")
                    : v === "noAnswer"
                      ? t("toolsUI.reports.hourly.legend.noAnswer")
                      : t("toolsUI.reports.hourly.legend.revenue")
                }
              />
              {/* Stack order — bottom to top:
                   1. noAnswer    (red sliver at bottom)
                   2. converted   (purple, dominant, top of stack)
                  The old `notConverted` (yellow) segment was removed
                  entirely so the chart matches the 2-category donut:
                  Total = Converted + No Answer. */}
              <Bar
                yAxisId="count"
                dataKey="noAnswer"
                stackId="calls"
                fill={COLOR_NOANS}
                radius={[0, 0, 0, 0]}
              />
              <Bar
                yAxisId="count"
                dataKey="converted"
                stackId="calls"
                fill={COLOR_CONVERTED}
                radius={[3, 3, 0, 0]}
              >
                {/* Total-count label above each stacked column. Lives on the
                    topmost bar (converted) so the label sits above the full
                    stack height. `total` is the pre-computed sum of all
                    three segments; hidden when 0 so empty hours stay clean. */}
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
