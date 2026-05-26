"use client";

/**
 * The centerpiece — a single listing on full display.
 * - Rolling price with up/down flash
 * - Live countdown timer (red+pulse < 10s)
 * - Quality score + tags + payout estimate
 * - Mini depth sparkline of the bid history
 * - Quick-bid panel: preset +$1 / +$5, custom input, "Bid" button
 * - Bottom strip: leading bidder + bidder count
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gavel, MapPin, Sparkles, Star, Users } from "lucide-react";
import { toast } from "sonner";

import { AnimatedPrice } from "./animated-price";
import { CountdownTimer } from "./countdown-timer";
import { DepthSpark } from "./depth-spark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VERTICAL_PALETTE } from "@/lib/mock/marketplace";
import { useMarketplaceStore } from "@/lib/store/marketplace-store";
import { formatCurrency, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MarketListing } from "@/lib/types";

export function FeaturedAuction({ listing }: { listing: MarketListing | null }) {
  if (!listing) return <FeaturedSkeleton />;
  return <FeaturedInner listing={listing} />;
}

function FeaturedInner({ listing }: { listing: MarketListing }) {
  const placeBid = useMarketplaceStore((s) => s.placeBid);
  const myLast = useMarketplaceStore((s) =>
    s.positions.find((p) => p.listingId === listing.id),
  );
  const palette = VERTICAL_PALETTE[listing.vertical];

  const minBid = useMemo(() => Math.round((listing.topBid + 0.5) * 100) / 100, [listing.topBid]);
  const [customBid, setCustomBid] = useState<string>(minBid.toFixed(2));

  // Keep the custom-bid input fresh as the top moves, but only when the user
  // hasn't edited it yet (heuristic: still equal to a previous min suggestion).
  useMemoUpdate(customBid, minBid, setCustomBid);

  const submit = (amount: number) => {
    if (amount <= listing.topBid) {
      toast.error("Bid must beat the current top.");
      return;
    }
    placeBid(listing, amount);
    toast.success(`Bid placed at ${formatCurrency(amount, true)}`, {
      description: `${listing.vertical} · ${listing.campaignName}`,
    });
  };

  const ended = listing.endsAt - Date.now() <= 0;

  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32 }}
      className="relative overflow-hidden rounded-2xl border border-border bg-card p-6"
    >
      {/* Premium ambient glow + faint dot grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60 bg-dot-grid"
        style={{
          maskImage: "radial-gradient(ellipse 60% 70% at 30% 0%, #000 30%, transparent 75%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl"
        style={{ background: `color-mix(in oklab, ${palette.line} 40%, transparent)` }}
      />

      <div className="relative flex flex-col gap-6 lg:flex-row">
        {/* Left: details */}
        <div className="flex-1 space-y-5">
          <header className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider",
                palette.chip,
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", palette.dot)} />
              {listing.vertical}
            </span>
            {listing.hot && (
              <span className="inline-flex items-center gap-1 rounded-full border border-[oklch(0.78_0.16_75)]/40 bg-[oklch(0.78_0.16_75)]/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[oklch(0.6_0.16_75)] dark:text-[oklch(0.82_0.16_75)]">
                <Star className="h-2.5 w-2.5 fill-current" />
                Hot
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {listing.geo.city ? `${listing.geo.city}, ${listing.geo.state}` : listing.geo.state}
            </span>
            <span className="ml-auto text-[10px] font-mono text-muted-foreground">{listing.id}</span>
          </header>

          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              Current top bid
            </p>
            <div className="mt-1 flex items-baseline gap-3">
              <AnimatedPrice value={listing.topBid} size="lg" />
              <span className="text-xs text-muted-foreground">
                from <span className="font-mono text-foreground">{listing.topBidder || "—"}</span>
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Floor {formatCurrency(listing.floorBid, true)} ·{" "}
              <span className="text-foreground">{listing.campaignName}</span> ·{" "}
              Est. payout {formatCurrency(listing.estimatedPayout, true)}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {listing.tags.map((t) => (
              <span
                key={t}
                className="rounded-md border border-border bg-secondary/40 px-2 py-0.5 text-[10px] font-mono"
              >
                {t}
              </span>
            ))}
          </div>

          {/* Bottom strip */}
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Quality" value={formatPercent(listing.qualityScore * 100, 0)} />
            <Stat label="Bidders" value={listing.bidderCount.toString()} icon={Users} />
            <Stat label="Timer" custom={<CountdownTimer endsAt={listing.endsAt} variant="lg" />} />
          </div>
        </div>

        {/* Right: bid panel */}
        <div className="w-full max-w-sm space-y-4 rounded-2xl border border-accent/40 bg-card/80 p-5 shadow-xl shadow-accent/10 backdrop-blur lg:w-80">
          <header className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-accent/15 text-accent">
              <Gavel className="h-3.5 w-3.5" />
            </span>
            <span className="text-sm font-semibold">Place a bid</span>
          </header>

          {/* Quick bumps */}
          <div className="grid grid-cols-3 gap-2">
            {[1, 5, 10].map((bump) => {
              const amount = Math.round((listing.topBid + bump) * 100) / 100;
              return (
                <Button
                  key={bump}
                  size="sm"
                  variant="outline"
                  disabled={ended}
                  onClick={() => submit(amount)}
                  className="font-mono"
                >
                  +${bump}
                </Button>
              );
            })}
          </div>

          {/* Custom + place */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                type="number"
                min={minBid}
                step="0.25"
                value={customBid}
                onChange={(e) => setCustomBid(e.target.value)}
                className="h-10 font-mono"
                disabled={ended}
              />
              <Button
                size="default"
                disabled={ended}
                onClick={() => submit(parseFloat(customBid))}
                className="shrink-0 font-semibold"
              >
                Bid
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Minimum to lead: <span className="font-mono">{formatCurrency(minBid, true)}</span>
            </p>
          </div>

          {/* My status on this listing */}
          <AnimatePresence>
            {myLast && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "rounded-lg border p-2.5 text-xs",
                  myLast.status === "leading"
                    ? "border-[color:var(--success)]/40 bg-[color:var(--success)]/10 text-[color:var(--success)]"
                    : myLast.status === "outbid"
                      ? "border-destructive/40 bg-destructive/10 text-destructive"
                      : "border-border bg-secondary/40 text-muted-foreground",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono uppercase tracking-wider">
                    {myLast.status === "leading"
                      ? "Leading"
                      : myLast.status === "outbid"
                        ? "Outbid"
                        : myLast.status === "won"
                          ? "Won"
                          : "Lost"}
                  </span>
                  <span className="font-mono">{formatCurrency(myLast.myBid, true)}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom sparkline strip */}
      <div className="relative mt-6 flex items-center justify-between rounded-lg border border-border/60 bg-secondary/30 p-3">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Price trajectory
          </p>
          <p className="mt-0.5 text-xs">
            <span className="font-mono text-muted-foreground">
              {listing.bidHistory.length} bids ·
            </span>{" "}
            <span className="font-mono">
              +{formatPercent(
                ((listing.topBid - listing.floorBid) / listing.floorBid) * 100,
                1,
              )}
            </span>{" "}
            <span className="text-muted-foreground">from floor</span>
          </p>
        </div>
        <DepthSpark series={listing.bidHistory} vertical={listing.vertical} width={280} height={48} />
      </div>
    </motion.section>
  );
}

function Stat({
  label,
  value,
  custom,
  icon: Icon,
}: {
  label: string;
  value?: string;
  custom?: React.ReactNode;
  icon?: typeof Users;
}) {
  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-2.5">
      <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </div>
      {custom ?? <div className="mt-0.5 font-mono text-base font-semibold">{value}</div>}
    </div>
  );
}

function FeaturedSkeleton() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
        Picking the next listing…
      </div>
      <div className="mt-6 h-12 w-48 rounded-md bg-secondary/50 animate-pulse" />
      <div className="mt-3 h-4 w-72 rounded-md bg-secondary/40 animate-pulse" />
    </section>
  );
}

/** Keep a controlled value in sync with a derived value, while the user is idle. */
function useMemoUpdate(current: string, next: number, set: (v: string) => void) {
  const lastSync = useRef(next.toFixed(2));
  useEffect(() => {
    // Only auto-sync if the user hasn't edited away from our last sync
    if (current === lastSync.current) {
      const nv = next.toFixed(2);
      lastSync.current = nv;
      set(nv);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [next]);
}
