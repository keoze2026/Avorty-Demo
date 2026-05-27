"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Target } from "lucide-react";

import { DestinationBuilder } from "@/components/destinations/destination-builder";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { ROUTES } from "@/lib/constants";
import { MOCK_CALLS } from "@/lib/mock/calls";
import { useDestinationsStore } from "@/lib/store/destinations-store";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { Buyer } from "@/lib/types";
import { cn } from "@/lib/utils";

interface BuyerDestinationsTabProps {
  buyer: Buyer;
}

export function BuyerDestinationsTab({ buyer }: BuyerDestinationsTabProps) {
  // Select the stable array, filter outside the selector to avoid Zustand v5's
  // useSyncExternalStore infinite-render trap (React error #185).
  const allDestinations = useDestinationsStore((s) => s.destinations);
  const destinations = useMemo(
    () => allDestinations.filter((d) => d.buyerId === buyer.id),
    [allDestinations, buyer.id],
  );
  const [builderOpen, setBuilderOpen] = useState(false);

  // Per-TFN call aggregates from today, computed once per render.
  const statsByTfn = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const startMs = start.getTime();
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
    return { callsByTfn, revenueByTfn, ccByTfn };
  }, []);

  if (destinations.length === 0) {
    return (
      <>
        <EmptyState
          icon={Target}
          tone="cyan"
          title="No destinations yet"
          description="Add a destination TFN to start routing calls to this buyer."
          actions={
            <Button onClick={() => setBuilderOpen(true)}>
              <Plus className="h-4 w-4" /> Add destination
            </Button>
          }
        />
        <DestinationBuilder open={builderOpen} onOpenChange={setBuilderOpen} />
      </>
    );
  }

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {destinations.length} {destinations.length === 1 ? "destination" : "destinations"}
          {" · "}each with its own concurrency and cap settings.
        </p>
        <Button size="sm" onClick={() => setBuilderOpen(true)}>
          <Plus className="h-4 w-4" /> Add destination
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {destinations.map((d) => {
          const callsToday = statsByTfn.callsByTfn.get(d.tfn) ?? 0;
          const revenueToday = statsByTfn.revenueByTfn.get(d.tfn) ?? 0;
          const cc = statsByTfn.ccByTfn.get(d.tfn) ?? 0;
          const capPct = d.dailyCap > 0 ? Math.min(100, (callsToday / d.dailyCap) * 100) : 0;
          const capColor =
            capPct >= 90 ? "bg-destructive" :
            capPct >= 70 ? "bg-[color:var(--warning)]" :
            "bg-accent";
          return (
            <Card
              key={d.id}
              className="overflow-hidden transition-all hover:-translate-y-0.5 hover:border-accent/40"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`${ROUTES.destinations}/${d.id}`}
                      className="block truncate text-sm font-semibold transition-colors hover:text-accent"
                    >
                      {d.name}
                    </Link>
                    <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                      {d.tfn}
                    </p>
                  </div>
                  {d.enabled ? (
                    <Badge variant="success">Active</Badge>
                  ) : (
                    <Badge variant="outline">Disabled</Badge>
                  )}
                </div>

                <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-border/40 pt-3 text-center">
                  <div>
                    <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      CC
                    </dt>
                    <dd className="font-mono">
                      <span className={cn(cc > 0 ? "text-accent" : "text-muted-foreground")}>
                        {cc}
                      </span>
                      <span className="text-muted-foreground"> / {d.concurrencyCap}</span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Calls
                    </dt>
                    <dd className="font-mono">{formatNumber(callsToday)}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Revenue
                    </dt>
                    <dd className="font-mono">{formatCurrency(revenueToday)}</dd>
                  </div>
                </dl>

                {d.dailyCap > 0 && (
                  <div className="mt-3">
                    <div className="mb-1 flex items-baseline justify-between text-[10px] text-muted-foreground">
                      <span className="uppercase tracking-wider">Daily cap</span>
                      <span className="font-mono tabular-nums">
                        {formatNumber(callsToday)} / {formatNumber(d.dailyCap)} · {Math.round(capPct)}%
                      </span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full transition-[width]", capColor)}
                        style={{ width: `${capPct}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <DestinationBuilder open={builderOpen} onOpenChange={setBuilderOpen} />
    </>
  );
}
