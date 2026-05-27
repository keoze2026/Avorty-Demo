"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CHART_TOOLTIP_PROPS } from "@/lib/chart-tooltip";
import { ROUTES } from "@/lib/constants";
import { DASHBOARD_PALETTE } from "@/lib/dashboard-palette";
import { formatCurrency } from "@/lib/format";
import { topCampaignsByRevenue } from "@/lib/mock/timeseries";
import { MOCK_CAMPAIGNS } from "@/lib/mock/campaigns";

export function TopCampaignsBars() {
  // Map vertical → palette slot so the bar color here matches the donut slice.
  const verticalsByVolume = (() => {
    const m = new Map<string, number>();
    for (const c of MOCK_CAMPAIGNS) {
      m.set(c.vertical, (m.get(c.vertical) ?? 0) + c.callsToday);
    }
    return Array.from(m.entries())
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);
  })();

  const colorFor = (vertical: string) => {
    const idx = verticalsByVolume.indexOf(vertical);
    return DASHBOARD_PALETTE[(idx >= 0 ? idx : 0) % DASHBOARD_PALETTE.length];
  };

  const data = topCampaignsByRevenue(6).map((c) => ({
    id: c.id,
    name: c.name,
    revenue: c.revenueToday,
    vertical: c.vertical,
    fill: colorFor(c.vertical),
  }));

  // Recharts BarChart with layout="vertical" renders horizontal bars (y = category, x = value).
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base">Top campaigns</CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">Revenue today, by campaign</p>
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
              margin={{ top: 4, right: 36, left: 4, bottom: 4 }}
              barCategoryGap={10}
            >
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${Math.round(v / 1000)}k`}
              />
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
              <Bar dataKey="revenue" radius={[0, 4, 4, 0]} isAnimationActive animationDuration={500}>
                {data.map((d) => (
                  <Cell key={d.id} fill={d.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
