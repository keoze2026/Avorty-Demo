"use client";

import { useMemo } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Hash } from "lucide-react";
import { useNumbersStore } from "@/lib/store/numbers-store";
import { formatCurrency, toE164 } from "@/lib/format";

export function TrackingNumbersSection({ campaignId }: { campaignId: string }) {
  // Stable selector + useMemo to avoid the new-ref-per-render Zustand loop.
  const allNumbers = useNumbersStore((s) => s.numbers);
  const setNumberStatus = useNumbersStore((s) => s.setNumberStatus);
  const numbers = useMemo(
    () => (allNumbers ?? []).filter((n) => n.campaignId === campaignId),
    [allNumbers, campaignId],
  );

  return (
    <section className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-[13px] font-semibold uppercase tracking-wider">Tracking Numbers</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Set up unique phone numbers to track calls from your marketing campaigns.
          </p>
        </div>
        <Button size="sm" onClick={() => toast.info("Provision number — coming soon")}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      {numbers.length === 0 ? (
        <EmptyState
          icon={Hash}
          tone="violet"
          title="No tracking numbers"
          description="Provision a number or attach an existing one to start routing calls into this campaign."
          actions={
            <Button size="sm">
              <Plus className="h-4 w-4" /> Add tracking number
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6 uppercase tracking-wider text-[11px]">Number</TableHead>
                <TableHead className="uppercase tracking-wider text-[11px]">Type</TableHead>
                <TableHead className="uppercase tracking-wider text-[11px]">Name</TableHead>
                <TableHead className="uppercase tracking-wider text-[11px]">Vendor</TableHead>
                <TableHead className="uppercase tracking-wider text-[11px]">Payout</TableHead>
                <TableHead className="text-center uppercase tracking-wider text-[11px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {numbers.map((n) => (
                <TableRow key={n.id}>
                  <TableCell className="pl-6 font-mono text-xs whitespace-nowrap">
                    {toE164(n.number)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {n.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{n.label ?? "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {n.vendor ?? "Vortyx"}
                  </TableCell>
                  <TableCell className="font-mono text-xs tabular-nums">
                    {formatCurrency(n.payoutPerCall ?? 0, true)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={n.status === "active"}
                      onCheckedChange={(v) => {
                        setNumberStatus(n.id, v ? "active" : "paused");
                        toast.success(
                          v ? `Activated ${toE164(n.number)}` : `Paused ${toE164(n.number)}`,
                        );
                      }}
                      aria-label={`Toggle ${toE164(n.number)}`}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </section>
  );
}
