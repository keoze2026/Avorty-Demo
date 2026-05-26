"use client";

import Link from "next/link";
import { MoreVertical, Pause, Play } from "lucide-react";

import { PartnerStatusBadge } from "@/components/network/partner-status-badge";
import { Button } from "@/components/ui/button";
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
import { formatCompact, formatCurrency, formatPercent } from "@/lib/format";
import type { Buyer } from "@/lib/types";

interface BuyersTableProps {
  buyers: Buyer[];
  onToggle: (id: string) => void;
  onArchive: (id: string) => void;
}

export function BuyersTable({ buyers, onToggle, onArchive }: BuyersTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/40">
            <TableHead className="w-[28%]">Buyer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Bid</TableHead>
            <TableHead className="text-right">Calls today</TableHead>
            <TableHead className="text-right">Spend today</TableHead>
            <TableHead className="text-right">Conv.</TableHead>
            <TableHead className="text-right">Daily cap</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {buyers.map((b) => {
            const isActive = b.status === "active";
            const dailyUsage =
              b.dailyCap > 0 ? Math.min(100, Math.round((b.callsToday / b.dailyCap) * 100)) : 0;
            return (
              <TableRow key={b.id} className="hover:bg-secondary/30">
                <TableCell>
                  <div className="min-w-0">
                    <Link
                      href={`${ROUTES.buyers}/${b.id}`}
                      className="block truncate font-medium transition-colors hover:text-accent"
                    >
                      {b.name}
                    </Link>
                    <div className="truncate text-[10px] font-mono text-muted-foreground">
                      {b.organization} · {b.id}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <PartnerStatusBadge status={b.status} />
                </TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(b.bidAmount, true)}</TableCell>
                <TableCell className="text-right font-mono">{formatCompact(b.callsToday)}</TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(b.spendToday)}</TableCell>
                <TableCell className="text-right font-mono text-xs">
                  {formatPercent(b.conversionRate * 100, 0)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex flex-col items-end gap-1">
                    <span className="font-mono text-xs">
                      {b.dailyCap === 0 ? "∞" : `${dailyUsage}%`}
                    </span>
                    <div className="h-1 w-16 overflow-hidden rounded-full bg-secondary/60">
                      <div
                        className={`h-full rounded-full ${
                          dailyUsage > 85
                            ? "bg-[color:var(--warning)]"
                            : "bg-[color:var(--accent)]"
                        }`}
                        style={{ width: `${dailyUsage}%` }}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Actions">
                        <MoreVertical className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => onToggle(b.id)}>
                        {isActive ? (
                          <>
                            <Pause className="h-4 w-4" /> Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4" /> Activate
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={() => onArchive(b.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
