"use client";

import Link from "next/link";
import { MoreVertical, Pause, Play } from "lucide-react";

import { CampaignStatusBadge } from "./campaign-status-badge";
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
import { VERTICAL_ACCENT, type Campaign } from "@/lib/types";
import { cn } from "@/lib/utils";

const DOT: Record<string, string> = {
  cyan: "bg-accent",
  emerald: "bg-[oklch(0.6_0.18_155)]",
  violet: "bg-[oklch(0.6_0.2_290)]",
  amber: "bg-[oklch(0.6_0.16_75)]",
  rose: "bg-[oklch(0.6_0.2_10)]",
};

interface CampaignsTableProps {
  campaigns: Campaign[];
  onToggle: (id: string) => void;
  onArchive: (id: string) => void;
}

export function CampaignsTable({ campaigns, onToggle, onArchive }: CampaignsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/40">
            <TableHead className="w-[34%]">Campaign</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Payout</TableHead>
            <TableHead className="text-right">Calls today</TableHead>
            <TableHead className="text-right">Revenue</TableHead>
            <TableHead className="text-right">Conv.</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((c) => {
            const tone = VERTICAL_ACCENT[c.vertical] ?? "cyan";
            const isActive = c.status === "active";
            return (
              <TableRow key={c.id} className="hover:bg-secondary/30">
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <span className={cn("inline-block h-2 w-2 rounded-full", DOT[tone])} />
                    <div className="min-w-0">
                      <Link
                        href={`${ROUTES.campaigns}/${c.id}`}
                        className="block truncate font-medium transition-colors hover:text-accent"
                      >
                        {c.name}
                      </Link>
                      <div className="truncate text-[10px] font-mono text-muted-foreground">
                        {c.vertical} · {c.id}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <CampaignStatusBadge status={c.status} />
                </TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(c.payout, true)}</TableCell>
                <TableCell className="text-right font-mono">{formatCompact(c.callsToday)}</TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(c.revenueToday)}</TableCell>
                <TableCell className="text-right font-mono text-xs">
                  {formatPercent(c.conversionRate * 100, 0)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Actions">
                        <MoreVertical className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => onToggle(c.id)}>
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
                        onSelect={() => onArchive(c.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        Archive
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
