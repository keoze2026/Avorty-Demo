"use client";

import { DollarSign, Hash, PhoneCall, TrendingUp } from "lucide-react";

import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { RecentCallsFeed } from "@/components/dashboard/recent-calls-feed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCompact, formatCurrency, formatPercent } from "@/lib/format";
import type { Publisher } from "@/lib/types";

export function PublisherOverviewTab({ publisher }: { publisher: Publisher }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Earnings summary</CardTitle>
            <p className="text-xs text-muted-foreground">This month and lifetime</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Row label="Calls this month" value={formatCompact(publisher.callsMonth)} icon={PhoneCall} />
            <Row label="Revenue this month" value={formatCurrency(publisher.revenueMonth)} icon={DollarSign} />
            <Row
              label="Payout share"
              value={`${formatPercent(publisher.payoutRate * 100, 0)} of buyer payout`}
              icon={TrendingUp}
            />
            <Row label="Numbers assigned" value={publisher.numbersAssigned.toString()} icon={Hash} />

            <div className="rounded-lg border border-accent/30 bg-accent/5 p-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Lifetime revenue
                </span>
                <span className="font-mono text-base font-bold text-foreground">
                  {formatCurrency(publisher.lifetimeRevenue)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <RecentCallsFeed />
    </div>
  );
}

function Row({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof PhoneCall;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="inline-flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-accent" />
        {label}
      </span>
      <span className="font-mono font-semibold">{value}</span>
    </div>
  );
}
