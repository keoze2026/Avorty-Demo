"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowUpRight, Building2, Plus } from "lucide-react";

import { PartnerStatusBadge } from "@/components/network/partner-status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import { formatCurrency, formatNumber } from "@/lib/format";
import { useBuyersStore } from "@/lib/store/buyers-store";

/**
 * Buyers attached to a campaign — driven by the live buyers store
 * (each buyer carries the campaignIds it's wired into).
 */
export function CampaignBuyersTab({ campaignId }: { campaignId: string }) {
  // Select the stable array reference from the store, then filter outside the
  // selector. Inline `.filter` inside the selector returns a new array every
  // call → Zustand v5's useSyncExternalStore sees "new" data every render →
  // React error #185 infinite loop. Defensive null guards retained.
  const allBuyers = useBuyersStore((s) => s.buyers);
  const buyers = useMemo(
    () => (allBuyers ?? []).filter((b) => (b.campaignIds ?? []).includes(campaignId)),
    [allBuyers, campaignId],
  );

  if (buyers.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        tone="emerald"
        title="No buyers attached"
        description="Invite buyers and attach them to this campaign to start routing calls."
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4" /> Attach buyer
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {buyers.map((b) => (
        <Card
          key={b.id}
          className="overflow-hidden transition-all hover:-translate-y-0.5 hover:border-accent/40"
        >
          <CardContent className="flex items-start gap-3 p-4">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[oklch(0.74_0.18_155)]/10 text-[oklch(0.6_0.18_155)] dark:text-[oklch(0.78_0.18_155)]">
              <Building2 className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Link
                  href={`${ROUTES.buyers}/${b.id}`}
                  className="inline-flex items-center gap-1 truncate text-sm font-semibold transition-colors hover:text-accent"
                >
                  {b.name}
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
                <PartnerStatusBadge status={b.status} />
              </div>
              <p className="truncate text-[11px] text-muted-foreground">{b.organization}</p>
              <dl className="mt-3 grid grid-cols-3 gap-1 text-xs">
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Bid</dt>
                  <dd className="font-mono">{formatCurrency(b.bidAmount, true)}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Calls</dt>
                  <dd className="font-mono">
                    {formatNumber(b.callsToday)} / {b.dailyCap === 0 ? "∞" : formatNumber(b.dailyCap)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Spend</dt>
                  <dd className="font-mono">{formatCurrency(b.spendToday)}</dd>
                </div>
              </dl>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
