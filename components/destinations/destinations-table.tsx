"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

import { Switch } from "@/components/ui/switch";
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
import { formatNumber } from "@/lib/format";
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
  live: number;
  hourly: number;
  daily: number;
  monthly: number;
  global: number;
}

/**
 * Counts calls per destination TFN at five different windows:
 *   live    — currently ringing or in-progress (any time)
 *   hourly  — calls started in the current hour
 *   daily   — calls started today (since 00:00 local)
 *   monthly — calls started this month (since the 1st)
 *   global  — all calls ever recorded for this TFN
 */
function buildRows(destinations: Destination[]): Row[] {
  const now = new Date();
  const startOfHour = new Date(now);
  startOfHour.setMinutes(0, 0, 0);
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const startOfDayMs = startOfDay.getTime();
  const startOfHourMs = startOfHour.getTime();

  const live = new Map<string, number>();
  const hourly = new Map<string, number>();
  const daily = new Map<string, number>();
  const monthly = new Map<string, number>();
  const global = new Map<string, number>();

  for (const c of MOCK_CALLS) {
    const tfn = c.destinationNumber;
    global.set(tfn, (global.get(tfn) ?? 0) + 1);
    if (c.startedAt >= startOfMonth) monthly.set(tfn, (monthly.get(tfn) ?? 0) + 1);
    if (c.startedAt >= startOfDayMs) daily.set(tfn, (daily.get(tfn) ?? 0) + 1);
    if (c.startedAt >= startOfHourMs) hourly.set(tfn, (hourly.get(tfn) ?? 0) + 1);
    if (c.status === "ringing" || c.status === "in-progress") {
      live.set(tfn, (live.get(tfn) ?? 0) + 1);
    }
  }

  const buyerById = new Map<string, Buyer>();
  for (const b of MOCK_BUYERS) buyerById.set(b.id, b);

  return destinations.map<Row>((destination) => ({
    destination,
    buyer: buyerById.get(destination.buyerId),
    live: live.get(destination.tfn) ?? 0,
    hourly: hourly.get(destination.tfn) ?? 0,
    daily: daily.get(destination.tfn) ?? 0,
    monthly: monthly.get(destination.tfn) ?? 0,
    global: global.get(destination.tfn) ?? 0,
  }));
}

/** "+1 (213) 217-2017" → "12132172017"; Ringba's compact dial-string form. */
function compactTfn(tfn: string) {
  return tfn.replace(/\D/g, "");
}

/** Color a cell based on the fraction used (0..1). */
function pacingTone(pct: number): string {
  if (pct >= 1) return "text-destructive";
  if (pct >= 0.85) return "text-[color:var(--warning)]";
  return "";
}

export function DestinationsTable({
  destinations,
  onToggle,
}: DestinationsTableProps) {
  const router = useRouter();
  const rows = useMemo(() => buildRows(destinations), [destinations]);

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <Table className="min-w-[1000px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6 uppercase tracking-wider text-[11px]">
                Name
              </TableHead>
              <TableHead className="uppercase tracking-wider text-[11px]">
                Buyer
              </TableHead>
              <TableHead className="uppercase tracking-wider text-[11px]">
                Destination
              </TableHead>
              <TableHead className="text-center uppercase tracking-wider text-[11px]">
                Live
              </TableHead>
              <TableHead className="text-center uppercase tracking-wider text-[11px]">
                Hourly
              </TableHead>
              <TableHead className="text-center uppercase tracking-wider text-[11px]">
                Daily
              </TableHead>
              <TableHead className="text-center uppercase tracking-wider text-[11px]">
                Monthly
              </TableHead>
              <TableHead className="text-center uppercase tracking-wider text-[11px]">
                Global
              </TableHead>
              <TableHead className="pr-6 text-center uppercase tracking-wider text-[11px]">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={9}
                  className="pl-6 py-10 text-center text-sm text-muted-foreground"
                >
                  No destinations match the current filters.
                </TableCell>
              </TableRow>
            ) : (
              rows.map(({ destination, buyer, live, hourly, daily, monthly, global }) => {
                const livePct =
                  destination.concurrencyCap > 0
                    ? live / destination.concurrencyCap
                    : 0;
                const dailyPct =
                  destination.dailyCap > 0 ? daily / destination.dailyCap : 0;
                const monthlyPct =
                  destination.monthlyCap > 0 ? monthly / destination.monthlyCap : 0;
                const atCap = dailyPct >= 1 || livePct >= 1;

                return (
                  <TableRow
                    key={destination.id}
                    className="cursor-pointer"
                    onClick={() =>
                      router.push(`${ROUTES.destinations}/${destination.id}`)
                    }
                  >
                    {/* NAME */}
                    <TableCell className="pl-6">
                      <Link
                        href={`${ROUTES.destinations}/${destination.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-2 font-medium transition-colors hover:text-accent"
                      >
                        <span className="truncate max-w-[14rem]">{destination.name}</span>
                        {atCap && (
                          <AlertTriangle
                            className="h-3.5 w-3.5 text-[color:var(--warning)]"
                            aria-label="At cap"
                          />
                        )}
                      </Link>
                    </TableCell>

                    {/* BUYER */}
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

                    {/* DESTINATION (TFN, compact dial-string form) */}
                    <TableCell className="font-mono text-xs tabular-nums text-muted-foreground">
                      {compactTfn(destination.tfn)}
                    </TableCell>

                    {/* LIVE — current concurrent / max */}
                    <TableCell className="text-center">
                      <span
                        className={cn(
                          "inline-flex min-w-[3.5rem] items-center justify-center rounded border border-border bg-muted/40 px-2 py-1 font-mono text-xs tabular-nums",
                          pacingTone(livePct),
                        )}
                      >
                        {live} / {destination.concurrencyCap}
                      </span>
                    </TableCell>

                    {/* HOURLY — just the count */}
                    <TableCell className="text-center">
                      <span className="inline-flex min-w-[3rem] items-center justify-center rounded border border-border bg-muted/40 px-2 py-1 font-mono text-xs tabular-nums">
                        {formatNumber(hourly)}
                      </span>
                    </TableCell>

                    {/* DAILY — count or count/cap when capped */}
                    <TableCell className="text-center">
                      <span
                        className={cn(
                          "inline-flex min-w-[3rem] items-center justify-center rounded border border-border bg-muted/40 px-2 py-1 font-mono text-xs tabular-nums",
                          pacingTone(dailyPct),
                        )}
                      >
                        {destination.dailyCap > 0
                          ? `${formatNumber(daily)} / ${formatNumber(destination.dailyCap)}`
                          : formatNumber(daily)}
                      </span>
                    </TableCell>

                    {/* MONTHLY — count or count/cap when capped */}
                    <TableCell className="text-center">
                      <span
                        className={cn(
                          "inline-flex min-w-[3rem] items-center justify-center rounded border border-border bg-muted/40 px-2 py-1 font-mono text-xs tabular-nums",
                          pacingTone(monthlyPct),
                        )}
                      >
                        {destination.monthlyCap > 0
                          ? `${formatNumber(monthly)} / ${formatNumber(destination.monthlyCap)}`
                          : formatNumber(monthly)}
                      </span>
                    </TableCell>

                    {/* GLOBAL — lifetime count */}
                    <TableCell className="text-center">
                      <span className="inline-flex min-w-[3rem] items-center justify-center rounded border border-border bg-muted/40 px-2 py-1 font-mono text-xs tabular-nums">
                        {formatNumber(global)}
                      </span>
                    </TableCell>

                    {/* STATUS — switch */}
                    <TableCell className="pr-6 text-center" onClick={(e) => e.stopPropagation()}>
                      <Switch
                        checked={destination.enabled}
                        onCheckedChange={() => onToggle?.(destination.id)}
                        aria-label={
                          destination.enabled
                            ? `Disable ${destination.name}`
                            : `Enable ${destination.name}`
                        }
                      />
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
