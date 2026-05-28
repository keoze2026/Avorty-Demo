"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
import { formatCurrency, formatNumber } from "@/lib/format";
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
          <h3 className="text-base font-semibold">Destinations</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Each TFN with its own concurrent-call ceiling and daily cap usage.
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
        <Table className="min-w-[1000px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6 text-left">Destination</TableHead>
              <TableHead className="text-left">Buyer</TableHead>
              <TableHead>CC</TableHead>
              <TableHead>Cap (today)</TableHead>
              <TableHead>Calls today</TableHead>
              <TableHead className="pr-6">Revenue today</TableHead>
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
                const ccColor =
                  ccPct >= 90 ? "text-destructive" :
                  ccPct >= 70 ? "text-[color:var(--warning)]" :
                  "text-accent";
                const capColor =
                  capPct >= 90 ? "bg-destructive" :
                  capPct >= 70 ? "bg-[color:var(--warning)]" :
                  "bg-accent";
                return (
                  <TableRow key={destination.id}>
                    <TableCell className="pl-6 text-left">
                      <div className="font-medium">{destination.name}</div>
                      <div className="mt-0.5 font-mono text-xs text-muted-foreground">
                        {destination.tfn}
                      </div>
                    </TableCell>
                    <TableCell className="text-left">
                      {buyer ? (
                        <Link
                          href={`${ROUTES.buyers}/${buyer.id}`}
                          className="text-sm transition-colors hover:text-accent"
                        >
                          {buyer.name}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                      {!destination.enabled && (
                        <Badge variant="outline" className="ml-2 text-[10px]">
                          Disabled
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="tabular-nums">
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
                    <TableCell>
                      {destination.dailyCap > 0 ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-baseline justify-between gap-2 text-xs tabular-nums">
                            <span className="font-medium">
                              {formatNumber(callsToday)} / {formatNumber(destination.dailyCap)}
                            </span>
                            <span className="text-muted-foreground">{Math.round(capPct)}%</span>
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
                    <TableCell className="tabular-nums">
                      {formatNumber(callsToday)}
                    </TableCell>
                    <TableCell className="pr-6 font-medium tabular-nums">
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
