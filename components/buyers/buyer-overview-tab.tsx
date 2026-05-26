"use client";

import { motion } from "framer-motion";
import { CheckCircle2, DollarSign, Gauge, PhoneCall, Users } from "lucide-react";

import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { RecentCallsFeed } from "@/components/dashboard/recent-calls-feed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCompact, formatCurrency, formatPercent } from "@/lib/format";
import type { Buyer } from "@/lib/types";

export function BuyerOverviewTab({ buyer }: { buyer: Buyer }) {
  const dailyUsage = buyer.dailyCap > 0 ? Math.min(1, buyer.callsToday / buyer.dailyCap) : 0;
  const monthlyUsage = buyer.monthlyCap > 0 ? Math.min(1, buyer.callsMonth / buyer.monthlyCap) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Pacing</CardTitle>
            <p className="text-xs text-muted-foreground">Current cap consumption</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <PacingBar
              label="Daily"
              consumed={buyer.callsToday}
              cap={buyer.dailyCap}
              usage={dailyUsage}
            />
            <PacingBar
              label="Monthly"
              consumed={buyer.callsMonth}
              cap={buyer.monthlyCap}
              usage={monthlyUsage}
            />

            <dl className="grid grid-cols-2 gap-x-3 gap-y-2 border-t border-border/40 pt-4 text-xs">
              <dt className="text-muted-foreground">Concurrency cap</dt>
              <dd className="text-right font-mono">{buyer.concurrencyCap}</dd>
              <dt className="text-muted-foreground">Bid model</dt>
              <dd className="text-right font-mono capitalize">{buyer.payoutModel}</dd>
              <dt className="text-muted-foreground">Lifetime spend</dt>
              <dd className="text-right font-mono">{formatCurrency(buyer.lifetimeSpend)}</dd>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: PhoneCall, label: "Month calls", value: formatCompact(buyer.callsMonth) },
          { icon: DollarSign, label: "Month spend", value: formatCurrency(buyer.spendMonth) },
          { icon: CheckCircle2, label: "Accept rate", value: formatPercent(buyer.acceptRate * 100, 0) },
          { icon: Users, label: "Campaigns", value: buyer.campaignIds.length.toString() },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <div
              key={t.label}
              className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-3"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <div className="font-mono text-lg font-semibold">{t.value}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <RecentCallsFeed />
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
