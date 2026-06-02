"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Gauge } from "lucide-react";

import { CallsChart } from "@/components/dashboard/calls-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";
import { MOCK_CALLS } from "@/lib/mock/calls";
import { formatCompact } from "@/lib/format";
import type { Destination } from "@/lib/types";

interface DestinationOverviewTabProps {
  destination: Destination;
}

export function DestinationOverviewTab({ destination }: DestinationOverviewTabProps) {
  const { t } = useTranslation();
  const scopedCalls = useMemo(
    () => MOCK_CALLS.filter((c) => c.destinationNumber === destination.tfn),
    [destination.tfn],
  );

  const { callsToday, callsMonth } = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const startToday = start.getTime();
    const startMonth = new Date(start.getFullYear(), start.getMonth(), 1).getTime();
    let today = 0;
    let month = 0;
    for (const c of scopedCalls) {
      if (c.startedAt >= startMonth) month += 1;
      if (c.startedAt >= startToday) today += 1;
    }
    return { callsToday: today, callsMonth: month };
  }, [scopedCalls]);

  const dailyUsage =
    destination.dailyCap > 0 ? Math.min(1, callsToday / destination.dailyCap) : 0;
  const monthlyUsage =
    destination.monthlyCap > 0
      ? Math.min(1, callsMonth / destination.monthlyCap)
      : 0;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <CallsChart calls={scopedCalls} />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t("networkUI.destinations.overview.pacingTitle")}</CardTitle>
          <p className="text-xs text-muted-foreground">{t("networkUI.destinations.overview.pacingDesc")}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <PacingBar
            label={t("networkUI.destinations.overview.daily")}
            consumed={callsToday}
            cap={destination.dailyCap}
            usage={dailyUsage}
          />
          <PacingBar
            label={t("networkUI.destinations.overview.monthly")}
            consumed={callsMonth}
            cap={destination.monthlyCap}
            usage={monthlyUsage}
          />

          <dl className="grid grid-cols-2 gap-x-3 gap-y-2 border-t border-border/40 pt-4 text-xs">
            <dt className="text-muted-foreground">{t("networkUI.destinations.overview.concurrencyCap")}</dt>
            <dd className="text-right font-mono">{destination.concurrencyCap}</dd>
            <dt className="text-muted-foreground">{t("networkUI.destinations.overview.dailyCap")}</dt>
            <dd className="text-right font-mono">
              {destination.dailyCap === 0 ? "∞" : formatCompact(destination.dailyCap)}
            </dd>
            <dt className="text-muted-foreground">{t("networkUI.destinations.overview.monthlyCap")}</dt>
            <dd className="text-right font-mono">
              {destination.monthlyCap === 0 ? "∞" : formatCompact(destination.monthlyCap)}
            </dd>
            <dt className="text-muted-foreground">{t("networkUI.destinations.overview.status")}</dt>
            <dd className="text-right font-mono">
              {destination.enabled ? t("networkUI.destinations.overview.routable") : t("networkUI.destinations.overview.disabled")}
            </dd>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

function PacingBar({
  label,
  consumed,
  cap,
  usage,
}: {
  label: string;
  consumed: number;
  cap: number;
  usage: number;
}) {
  const pct = Math.round(usage * 100);
  const danger = usage > 0.85;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="inline-flex items-center gap-1.5">
          <Gauge className={`h-3.5 w-3.5 ${danger ? "text-[color:var(--warning)]" : "text-accent"}`} />
          <span className="font-medium">{label}</span>
        </span>
        <span className="font-mono">
          {formatCompact(consumed)} / {cap === 0 ? "∞" : formatCompact(cap)}
          <span className={`ml-1 ${danger ? "text-[color:var(--warning)]" : "text-muted-foreground"}`}>
            {cap === 0 ? "" : `(${pct}%)`}
          </span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-secondary/60">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`h-full rounded-full ${
            danger
              ? "bg-gradient-to-r from-[color:var(--warning)] to-[color:var(--destructive)]"
              : "bg-gradient-to-r from-[color:var(--accent)] to-[color:var(--vortyx-cyan)]"
          }`}
        />
      </div>
    </div>
  );
}
