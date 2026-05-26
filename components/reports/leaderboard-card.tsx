"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GroupAggregate } from "@/lib/analytics";
import { formatCompact, formatCurrency, formatPercent } from "@/lib/format";

interface Props {
  title: string;
  icon: LucideIcon;
  rows: GroupAggregate[];
  /** Optional href builder, e.g. `${ROUTES.buyers}/${row.key}` */
  hrefFor?: (row: GroupAggregate) => string;
  limit?: number;
}

export function LeaderboardCard({ title, icon: Icon, rows, hrefFor, limit = 5 }: Props) {
  const slice = rows.slice(0, limit);
  const max = Math.max(...slice.map((r) => r.revenue), 1);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-4 w-4 text-accent" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {slice.length === 0 && (
          <p className="rounded-md border border-dashed border-border/60 bg-secondary/30 p-3 text-center text-xs text-muted-foreground">
            No data in the selected window.
          </p>
        )}
        {slice.map((r, i) => {
          const pct = (r.revenue / max) * 100;
          const Wrapper = ({ children }: { children: React.ReactNode }) =>
            hrefFor ? (
              <Link href={hrefFor(r)} className="block">
                {children}
              </Link>
            ) : (
              <div>{children}</div>
            );

          return (
            <motion.div
              key={r.key}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i, duration: 0.3 }}
            >
              <Wrapper>
                <div className="group relative overflow-hidden rounded-lg border border-border/60 bg-secondary/30 p-3 transition-all hover:border-accent/30">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 left-0 bg-accent/10"
                    style={{ width: `${pct}%` }}
                  />
                  <div className="relative flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-muted-foreground">#{i + 1}</span>
                        <span className="truncate text-sm font-medium">{r.label}</span>
                        {hrefFor && (
                          <ArrowUpRight className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="font-mono">{formatCompact(r.count)} calls</span>
                        <span>·</span>
                        <span className="font-mono">
                          {formatPercent(r.conversionRate * 100, 0)} conv
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-sm font-semibold">{formatCurrency(r.revenue)}</span>
                  </div>
                </div>
              </Wrapper>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
