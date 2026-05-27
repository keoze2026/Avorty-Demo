"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreVertical, Pause, Pencil, Play, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { formatCurrency, formatNumber } from "@/lib/format";
import type { Buyer, Destination } from "@/lib/types";
import { cn } from "@/lib/utils";

interface DestinationsTableProps {
  destinations: Destination[];
  onToggle?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

interface Row {
  destination: Destination;
  buyer: Buyer | undefined;
  cc: number;
  callsToday: number;
  revenueToday: number;
  capPct: number;
}

function buildRows(destinations: Destination[]): Row[] {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startMs = startOfToday.getTime();

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

  return destinations.map<Row>((destination) => {
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
  });
}

export function DestinationsTable({
  destinations,
  onToggle,
  onEdit,
  onDelete,
}: DestinationsTableProps) {
  const router = useRouter();
  const rows = useMemo(() => buildRows(destinations), [destinations]);

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <Table className="min-w-[1100px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">Destination</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">CC</TableHead>
              <TableHead>Cap (today)</TableHead>
              <TableHead className="text-right">Daily cap</TableHead>
              <TableHead className="text-right">Monthly cap</TableHead>
              <TableHead className="text-right">Calls today</TableHead>
              <TableHead className="text-right">Revenue today</TableHead>
              <TableHead className="w-12 pr-6" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={10}
                  className="pl-6 py-10 text-center text-sm text-muted-foreground"
                >
                  No destinations match the current filters.
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
                  <TableRow
                    key={destination.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`${ROUTES.destinations}/${destination.id}`)}
                  >
                    <TableCell className="pl-6">
                      <Link
                        href={`${ROUTES.destinations}/${destination.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="block font-medium transition-colors hover:text-accent"
                      >
                        {destination.name}
                      </Link>
                      <div className="mt-0.5 font-mono text-xs text-muted-foreground whitespace-nowrap">
                        {destination.tfn}
                      </div>
                    </TableCell>
                    <TableCell>
                      {buyer ? (
                        <Link
                          href={`${ROUTES.buyers}/${buyer.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-sm transition-colors hover:text-accent"
                        >
                          {buyer.name}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {destination.enabled ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="outline">Disabled</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums whitespace-nowrap">
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
                    <TableCell className="text-right tabular-nums">
                      {destination.dailyCap > 0 ? formatNumber(destination.dailyCap) : "∞"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {destination.monthlyCap > 0 ? formatNumber(destination.monthlyCap) : "∞"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatNumber(callsToday)}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatCurrency(revenueToday)}
                    </TableCell>
                    <TableCell className="pr-6" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            aria-label="Destination actions"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => onEdit?.(destination.id)}>
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => onToggle?.(destination.id)}>
                            {destination.enabled ? (
                              <>
                                <Pause className="h-3.5 w-3.5" /> Pause
                              </>
                            ) : (
                              <>
                                <Play className="h-3.5 w-3.5" /> Enable
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onSelect={() => onDelete?.(destination.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
