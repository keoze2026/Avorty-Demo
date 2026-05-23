"use client";

import { Building2, Plus } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_BUYERS } from "@/lib/mock/buyers";
import { formatCurrency, formatNumber } from "@/lib/format";

/**
 * Mock association: first N buyers belong to this campaign.
 * In a real backend this would be a join via campaign-buyer mapping.
 */
export function CampaignBuyersTab({ buyersCount }: { buyersCount: number }) {
  const buyers = MOCK_BUYERS.slice(0, Math.max(1, buyersCount || 0));

  if (buyersCount === 0) {
    return (
      <EmptyState
        icon={Building2}
        tone="emerald"
        title="No buyers attached"
        description="Invite buyers to receive calls from this campaign."
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4" /> Invite buyer
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {buyers.map((b) => (
        <Card key={b.id} className="overflow-hidden">
          <CardContent className="flex items-start gap-3 p-4">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-[oklch(0.6_0.18_155)] dark:text-[oklch(0.78_0.18_155)]">
              <Building2 className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-sm font-semibold">{b.name}</h3>
                <Badge
                  variant={b.status === "active" ? "success" : b.status === "capped" ? "warning" : "outline"}
                  className="capitalize"
                >
                  {b.status}
                </Badge>
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
                    {formatNumber(b.callsToday)} / {formatNumber(b.dailyCap)}
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
