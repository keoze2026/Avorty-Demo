"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TODAY_HOURLY } from "@/lib/mock/timeseries";
import { formatNumber } from "@/lib/format";

export function CallVolumeChart() {
  const data = TODAY_HOURLY.map((p) => ({ x: p.label, calls: p.calls, conv: p.conversions }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Call volume by hour</CardTitle>
        <p className="text-xs text-muted-foreground">Today, segmented by conversion</p>
      </CardHeader>
      <CardContent>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }} barCategoryGap={4}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
              <XAxis
                dataKey="x"
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                minTickGap={16}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip
                cursor={{ fill: "var(--accent)", fillOpacity: 0.06 }}
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "var(--popover-foreground)",
                }}
                labelStyle={{ color: "var(--muted-foreground)", fontSize: 11 }}
                formatter={(v: number, n) => [formatNumber(v), n === "calls" ? "Calls" : "Conversions"]}
              />
              <Bar dataKey="calls" fill="var(--accent)" fillOpacity={0.25} radius={[3, 3, 0, 0]} />
              <Bar dataKey="conv" fill="var(--accent)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
