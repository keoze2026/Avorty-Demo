"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

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
import { MOCK_BUYERS } from "@/lib/mock/buyers";
import { MOCK_CALLS } from "@/lib/mock/calls";
import { useDestinationsStore } from "@/lib/store/destinations-store";
import { formatCurrency, formatNumber, toE164 } from "@/lib/format";
import type { Buyer, Destination } from "@/lib/types";
import { cn } from "@/lib/utils";

interface DestinationSummaryTableProps {
  /** When set, only render the destination matching this TFN. */
  destinationFilter?: string;
  limit?: number;
}

interface Row {
  destination: Destination;
  buyer: Buyer | undefined;
  cc: number;
  callsToday: number;
  revenueToday: number;
  capPct: number;
}

/** Small green pill — every row in this table is, by filter, active. */
function ActiveBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[oklch(0.78_0.18_155)]/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[oklch(0.5_0.18_155)] dark:text-[oklch(0.78_0.18_155)]">
      <span aria-hidden className="h-1 w-1 rounded-full bg-current" />
      Active
    </span>
  );
}

function buildRows(
  destinations: Destination[],
  filter: string | undefined,
  limit: number,
): Row[] {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startMs = startOfToday.getTime();

  // Pre-compute per-destination (keyed by TFN) call aggregates from MOCK_CALLS.
  const callsByTfn = new Map<string, number>();
  const revenueByTfn = new Map<string, number>();
  const ccByTfn = new Map<string, number>();
  for (const c of MOCK_CALLS) {
    if (c.startedAt >= startMs) {
      callsByTfn.set(c.destinationNumber, (callsByTfn.get(c.destinationNumber) ?? 0) + 1);
      revenueByTfn.set(
        c.destinationNumber,
        (revenueByTfn.get(c.destinationNumber) ?? 0) + c.revenue,
      );
    }
    if (c.status === "ringing" || c.status === "in-progress") {
      ccByTfn.set(c.destinationNumber, (ccByTfn.get(c.destinationNumber) ?? 0) + 1);
    }
  }

  const buyerById = new Map<string, Buyer>();
  for (const b of MOCK_BUYERS) buyerById.set(b.id, b);

  return destinations
    .filter((d) => !filter || d.tfn === filter)
    // Only active destinations attached to an active buyer surface here.
    // A paused destination (`enabled === false`) or one whose buyer is paused
    // / capped / pending is hidden so the operator sees live inventory only.
    .filter((d) => {
      if (!d.enabled) return false;
      const buyer = buyerById.get(d.buyerId);
      return buyer?.status === "active";
    })
    .map<Row>((destination) => {
      const callsToday = callsByTfn.get(destination.tfn) ?? 0;
      const cap = destination.dailyCap;
      return {
        destination,
        buyer: buyerById.get(destination.buyerId),
        cc: ccByTfn.get(destination.tfn) ?? 0,
        callsToday,
        revenueToday: revenueByTfn.get(destination.tfn) ?? 0,
        capPct: cap > 0 ? Math.min(100, (callsToday / cap) * 100) : 0,
      };
    })
    .sort((a, b) => b.revenueToday - a.revenueToday)
    .slice(0, limit);
}

export function DestinationSummaryTable({
  destinationFilter,
  limit = 12,
}: DestinationSummaryTableProps) {
  const destinations = useDestinationsStore((s) => s.destinations);
  const rows = useMemo(
    () => buildRows(destinations, destinationFilter, limit),
    [destinations, destinationFilter, limit],
  );

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between gap-2 border-b border-border px-6 py-4">
        <div>
          <h3 className="text-[13px] font-semibold uppercase tracking-wider">DESTINATIONS</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Active TFNs attached to active buyers — paused destinations drop off automatically.
          </p>
        </div>
        <Link
          href={ROUTES.buyers}
          className="inline-flex items-center gap-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Manage buyers <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-[980px] [&_tr]:border-b-0 [&_td]:py-2 [&_th]:h-8 [&_th]:py-1.5 [&_th]:text-[10px] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wider">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6 text-left">Destination</TableHead>
              <TableHead className="text-left">Buyer</TableHead>
              <TableHead className="text-right">Live</TableHead>
              <TableHead className="text-right">Cap (today)</TableHead>
              <TableHead className="text-right">Calls today</TableHead>
              <TableHead className="pr-6 text-right">Revenue today</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="pl-6 py-8 text-center text-sm text-muted-foreground">
                  No destinations.
                </TableCell>
              </TableRow>
            ) : (
              rows.map(({ destination, buyer, cc, callsToday, revenueToday, capPct }) => {
                const ccPct = destination.concurrencyCap > 0
                  ? (cc / destination.concurrencyCap) * 100
                  : 0;
                // Live concurrency color ramp:
                //   0–69%   bright Won-green (healthy)
                //   70–89%  amber (heads-up)
                //   90%+    red (over the ceiling)
                const ccColor =
                  ccPct >= 90 ? "text-destructive" :
                  ccPct >= 70 ? "text-[color:var(--warning)]" :
                  "text-[oklch(0.5_0.18_155)] dark:text-[oklch(0.78_0.18_155)]";
                const capColor =
                  capPct >= 90 ? "bg-destructive" :
                  capPct >= 70 ? "bg-[color:var(--warning)]" :
                  "bg-accent";
                return (
                  <TableRow key={destination.id}>
                    <TableCell className="pl-6 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium leading-tight">{destination.name}</span>
                        <ActiveBadge />
                      </div>
                      <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                        {toE164(destination.tfn)}
                      </div>
                    </TableCell>
                    <TableCell className="text-left">
                      {buyer ? (
                        <Link
                          href={`${ROUTES.buyers}/${buyer.id}`}
                          className="text-xs transition-colors hover:text-accent"
                        >
                          {buyer.name}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-xs tabular-nums">
                      <span className={cn("font-medium", cc > 0 ? ccColor : "text-muted-foreground")}>
                        {cc > 0 && (
                          <span
                            aria-hidden
                            className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-current align-middle animate-pulse"
                          />
                        )}
                        {cc}
                      </span>
                      <span className="text-muted-foreground"> / {destination.concurrencyCap}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      {destination.dailyCap > 0 ? (
                        <div className="ml-auto flex w-fit flex-col gap-0.5">
                          <div className="flex items-baseline justify-end gap-2 text-[11px] tabular-nums">
                            <span className="font-medium">
                              {formatNumber(callsToday)} / {formatNumber(destination.dailyCap)}
                            </span>
                            <span className="text-muted-foreground">{Math.round(capPct)}%</span>
                          </div>
                          <div className="h-0.5 w-28 overflow-hidden rounded-full bg-muted">
                            <div
                              className={cn("h-full rounded-full transition-[width]", capColor)}
                              style={{ width: `${capPct}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">Unlimited</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-xs tabular-nums">
                      {formatNumber(callsToday)}
                    </TableCell>
                    <TableCell className="pr-6 text-right text-xs font-medium tabular-nums">
                      {formatCurrency(revenueToday)}
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
