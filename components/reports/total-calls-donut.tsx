"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CHART_TOOLTIP_PROPS } from "@/lib/chart-tooltip";
import { DASHBOARD_PALETTE } from "@/lib/dashboard-palette";
import { formatNumber } from "@/lib/format";
import type { Call } from "@/lib/types";

interface TotalCallsDonutProps {
  calls: Call[];
}

interface Slice {
  key: "converted" | "notConverted" | "noAnswer";
  label: string;
  count: number;
  color: string;
}

function classify(c: Call): Slice["key"] {
  if (c.status === "missed") return "noAnswer";
  if (c.status === "completed" && c.payout > 0) return "converted";
  return "notConverted";
}

export function TotalCallsDonut({ calls }: TotalCallsDonutProps) {
  const counts = { converted: 0, notConverted: 0, noAnswer: 0 };
  for (const c of calls) counts[classify(c)] += 1;

  const slices: Slice[] = [
    { key: "converted", label: "Converted", count: counts.converted, color: DASHBOARD_PALETTE[2] },
    { key: "notConverted", label: "Not converted", count: counts.notConverted, color: DASHBOARD_PALETTE[3] },
    { key: "noAnswer", label: "No answer", count: counts.noAnswer, color: "var(--destructive)" },
  ];
  const total = slices.reduce((s, x) => s + x.count, 0);

  return (
    <Card className="flex h-full flex-col">
      <CardContent className="flex flex-1 flex-col items-center justify-center gap-4">
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
                formatter={(value: number, name) => [`${formatNumber(value)} calls`, name as string]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</span>
            <span className="text-2xl font-semibold tabular-nums">{formatNumber(total)}</span>
          </div>
        </div>

        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-xs">
          {slices.map((s) => (
            <li key={s.key} className="inline-flex items-center gap-1.5">
              <span
                aria-hidden
                className="h-2 w-2 rounded-sm"
                style={{ background: s.color }}
              />
              <span className="text-muted-foreground">{s.label}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
