"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CHART_TOOLTIP_PROPS } from "@/lib/chart-tooltip";
import { MOCK_CAMPAIGNS } from "@/lib/mock/campaigns";
import { DASHBOARD_PALETTE } from "@/lib/dashboard-palette";
import { formatNumber } from "@/lib/format";

interface Slice {
  name: string;
  calls: number;
  color: string;
}

function buildSlices(): Slice[] {
  const byVertical = new Map<string, number>();
  for (const c of MOCK_CAMPAIGNS) {
    byVertical.set(c.vertical, (byVertical.get(c.vertical) ?? 0) + c.callsToday);
  }
  return Array.from(byVertical.entries())
    .filter(([, calls]) => calls > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([name, calls], i) => ({
      name,
      calls,
      color: DASHBOARD_PALETTE[i % DASHBOARD_PALETTE.length],
    }));
}

export function VerticalDonut() {
  const slices = buildSlices();
  const total = slices.reduce((s, x) => s + x.calls, 0);

  return (
    <Card>
      <CardHeader className="space-y-0 pb-1">
        <CardTitle className="text-sm">By vertical</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center pb-4 pt-1">
        <div className="relative h-56 w-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={slices}
                dataKey="calls"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="62%"
                outerRadius="92%"
                paddingAngle={2}
                stroke="var(--card)"
                strokeWidth={3}
                isAnimationActive
                animationDuration={500}
              >
                {slices.map((s) => (
                  <Cell key={s.name} fill={s.color} />
                ))}
              </Pie>
              <Tooltip
                {...CHART_TOOLTIP_PROPS}
                formatter={(value: number, name) => [
                  `${formatNumber(value)} calls`,
                  name as string,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</span>
            <span className="text-2xl font-semibold tabular-nums">{formatNumber(total)}</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">calls</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
