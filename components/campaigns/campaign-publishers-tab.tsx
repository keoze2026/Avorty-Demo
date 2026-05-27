"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowUpRight, Plus, Users } from "lucide-react";

import { PartnerStatusBadge } from "@/components/network/partner-status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { usePublishersStore } from "@/lib/store/publishers-store";

export function CampaignPublishersTab({ campaignId }: { campaignId: string }) {
  // See campaign-buyers-tab for why we filter outside the selector.
  const allPublishers = usePublishersStore((s) => s.publishers);
  const publishers = useMemo(
    () =>
      (allPublishers ?? []).filter((p) => (p.campaignIds ?? []).includes(campaignId)),
    [allPublishers, campaignId],
  );

  if (publishers.length === 0) {
    return (
      <EmptyState
        icon={Users}
        tone="violet"
        title="No publishers attached"
        description="Invite publishers to start sending qualified traffic into this campaign."
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4" /> Attach publisher
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {publishers.map((p) => (
        <Card
          key={p.id}
          className="overflow-hidden transition-all hover:-translate-y-0.5 hover:border-accent/40"
        >
          <CardContent className="flex items-start gap-3 p-4">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[oklch(0.65_0.18_290)]/10 text-[oklch(0.55_0.2_290)] dark:text-[oklch(0.72_0.2_290)]">
              <Users className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Link
                  href={`${ROUTES.publishers}/${p.id}`}
                  className="inline-flex items-center gap-1 truncate text-sm font-semibold transition-colors hover:text-accent"
                >
                  {p.name}
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
                <PartnerStatusBadge status={p.status} />
              </div>
              <p className="truncate text-[11px] text-muted-foreground">{p.organization}</p>
              <dl className="mt-3 grid grid-cols-3 gap-1 text-xs">
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Calls</dt>
                  <dd className="font-mono">{formatNumber(p.callsToday)}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Revenue</dt>
                  <dd className="font-mono">{formatCurrency(p.revenueToday)}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Conv.</dt>
                  <dd className="font-mono">{formatPercent(p.conversionRate * 100, 0)}</dd>
                </div>
              </dl>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
