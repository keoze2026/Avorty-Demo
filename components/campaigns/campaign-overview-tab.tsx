"use client";

import { Building2, Clock, GitFork, Hash, Users } from "lucide-react";

import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { RecentCallsFeed } from "@/components/dashboard/recent-calls-feed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Campaign, Weekday } from "@/lib/types";
import { formatCompact } from "@/lib/format";

const DAY_NAMES: Record<Weekday, string> = { 0: "Sun", 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat" };

function ScheduleSummary({ campaign }: { campaign: Campaign }) {
  const { days, startHour, endHour, timezone } = campaign.schedule;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        <span className="font-mono">
          {startHour.toString().padStart(2, "0")}:00 – {endHour.toString().padStart(2, "0")}:00
        </span>
        <span>·</span>
        <span>{timezone === "auto" ? "Caller-local" : timezone}</span>
      </div>
      <div className="flex gap-1">
        {([0, 1, 2, 3, 4, 5, 6] as Weekday[]).map((d) => {
          const active = days.includes(d);
          return (
            <span
              key={d}
              className={`inline-flex h-7 w-9 items-center justify-center rounded-md border text-[10px] font-mono transition-colors ${
                active
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-muted-foreground"
              }`}
            >
              {DAY_NAMES[d]}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export function CampaignOverviewTab({ campaign }: { campaign: Campaign }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <ScheduleSummary campaign={campaign} />
            <dl className="mt-5 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-border/40 pt-4 text-xs">
              <dt className="text-muted-foreground">Payout model</dt>
              <dd className="text-right font-mono capitalize">{campaign.payoutModel.replace("-", " ")}</dd>
              <dt className="text-muted-foreground">Qualify</dt>
              <dd className="text-right font-mono">{campaign.qualifyDurationSec}s</dd>
              <dt className="text-muted-foreground">Daily cap</dt>
              <dd className="text-right font-mono">{campaign.dailyCap === 0 ? "Unlimited" : formatCompact(campaign.dailyCap)}</dd>
              <dt className="text-muted-foreground">Monthly cap</dt>
              <dd className="text-right font-mono">{campaign.monthlyCap === 0 ? "Unlimited" : formatCompact(campaign.monthlyCap)}</dd>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Quick links to other tabs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: Hash, label: "Numbers", value: campaign.numbersCount },
          { icon: Building2, label: "Buyers", value: campaign.buyersCount },
          { icon: Users, label: "Publishers", value: campaign.publishersCount },
          { icon: GitFork, label: "Routing", value: "—" },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <div key={t.label} className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-3">
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
