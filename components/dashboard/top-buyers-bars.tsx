"use client";

/**
 * Top buyers — horizontal-bar chart that mirrors TopCampaignsBars exactly
 * in structure, header, range selector, and "view all" link. The point of
 * a leaderboard pair is that both panels read as one visual idea applied
 * to two dimensions; differences in component vocabulary break that.
 *
 * Y axis = buyer name (categorical), X axis = revenue today. Top 6 ranked.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CHART_TOOLTIP_PROPS } from "@/lib/chart-tooltip";
import { ROUTES } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import type { Buyer, Call } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";

type RangeId = "today" | "14d" | "30d";
interface RangeDef { id: RangeId; labelKey: string; days: number; }
const RANGES: RangeDef[] = [
  { id: "today", labelKey: "dashboard.range.today",        days: 1 },
  { id: "14d",   labelKey: "dashboard.range.fourteenDays", days: 14 },
  { id: "30d",   labelKey: "dashboard.range.monthly",      days: 30 },
];

interface Row {
  id: string;
  name: string;
  revenue: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

interface TopBuyersBarsProps {
  calls: Call[];
  buyers: Buyer[];
}

export function TopBuyersBars({ calls, buyers }: TopBuyersBarsProps) {
  const { t } = useTranslation();
  const [range, setRange] = useState<RangeId>("today");

  const data = useMemo<Row[]>(() => {
    let cutoffMs: number;
    if (range === "today") {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      cutoffMs = d.getTime();
    } else {
      const days = RANGES.find((r) => r.id === range)?.days ?? 14;
      cutoffMs = Date.now() - days * DAY_MS;
    }

    const buyerById = new Map(buyers.map((b) => [b.id, b]));
    const agg = new Map<string, Row>();
    for (const c of calls) {
      if (c.startedAt < cutoffMs) continue;
      if (c.status !== "completed") continue;
      if (!c.buyerId) continue;
      const b = buyerById.get(c.buyerId);
      if (!b) continue;
      let row = agg.get(b.id);
      if (!row) {
        row = { id: b.id, name: b.name, revenue: 0 };
        agg.set(b.id, row);
      }
      row.revenue += c.revenue;
    }
    return Array.from(agg.values())
      .filter((r) => r.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
  }, [calls, buyers, range]);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-3 pb-2">
        <div>
          <CardTitle className="text-sm font-semibold">Top buyers</CardTitle>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Revenue today, by buyer
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            role="tablist"
            aria-label="Time range"
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
                  {t(r.labelKey)}
                </button>
              );
            })}
          </div>
          <Link
            href={ROUTES.buyers}
            className="inline-flex items-center gap-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("common.viewAll")} <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 4, right: 72, left: 4, bottom: 4 }}
              barCategoryGap={12}
            >
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                width={160}
                interval={0}
                tick={(props: { x: number; y: number; payload: { value: string } }) => {
                  const { x, y, payload } = props;
                  const v = payload.value;
                  const label = v.length > 22 ? `${v.slice(0, 20)}…` : v;
                  return (
                    <text x={x - 156} y={y} dy={4} fontSize={11} fill="var(--foreground)" textAnchor="start">
                      {label}
                    </text>
                  );
                }}
              />
              <Tooltip
                {...CHART_TOOLTIP_PROPS}
                cursor={false}
                formatter={(v: number) => [formatCurrency(v), "Revenue"]}
              />
              <Bar dataKey="revenue" radius={[0, 4, 4, 0]} isAnimationActive animationDuration={500}>
                {data.map((d, i) => (
                  <Cell key={d.id} fill="var(--accent)" fillOpacity={1 - i * 0.12} />
                ))}
                <LabelList
                  dataKey="revenue"
                  position="right"
                  formatter={(v: number) => formatCurrency(v)}
                  fill="var(--muted-foreground)"
                  fontSize={11}
                  className="tabular-nums"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
