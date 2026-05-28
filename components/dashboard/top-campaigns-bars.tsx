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
import { formatCurrency } from "@/lib/format";
import { topCampaignsByRevenue } from "@/lib/mock/timeseries";
import { MOCK_CAMPAIGNS } from "@/lib/mock/campaigns";
import type { Call } from "@/lib/types";

interface Row {
  id: string;
  name: string;
  revenue: number;
  vertical: string;
}

interface TopCampaignsBarsProps {
  /** When provided, top-6 are computed from these calls' revenue (per campaign). */
  calls?: Call[];
}

export function TopCampaignsBars({ calls }: TopCampaignsBarsProps = {}) {
  const data = useMemo<Row[]>(() => {
    if (calls) {
      // Re-aggregate revenue per campaign from the filtered call set.
      const campaignById = new Map<string, (typeof MOCK_CAMPAIGNS)[number]>();
      for (const c of MOCK_CAMPAIGNS) campaignById.set(c.id, c);

      const m = new Map<string, Row>();
      for (const call of calls) {
        const camp = campaignById.get(call.campaignId);
        if (!camp) continue;
        let row = m.get(camp.id);
        if (!row) {
          row = {
            id: camp.id,
            name: camp.name,
            vertical: camp.vertical,
            revenue: 0,
          };
          m.set(camp.id, row);
        }
        row.revenue += call.revenue;
      }
      return Array.from(m.values())
        .filter((r) => r.revenue > 0)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 6);
    }

    return topCampaignsByRevenue(6).map((c) => ({
      id: c.id,
      name: c.name,
      revenue: c.revenueToday,
      vertical: c.vertical,
    }));
  }, [calls]);

  // Recharts BarChart with layout="vertical" renders horizontal bars (y = category, x = value).
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-semibold">Top campaigns</CardTitle>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Revenue today, by campaign</p>
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
                formatter={(v: number) => [formatCurrency(v), "Revenue"]}
              />
              <Bar
                dataKey="revenue"
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
                  dataKey="revenue"
                  position="right"
                  formatter={(value: number) => formatCurrency(value)}
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
