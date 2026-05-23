"use client";

import { ArrowUpRight, CheckCircle2, Phone, PhoneMissed, XCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_CALLS } from "@/lib/mock/calls";
import { ROUTES } from "@/lib/constants";
import { formatCurrency, formatDuration, formatRelativeTime } from "@/lib/format";
import type { CallStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_META: Record<CallStatus, { icon: typeof Phone; color: string; label: string }> = {
  ringing: { icon: Phone, color: "text-accent", label: "Ringing" },
  "in-progress": { icon: Phone, color: "text-accent", label: "Live" },
  completed: { icon: CheckCircle2, color: "text-[oklch(0.6_0.18_155)] dark:text-[oklch(0.78_0.18_155)]", label: "Won" },
  missed: { icon: PhoneMissed, color: "text-[oklch(0.6_0.16_75)] dark:text-[oklch(0.82_0.16_75)]", label: "Missed" },
  rejected: { icon: XCircle, color: "text-destructive", label: "Rejected" },
  failed: { icon: XCircle, color: "text-destructive", label: "Failed" },
};

export function RecentCallsFeed() {
  const calls = MOCK_CALLS.slice(0, 8);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Recent calls</CardTitle>
        <Link
          href={ROUTES.calls}
          className="inline-flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground"
        >
          View all <ArrowUpRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {calls.map((c, i) => {
          const meta = STATUS_META[c.status];
          const Icon = meta.icon;
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.03 * i, duration: 0.28 }}
              className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-secondary/60"
            >
              <div className={cn("inline-flex h-8 w-8 items-center justify-center rounded-md bg-secondary/60", meta.color)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-mono text-xs">{c.callerNumber}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {c.geo.state}
                  </Badge>
                </div>
                <div className="truncate text-[11px] text-muted-foreground">{c.campaignName}</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-xs">{formatDuration(c.durationSec)}</div>
                <div className="text-[10px] text-muted-foreground">
                  {c.payout ? formatCurrency(c.payout, true) : meta.label}
                </div>
              </div>
              <div className="hidden w-16 text-right text-[10px] font-mono text-muted-foreground sm:block">
                {formatRelativeTime(c.startedAt)}
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
