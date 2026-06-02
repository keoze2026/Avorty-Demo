"use client";

import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";
import { CHART_TOOLTIP_PROPS } from "@/lib/chart-tooltip";
import { TODAY_HOURLY } from "@/lib/mock/timeseries";
import { formatNumber } from "@/lib/format";
import type { Call } from "@/lib/types";

interface VerticalDonutProps {
  /** When provided, success vs drop is counted from these calls. Otherwise the
   *  numbers come from TODAY_HOURLY (matching the default-mode KPI block). */
  calls?: Call[];
}

// Completed slice rides a soft single-hue indigo gradient (deep → bright).
// Drop slice uses the destructive red.
const SUCCESS_FILL = "url(#donut-success-grad)";
const DROP_FILL = "var(--destructive)";
const SUCCESS_SWATCH = "var(--accent)";
const DROP_SWATCH = "var(--destructive)";

export function VerticalDonut({ calls }: VerticalDonutProps = {}) {
  const { t } = useTranslation();
  const { total, completed, dropped } = useMemo(() => {
    if (calls) {
      // Match the topbar TOTAL — only count calls that started today, so the
      // donut headline stays in sync with the topbar's "today" counter and
      // the hourly chart above it.
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const startMs = startOfToday.getTime();
      const today = calls.filter((c) => c.startedAt >= startMs);
      const all = today.length;
      const ok = today.filter((c) => c.status === "completed").length;
      return { total: all, completed: ok, dropped: Math.max(0, all - ok) };
    }
    const all = TODAY_HOURLY.reduce((s, p) => s + p.calls, 0);
    const ok = TODAY_HOURLY.reduce((s, p) => s + p.conversions, 0);
    return { total: all, completed: ok, dropped: Math.max(0, all - ok) };
  }, [calls]);

  const slices = [
    { key: "completed", label: t("dashboard.donut.completed"), count: completed, fill: SUCCESS_FILL },
    { key: "dropped", label: t("dashboard.donut.notConnected"), count: dropped, fill: DROP_FILL },
  ].filter((s) => s.count > 0);

  return (
    <Card className="flex h-full flex-col">
      <CardContent className="flex flex-1 flex-col items-center justify-center gap-5 p-6">
        <div
          // Suppress the default focus-ring rectangle Recharts paints on the
          // sectors when a slice is clicked.
          className="relative h-44 w-44 [&_.recharts-wrapper:focus]:outline-none [&_.recharts-sector:focus]:outline-none [&_path:focus]:outline-none [&_svg:focus]:outline-none"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {/* Soft single-hue gradient tied to the active theme accent.
                    Opacity stops give a subtle dark→light arc without
                    locking us to a hardcoded hue. */}
                <linearGradient id="donut-success-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.65} />
                  <stop offset="60%" stopColor="var(--accent)" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity={1} />
                </linearGradient>
              </defs>
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
                activeShape={undefined}
                activeIndex={-1}
              >
                {slices.map((s) => (
                  <Cell
                    key={s.key}
                    fill={s.fill}
                    tabIndex={-1}
                    style={{ outline: "none" }}
                  />
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
              {t("dashboard.donut.total")}
            </span>
            <span className="text-xl font-semibold tabular-nums">
              {formatNumber(total)}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {t("dashboard.donut.callsSuffix")}
            </span>
          </div>
        </div>

        {/* Legend — gradient swatch for completed, solid for drop */}
        <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
          <li className="inline-flex items-center gap-2">
            <span
              aria-hidden
              className="h-2.5 w-2.5 rounded-sm"
              style={{ background: SUCCESS_SWATCH }}
            />
            <span>{t("dashboard.donut.totalCalls")}</span>
            <span className="font-medium tabular-nums">{formatNumber(total)}</span>
          </li>
          <li className="inline-flex items-center gap-2 text-destructive">
            <span
              aria-hidden
              className="h-2.5 w-2.5 rounded-sm"
              style={{ background: DROP_SWATCH }}
            />
            <span>{t("dashboard.donut.notConnected")}</span>
            <span className="font-medium tabular-nums">{formatNumber(dropped)}</span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}
