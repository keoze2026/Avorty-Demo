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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CHART_TOOLTIP_PROPS } from "@/lib/chart-tooltip";
import { formatCurrency } from "@/lib/format";
import {
  MOCK_REFERRED_CLIENTS,
  REFERRAL_COMMISSION_RATE,
  type ReferredClient,
} from "@/lib/mock/referrals";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

type RangeId = "14d" | "30d" | "90d";

const RANGES: Array<{ id: RangeId; label: string; days: number }> = [
  { id: "14d", label: "14d", days: 14 },
  { id: "30d", label: "30d", days: 30 },
  { id: "90d", label: "90d", days: 90 },
];

const DAY_MS = 24 * 60 * 60 * 1000;

interface Bucket {
  label: string;
  ts: number;
  spend: number;
  commission: number;
}

/** Stable deterministic hash so synthetic per-day spend doesn't reshuffle. */
function hash(s: string, salt: number): number {
  let h = salt | 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 33 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h) / 2_147_483_647;
}

/**
 * Build a daily spend series for the requested window by spreading each
 * client's `monthSpend` across the days they were active in the window,
 * with a deterministic per-day jitter so the bars don't sit flat.
 */
function buildDailySpend(
  clients: ReferredClient[],
  days: number,
): { ts: number; spend: number }[] {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const startMs = start.getTime() - (days - 1) * DAY_MS;

  const out: { ts: number; spend: number }[] = Array.from({ length: days }, (_, i) => ({
    ts: startMs + i * DAY_MS,
    spend: 0,
  }));

  for (const c of clients) {
    // A client only contributes from the day they joined onward.
    for (let i = 0; i < days; i++) {
      const dayMs = startMs + i * DAY_MS;
      if (dayMs < c.joinedAt) continue;
      // Churned clients fade out toward the end of the window.
      const churnFade =
        c.status === "churned"
          ? Math.max(0, 1 - (dayMs - c.joinedAt) / (days * DAY_MS))
          : 1;
      // Base = monthSpend / 30 so the daily average matches the documented
      // monthly figure. Jitter ±40% with a deterministic per-day factor.
      const base = (c.monthSpend / 30) * churnFade;
      const j = 0.6 + hash(c.id, i + 7) * 0.8;
      out[i].spend += base * j;
    }
  }
  return out;
}

export function ReferralSpendChart() {
  const { t } = useTranslation();
  const [range, setRange] = React.useState<RangeId>("30d");

  const data = React.useMemo<Bucket[]>(() => {
    const days = RANGES.find((r) => r.id === range)?.days ?? 30;
    const daily = buildDailySpend(MOCK_REFERRED_CLIENTS, days);
    return daily.map((d) => {
      const date = new Date(d.ts);
      const label =
        days <= 14
          ? `${(date.getMonth() + 1).toString().padStart(2, "0")}-${date
              .getDate()
              .toString()
              .padStart(2, "0")}`
          : days <= 30
            ? `${date.getDate()}`
            : `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date
                .getDate()
                .toString()
                .padStart(2, "0")}`;
      return {
        label,
        ts: d.ts,
        spend: d.spend,
        commission: d.spend * REFERRAL_COMMISSION_RATE,
      };
    });
  }, [range]);

  const totals = React.useMemo(() => {
    let spend = 0;
    let commission = 0;
    for (const d of data) {
      spend += d.spend;
      commission += d.commission;
    }
    return { spend, commission };
  }, [data]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-semibold">{t("toolsUI.referrals.chart.title")}</CardTitle>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {t("toolsUI.referrals.chart.description").replace(
              "{pct}",
              String(REFERRAL_COMMISSION_RATE * 100),
            )}
          </p>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-xl font-semibold tabular-nums">
              {formatCurrency(totals.spend)}
            </span>
            <span className="text-[11px] text-muted-foreground">{t("toolsUI.referrals.chart.spendLabel")}</span>
            <span className="text-[11px] tabular-nums text-[oklch(0.5_0.18_155)] dark:text-[oklch(0.78_0.18_155)]">
              · {formatCurrency(totals.commission)}{t("toolsUI.referrals.chart.earnedSuffix")}
            </span>
          </div>
        </div>
        <div
          role="tablist"
          aria-label={t("toolsUI.referrals.chart.rangeAria")}
          className="inline-flex rounded-md border border-border bg-muted/30 p-0.5"
        >
          {RANGES.map((r) => {
            const active = range === r.id;
            return (
              <button
                key={r.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setRange(r.id)}
                className={cn(
                  "rounded-[5px] px-2 py-1 text-[10px] font-medium uppercase tracking-wider transition-colors",
                  active
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 12, right: 36, left: -8, bottom: 0 }}
            >
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
                yAxisId="spend"
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                width={48}
                tickFormatter={(v: number) => {
                  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
                  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
                  return `$${v.toFixed(0)}`;
                }}
              />
              <YAxis
                yAxisId="commission"
                orientation="right"
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                width={36}
                tickFormatter={(v: number) => {
                  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
                  return `$${v.toFixed(0)}`;
                }}
              />
              <Tooltip
                {...CHART_TOOLTIP_PROPS}
                cursor={false}
                formatter={(v: number, name) => [
                  formatCurrency(v, true),
                  name === "spend" ? t("toolsUI.referrals.chart.spend") : t("toolsUI.referrals.chart.yourCommission"),
                ]}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                iconSize={8}
                formatter={(v) => (v === "spend" ? t("toolsUI.referrals.chart.spend") : t("toolsUI.referrals.chart.yourCommission"))}
              />
              <Bar
                yAxisId="spend"
                dataKey="spend"
                fill="var(--accent)"
                radius={[3, 3, 0, 0]}
                isAnimationActive
                animationDuration={500}
              />
              <Line
                yAxisId="commission"
                type="monotone"
                dataKey="commission"
                stroke="oklch(0.62 0.18 155)"
                strokeWidth={2}
                dot={{
                  r: 2,
                  stroke: "oklch(0.62 0.18 155)",
                  strokeWidth: 1.5,
                  fill: "var(--card)",
                }}
                activeDot={{
                  r: 4,
                  stroke: "oklch(0.62 0.18 155)",
                  strokeWidth: 2,
                  fill: "var(--card)",
                }}
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
