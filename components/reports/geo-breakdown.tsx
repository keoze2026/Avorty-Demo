"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Globe2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GroupAggregate } from "@/lib/analytics";
import { CHART_TOOLTIP_PROPS } from "@/lib/chart-tooltip";
import { formatCurrency } from "@/lib/format";

export function GeoBreakdown({ rows }: { rows: GroupAggregate[] }) {
  const data = rows.slice(0, 10).map((r) => ({ state: r.key, calls: r.count, revenue: r.revenue }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Globe2 className="h-4 w-4 text-accent" />
          Top states
        </CardTitle>
        <p className="text-xs text-muted-foreground">Call volume by state, top 10</p>
      </CardHeader>
      <CardContent>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }} barCategoryGap={4}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
              <XAxis
                dataKey="state"
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip
                {...CHART_TOOLTIP_PROPS}
                cursor={{ fill: "var(--accent)", fillOpacity: 0.06 }}
                formatter={(v: number, n) =>
                  n === "revenue" ? [formatCurrency(v), "Revenue"] : [v, "Calls"]
                }
              />
              <Bar dataKey="calls" fill="var(--accent)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
