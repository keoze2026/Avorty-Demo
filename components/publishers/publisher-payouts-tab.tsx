"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, FileDown, Loader2, Receipt } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCompact, formatCurrency } from "@/lib/format";
import { usePublishersStore } from "@/lib/store/publishers-store";
import type { PayoutStatus } from "@/lib/types";

const STATUS_BADGE: Record<PayoutStatus, { variant: React.ComponentProps<typeof Badge>["variant"]; label: string; icon: typeof CheckCircle2 }> = {
  paid: { variant: "success", label: "Paid", icon: CheckCircle2 },
  pending: { variant: "outline", label: "Pending", icon: Clock },
  processing: { variant: "warning", label: "Processing", icon: Loader2 },
  failed: { variant: "destructive", label: "Failed", icon: Receipt },
};

export function PublisherPayoutsTab({ publisherId }: { publisherId: string }) {
  const payouts = usePublishersStore((s) => s.payoutsFor(publisherId));
  const publisher = usePublishersStore((s) => s.getById(publisherId));

  if (!publisher) return null;

  const totalPaid = payouts.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const upcomingDate = payouts.find((p) => p.status !== "paid")?.scheduledFor;

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <SummaryCard
          label="Pending balance"
          value={formatCurrency(publisher.pendingPayout)}
          accent="bg-[color:var(--warning)]/15 text-[color:var(--warning)]"
          icon={Clock}
          subtitle={upcomingDate ? `Next payout ${new Date(upcomingDate).toLocaleDateString()}` : "—"}
        />
        <SummaryCard
          label="Paid this quarter"
          value={formatCurrency(totalPaid)}
          accent="bg-[color:var(--success)]/15 text-[color:var(--success)]"
          icon={CheckCircle2}
          subtitle={`${payouts.filter((p) => p.status === "paid").length} payouts`}
        />
        <SummaryCard
          label="Lifetime revenue"
          value={formatCurrency(publisher.lifetimeRevenue)}
          accent="bg-accent/15 text-accent"
          icon={Receipt}
          subtitle={`${formatCompact(publisher.callsMonth)} calls / mo`}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Payout history</CardTitle>
          <Button size="sm" variant="outline">
            <FileDown className="h-3.5 w-3.5" /> Export
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/40">
                  <TableHead>Period</TableHead>
                  <TableHead>Calls</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Paid / scheduled</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((p, i) => {
                  const meta = STATUS_BADGE[p.status];
                  const Icon = meta.icon;
                  const animate = p.status === "processing";
                  return (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.3 }}
                      className="hover:bg-secondary/30"
                    >
                      <TableCell className="font-mono text-xs">{p.period}</TableCell>
                      <TableCell className="font-mono">{formatCompact(p.callsCount)}</TableCell>
                      <TableCell className="font-mono font-semibold">
                        {formatCurrency(p.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={meta.variant} className="gap-1">
                          <Icon className={`h-3 w-3 ${animate ? "animate-spin" : ""}`} />
                          {meta.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {p.paidAt
                          ? new Date(p.paidAt).toLocaleDateString()
                          : new Date(p.scheduledFor).toLocaleDateString()}
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  subtitle,
  accent,
  icon: Icon,
}: {
  label: string;
  value: string;
  subtitle: string;
  accent: string;
  icon: typeof CheckCircle2;
}) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-4">
        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${accent}`}>
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="font-mono text-xl font-bold">{value}</div>
          <div className="mt-0.5 text-[10px] text-muted-foreground">{subtitle}</div>
        </div>
      </CardContent>
    </Card>
  );
}
