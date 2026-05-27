"use client";

import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import { CHART_TOOLTIP_PROPS } from "@/lib/chart-tooltip";
import { DASHBOARD_PALETTE } from "@/lib/dashboard-palette";
import { TODAY_HOURLY } from "@/lib/mock/timeseries";
import { formatNumber } from "@/lib/format";
import type { Call } from "@/lib/types";

interface VerticalDonutProps {
  /** When provided, success vs drop is counted from these calls. Otherwise the
   *  numbers come from TODAY_HOURLY (matching the default-mode KPI block). */
  calls?: Call[];
}

const SUCCESS_COLOR = DASHBOARD_PALETTE[0]; // teal
const DROP_COLOR = "var(--destructive)"; // red

export function VerticalDonut({ calls }: VerticalDonutProps = {}) {
  const { total, completed, dropped } = useMemo(() => {
    if (calls) {
      const all = calls.length;
      const ok = calls.filter((c) => c.status === "completed").length;
      return { total: all, completed: ok, dropped: Math.max(0, all - ok) };
    }
    const all = TODAY_HOURLY.reduce((s, p) => s + p.calls, 0);
    const ok = TODAY_HOURLY.reduce((s, p) => s + p.conversions, 0);
    return { total: all, completed: ok, dropped: Math.max(0, all - ok) };
  }, [calls]);

  const slices = [
    { key: "completed", label: "Completed", count: completed, color: SUCCESS_COLOR },
    { key: "dropped", label: "Drop calls", count: dropped, color: DROP_COLOR },
  ].filter((s) => s.count > 0);

  return (
    <Card className="flex h-full flex-col">
      <CardContent className="flex flex-1 flex-col items-center justify-center gap-5 p-6">
        <div className="relative h-44 w-44">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={slices}
                dataKey="count"
                nameKey="label"
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
                  <Cell key={s.key} fill={s.color} />
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
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Total
            </span>
            <span className="text-2xl font-semibold tabular-nums">
              {formatNumber(total)}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              calls
            </span>
          </div>
        </div>

        {/* Legend — Total calls and Drop calls inline; drop in red */}
        <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
          <li className="inline-flex items-center gap-2">
            <span
              aria-hidden
              className="h-2.5 w-2.5 rounded-sm"
              style={{ background: SUCCESS_COLOR }}
            />
            <span>Total calls</span>
            <span className="font-medium tabular-nums">{formatNumber(total)}</span>
          </li>
          <li className="inline-flex items-center gap-2 text-destructive">
            <span aria-hidden className="h-2.5 w-2.5 rounded-sm bg-destructive" />
            <span>Drop calls</span>
            <span className="font-medium tabular-nums">{formatNumber(dropped)}</span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}
