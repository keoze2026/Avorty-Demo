"use client";

import { Plus, Users } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_PUBLISHERS } from "@/lib/mock/publishers";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";

export function CampaignPublishersTab({ publishersCount }: { publishersCount: number }) {
  const publishers = MOCK_PUBLISHERS.slice(0, Math.max(1, publishersCount || 0));

  if (publishersCount === 0) {
    return (
      <EmptyState
        icon={Users}
        tone="violet"
        title="No publishers attached"
        description="Invite publishers to send qualified traffic into this campaign."
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4" /> Invite publisher
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {publishers.map((p) => (
        <Card key={p.id} className="overflow-hidden">
          <CardContent className="flex items-start gap-3 p-4">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[oklch(0.65_0.18_290)]/10 text-[oklch(0.55_0.2_290)] dark:text-[oklch(0.72_0.2_290)]">
              <Users className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-sm font-semibold">{p.name}</h3>
                <Badge variant={p.status === "active" ? "success" : "outline"} className="capitalize">
                  {p.status}
                </Badge>
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
