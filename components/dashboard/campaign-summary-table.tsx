"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { CampaignStatusBadge } from "@/components/campaigns/campaign-status-badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROUTES } from "@/lib/constants";
import { MOCK_CALLS } from "@/lib/mock/calls";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { Campaign } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CampaignSummaryTableProps {
  campaigns: Campaign[];
  limit?: number;
}

interface Row {
  campaign: Campaign;
  destination: string;
  cc: number;
  capUsed: number;
  capTotal: number;
  capPct: number;
}

function buildRows(campaigns: Campaign[], limit: number): Row[] {
  // Pre-compute per-campaign aggregates from the static call set:
  //   * destination → most-frequent dialed number
  //   * cc          → count of currently in-flight (ringing or in-progress) calls
  const destByCampaign = new Map<string, Map<string, number>>();
  const ccByCampaign = new Map<string, number>();
  for (const c of MOCK_CALLS) {
    const dests = destByCampaign.get(c.campaignId) ?? new Map<string, number>();
    dests.set(c.destinationNumber, (dests.get(c.destinationNumber) ?? 0) + 1);
    destByCampaign.set(c.campaignId, dests);
    if (c.status === "ringing" || c.status === "in-progress") {
      ccByCampaign.set(c.campaignId, (ccByCampaign.get(c.campaignId) ?? 0) + 1);
    }
  }
  const destFor = (id: string) => {
    const m = destByCampaign.get(id);
    if (!m || m.size === 0) return "—";
    let top = "";
    let best = -1;
    for (const [k, v] of m) {
      if (v > best) {
        top = k;
        best = v;
      }
    }
    return top;
  };

  return campaigns
    .filter((c) => c.status !== "archived")
    .map<Row>((campaign) => {
      const capTotal = campaign.dailyCap;
      const capUsed = campaign.callsToday;
      return {
        campaign,
        destination: destFor(campaign.id),
        cc: ccByCampaign.get(campaign.id) ?? 0,
        capUsed,
        capTotal,
        capPct: capTotal > 0 ? Math.min(100, (capUsed / capTotal) * 100) : 0,
      };
    })
    .sort((a, b) => b.campaign.revenueToday - a.campaign.revenueToday)
    .slice(0, limit);
}

export function CampaignSummaryTable({
  campaigns,
  limit = 8,
}: CampaignSummaryTableProps) {
  const rows = useMemo(() => buildRows(campaigns, limit), [campaigns, limit]);

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between gap-2 border-b border-border px-6 py-4">
        <div>
          <h3 className="text-base font-semibold">Campaign summary</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Destination, concurrent calls, and daily cap usage.
          </p>
        </div>
        <Link
          href={ROUTES.campaigns}
          className="inline-flex items-center gap-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          View all <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">Campaign</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead className="text-right">CC</TableHead>
              <TableHead>Cap (today)</TableHead>
              <TableHead className="text-right">Incoming</TableHead>
              <TableHead className="pr-6 text-right">Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={7}
                  className="pl-6 py-8 text-center text-sm text-muted-foreground"
                >
                  No active campaigns.
                </TableCell>
              </TableRow>
            ) : (
              rows.map(({ campaign, destination, cc, capUsed, capTotal, capPct }) => {
                const capColor =
                  capPct >= 90
                    ? "bg-destructive"
                    : capPct >= 70
                      ? "bg-[color:var(--warning)]"
                      : "bg-accent";
                return (
                  <TableRow key={campaign.id}>
                    <TableCell className="pl-6">
                      <Link
                        href={`${ROUTES.campaigns}/${campaign.id}`}
                        className="font-medium transition-colors hover:text-accent"
                      >
                        {campaign.name}
                      </Link>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {campaign.vertical}
                      </div>
                    </TableCell>
                    <TableCell>
                      <CampaignStatusBadge status={campaign.status} />
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {destination}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {cc > 0 ? (
                        <span className="inline-flex items-center gap-1 text-accent">
                          <span
                            aria-hidden
                            className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse"
                          />
                          {cc}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {capTotal > 0 ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-baseline justify-between gap-2 text-xs tabular-nums">
                            <span className="font-medium">
                              {formatNumber(capUsed)} / {formatNumber(capTotal)}
                            </span>
                            <span className="text-muted-foreground">
                              {Math.round(capPct)}%
                            </span>
                          </div>
                          <div className="h-1 w-32 overflow-hidden rounded-full bg-muted">
                            <div
                              className={cn("h-full rounded-full transition-[width]", capColor)}
                              style={{ width: `${capPct}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Unlimited</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatNumber(campaign.callsToday)}
                    </TableCell>
                    <TableCell className="pr-6 text-right font-medium tabular-nums">
                      {formatCurrency(campaign.revenueToday)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
