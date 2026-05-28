"use client";

/**
 * The "tape" — newest-first vertical stream of bid events.
 * Each new event slides in from the top with a brief accent flash.
 */

import { AnimatePresence, motion } from "framer-motion";
import { Activity, User } from "lucide-react";
import { useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VERTICAL_PALETTE } from "@/lib/mock/marketplace";
import { useMarketplaceStore } from "@/lib/store/marketplace-store";
import { formatCurrency, formatRelativeTime } from "@/lib/format";
import type { VerticalKey } from "@/lib/types";
import { cn } from "@/lib/utils";

export function BidTape() {
  const ticker = useMarketplaceStore((s) => s.ticker);
  const listings = useMarketplaceStore((s) => s.listings);

  const verticalById = useMemo(() => {
    const m = new Map<string, VerticalKey>();
    for (const l of listings) m.set(l.id, l.vertical);
    return m;
  }, [listings]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4 text-accent" />
          Bid tape
        </CardTitle>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
          {ticker.length} live
        </span>
      </CardHeader>
      <CardContent className="space-y-1 pr-2 pt-2">
        <div className="max-h-[560px] overflow-y-auto pr-2 scrollbar-hide">
          <AnimatePresence initial={false}>
            {ticker.slice(0, 30).map((b, i) => {
              const v = verticalById.get(b.listingId);
              const palette = v ? VERTICAL_PALETTE[v] : null;
              return (
                <motion.div
                  key={b.id}
                  layout
                  initial={{ opacity: 0, y: -8, backgroundColor: "rgba(82, 102, 224, 0.12)" }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    backgroundColor: i === 0 ? "rgba(82, 102, 224, 0.06)" : "rgba(0, 0, 0, 0)",
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="flex items-center gap-2 rounded-md border border-transparent px-2 py-1.5 text-xs"
                >
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-secondary/60 text-muted-foreground">
                    {b.mine ? (
                      <span className="text-[9px] font-bold text-accent">YOU</span>
                    ) : (
                      <User className="h-3 w-3" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className={cn("truncate font-mono text-[12px]", b.mine && "text-accent font-semibold")}>
                      {b.buyerName}
                    </div>
                    {palette && (
                      <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <span className={cn("inline-block h-1 w-1 rounded-full", palette.dot)} />
                        <span>{v}</span>
                        <span className="text-muted-foreground/60">·</span>
                        <span>{formatRelativeTime(b.at)}</span>
                      </div>
                    )}
                  </div>
                  <span className="font-mono text-xs font-semibold">{formatCurrency(b.amount, true)}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {ticker.length === 0 && (
            <p className="rounded-md border border-dashed border-border/60 bg-secondary/30 p-4 text-center text-[11px] text-muted-foreground">
              Waiting for the first bid…
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
