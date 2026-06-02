"use client";

import { CheckCircle2, DollarSign, PhoneCall, PhoneMissed } from "lucide-react";
import { motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { useCountUp } from "@/hooks/use-count-up";
import { useTranslation } from "@/hooks/use-translation";
import { formatCurrency, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

interface LiveStatsPanelProps {
  totals: {
    started: number;
    completed: number;
    missed: number;
    revenue: number;
  };
  inFlightCount: number;
}

interface StatProps {
  label: string;
  value: number;
  formatValue: (v: number) => string;
  icon: typeof PhoneCall;
  tone: string;
}

function Stat({ label, value, formatValue, icon: Icon, tone }: StatProps) {
  const animated = useCountUp(value, { duration: 600 });
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18 }}
      className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
    >
      <div className={cn("inline-flex h-8 w-8 items-center justify-center rounded-md", tone)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-mono text-lg font-semibold tabular-nums">{formatValue(animated)}</div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      </div>
    </motion.div>
  );
}

export function LiveStatsPanel({ totals, inFlightCount }: LiveStatsPanelProps) {
  const { t } = useTranslation();
  const conversion = totals.started > 0 ? (totals.completed / totals.started) * 100 : 0;

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <Stat
          label={t("liveUI.session.stats.inFlightNow")}
          value={inFlightCount}
          formatValue={(v) => formatNumber(Math.round(v))}
          icon={PhoneCall}
          tone="bg-accent/15 text-accent"
        />
        <Stat
          label={t("liveUI.session.stats.callsStarted")}
          value={totals.started}
          formatValue={(v) => formatNumber(Math.round(v))}
          icon={PhoneCall}
          tone="bg-secondary/60 text-foreground"
        />
        <Stat
          label={t("liveUI.session.stats.completed")}
          value={totals.completed}
          formatValue={(v) => formatNumber(Math.round(v))}
          icon={CheckCircle2}
          tone="bg-[oklch(0.74_0.18_155)]/15 text-[oklch(0.6_0.18_155)] dark:text-[oklch(0.78_0.18_155)]"
        />
        <Stat
          label={t("liveUI.session.stats.missedRejected")}
          value={totals.missed}
          formatValue={(v) => formatNumber(Math.round(v))}
          icon={PhoneMissed}
          tone="bg-[oklch(0.78_0.16_75)]/15 text-[oklch(0.6_0.16_75)] dark:text-[oklch(0.82_0.16_75)]"
        />
        <Stat
          label={t("liveUI.session.stats.revenueEarned")}
          value={totals.revenue}
          formatValue={(v) => formatCurrency(v)}
          icon={DollarSign}
          tone="bg-accent/15 text-accent"
        />

        <div className="mt-3 rounded-lg border border-border bg-secondary/40 p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{t("liveUI.session.sessionConversion")}</span>
            <span className="font-mono font-semibold">{conversion.toFixed(1)}%</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary/60">
            <motion.div
              animate={{ width: `${Math.min(100, conversion)}%` }}
              transition={{ duration: 0.4 }}
              className="h-full rounded-full bg-gradient-to-r from-[color:var(--accent)] to-[color:var(--vortyx-bright)]"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
