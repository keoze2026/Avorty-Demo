"use client";

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
import { useTranslation } from "@/hooks/use-translation";
import { CHART_TOOLTIP_PROPS } from "@/lib/chart-tooltip";
import { ROUTES } from "@/lib/constants";
import { formatNumber } from "@/lib/format";
import { useCallsStore } from "@/lib/store/calls-store";
import { useCampaignsStore } from "@/lib/store/campaigns-store";
import type { Call } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Row {
  id: string;
  name: string;
  connected: number;
  vertical: string;
}

type RangeId = "today" | "14d" | "30d";

interface RangeDef { id: RangeId; labelKey: string; days: number; }

const RANGES: RangeDef[] = [
  { id: "today", labelKey: "dashboard.range.today",        days: 1 },
  { id: "14d",   labelKey: "dashboard.range.fourteenDays", days: 14 },
  { id: "30d",   labelKey: "dashboard.range.monthly",      days: 30 },
];

interface TopCampaignsBarsProps {
  /** When provided, top-6 are computed from these calls' connected count per campaign. */
  calls?: Call[];
}

/** Status values that count a call as "connected" (answered + still live). */
function isConnected(status: Call["status"]) {
  return status === "completed" || status === "in-progress";
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function TopCampaignsBars({ calls }: TopCampaignsBarsProps = {}) {
  const { t } = useTranslation();
  const [range, setRange] = useState<RangeId>("today");
  const recentCalls = useCallsStore((s) => s.recent);
  const campaigns = useCampaignsStore((s) => s.campaigns);

  const data = useMemo<Row[]>(() => {
    const source = calls ?? recentCalls;

    // For "today" the cutoff is local midnight; for 14d/30d we take a rolling
    // window measured from now so the chart doesn't snap to a calendar boundary.
    let cutoffMs: number;
    if (range === "today") {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      cutoffMs = d.getTime();
    } else {
      const days = RANGES.find((r) => r.id === range)?.days ?? 14;
      cutoffMs = Date.now() - days * DAY_MS;
    }

    const campaignById = new Map<string, (typeof campaigns)[number]>();
    for (const c of campaigns) campaignById.set(c.id, c);

    const m = new Map<string, Row>();
    for (const call of source) {
      if (call.startedAt < cutoffMs) continue;
      if (!isConnected(call.status)) continue;
      const camp = campaignById.get(call.campaignId);
      if (!camp) continue;
      let row = m.get(camp.id);
      if (!row) {
        row = {
          id: camp.id,
          name: camp.name,
          vertical: camp.vertical,
          connected: 0,
        };
        m.set(camp.id, row);
      }
      row.connected += 1;
    }
    return Array.from(m.values())
      .filter((r) => r.connected > 0)
      .sort((a, b) => b.connected - a.connected)
      .slice(0, 6);
  }, [calls, range, recentCalls, campaigns]);

  const subLabel = t("dashboard.topCampaignsHint");

  // Recharts BarChart with layout="vertical" renders horizontal bars (y = category, x = value).
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-3 pb-2">
        <div>
          <CardTitle className="text-sm font-semibold">{t("dashboard.topCampaigns")}</CardTitle>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {subLabel}
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
            href={ROUTES.campaigns}
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
                // Custom tick: render the label at the LEFT edge of the YAxis
                // area, with text-anchor:start. That way every campaign name
                // starts in the same column instead of right-justifying to the
                // bar (which makes them wander as names vary in length).
                tick={(props: {
                  x: number;
                  y: number;
                  payload: { value: string };
                }) => {
                  const { x, y, payload } = props;
                  const v = payload.value;
                  const label = v.length > 22 ? `${v.slice(0, 20)}…` : v;
                  return (
                    <text
                      x={x - 156}
                      y={y}
                      dy={4}
                      fontSize={11}
                      fill="var(--foreground)"
                      textAnchor="start"
                    >
                      {label}
                    </text>
                  );
                }}
              />
              <Tooltip
                {...CHART_TOOLTIP_PROPS}
                cursor={false}
                formatter={(v: number) => [formatNumber(v), t("dashboard.tooltips.connected")]}
              />
              <Bar
                dataKey="connected"
                radius={[0, 4, 4, 0]}
                isAnimationActive
                animationDuration={500}
              >
                {/* Top bar gets the brand accent at full strength, others fade
                    slightly so the ranking reads at a glance — single hue only. */}
                {data.map((d, i) => (
                  <Cell
                    key={d.id}
                    fill="var(--accent)"
                    fillOpacity={1 - i * 0.10}
                  />
                ))}
                <LabelList
                  dataKey="connected"
                  position="right"
                  formatter={(value: number) => formatNumber(value)}
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
