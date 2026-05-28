"use client";

import Link from "next/link";
import { MoreVertical, Pause, Pencil, Play } from "lucide-react";

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
import type { Publisher } from "@/lib/types";

export function PublishersTable({
  publishers,
  onToggle,
  onArchive,
  onEdit,
}: {
  publishers: Publisher[];
  onToggle: (id: string) => void;
  onArchive: (id: string) => void;
  onEdit: (id: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/40">
            <TableHead className="w-[26%]">Publisher</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Calls today</TableHead>
            <TableHead className="text-right">Revenue today</TableHead>
            <TableHead className="text-right">Conv.</TableHead>
            <TableHead className="text-right">Payout %</TableHead>
            <TableHead className="text-right">Pending</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {publishers.map((p) => {
            const isActive = p.status === "active";
            return (
              <TableRow key={p.id} className="hover:bg-secondary/30">
                <TableCell>
                  <div className="min-w-0">
                    <Link
                      href={`${ROUTES.publishers}/${p.id}`}
                      className="block truncate font-medium transition-colors hover:text-accent"
                    >
                      {p.name}
                    </Link>
                    <div className="truncate text-[10px] font-mono text-muted-foreground">
                      {p.organization} · {p.id}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <PartnerStatusBadge status={p.status} />
                </TableCell>
                <TableCell className="text-right font-mono">{formatCompact(p.callsToday)}</TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(p.revenueToday)}</TableCell>
                <TableCell className="text-right font-mono text-xs">
                  {formatPercent(p.conversionRate * 100, 0)}
                </TableCell>
                <TableCell className="text-right font-mono text-xs">
                  {formatPercent(p.payoutRate * 100, 0)}
                </TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(p.pendingPayout)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Actions">
                        <MoreVertical className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => onEdit(p.id)}>
                        <Pencil className="h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => onToggle(p.id)}>
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
                        onSelect={() => onArchive(p.id)}
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
