"use client";

import { useMemo } from "react";
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
import { formatNumber } from "@/lib/format";
import { MOCK_CALLS } from "@/lib/mock/calls";
import { MOCK_CAMPAIGNS } from "@/lib/mock/campaigns";
import type { Call } from "@/lib/types";

interface Row {
  id: string;
  name: string;
  connected: number;
  vertical: string;
}

interface TopCampaignsBarsProps {
  /** When provided, top-6 are computed from these calls' connected count per campaign. */
  calls?: Call[];
}

/** Status values that count a call as "connected" (answered + still live). */
function isConnected(status: Call["status"]) {
  return status === "completed" || status === "in-progress";
}

export function TopCampaignsBars({ calls }: TopCampaignsBarsProps = {}) {
  const data = useMemo<Row[]>(() => {
    const source = calls ?? MOCK_CALLS;

    const campaignById = new Map<string, (typeof MOCK_CAMPAIGNS)[number]>();
    for (const c of MOCK_CAMPAIGNS) campaignById.set(c.id, c);

    const m = new Map<string, Row>();
    for (const call of source) {
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
  }, [calls]);

  // Recharts BarChart with layout="vertical" renders horizontal bars (y = category, x = value).
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-semibold">Top campaigns</CardTitle>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Connected calls today, by campaign
          </p>
        </div>
        <Link
          href={ROUTES.campaigns}
          className="inline-flex items-center gap-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          View all <ArrowUpRight className="h-3 w-3" />
        </Link>
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
                tick={{ fontSize: 11, fill: "var(--foreground)" }}
                axisLine={false}
                tickLine={false}
                width={160}
                tickFormatter={(v: string) => (v.length > 22 ? `${v.slice(0, 20)}…` : v)}
              />
              <Tooltip
                {...CHART_TOOLTIP_PROPS}
                cursor={{ fill: "var(--muted)", fillOpacity: 0.5 }}
                formatter={(v: number) => [formatNumber(v), "Connected"]}
              />
              <Bar
                dataKey="connected"
                radius={[0, 4, 4, 0]}
                isAnimationActive
                animationDuration={500}
                background={{ fill: "var(--muted)", radius: 4, opacity: 0.5 }}
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
