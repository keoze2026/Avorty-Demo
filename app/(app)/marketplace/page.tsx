"use client";

import { useEffect, useMemo } from "react";
import { Activity, Gavel, Pause, Play } from "lucide-react";

import { BidTape } from "@/components/marketplace/bid-tape";
import { FeaturedAuction } from "@/components/marketplace/featured-auction";
import { ListingsGrid } from "@/components/marketplace/listings-grid";
import { MarketplaceTicker } from "@/components/marketplace/marketplace-ticker";
import { MyPositions } from "@/components/marketplace/my-positions";
import { VerticalHeat } from "@/components/marketplace/vertical-heat";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { useMarketplaceStream } from "@/hooks/use-marketplace-stream";
import { useMarketplaceStore } from "@/lib/store/marketplace-store";
import { formatCompact, formatCurrency } from "@/lib/format";

export default function MarketplacePage() {
  // Boot the live simulation
  useMarketplaceStream();

  const listings = useMarketplaceStore((s) => s.listings);
  const featuredId = useMarketplaceStore((s) => s.featuredId);
  const setFeatured = useMarketplaceStore((s) => s.setFeatured);
  const paused = useMarketplaceStore((s) => s.paused);
  const setPaused = useMarketplaceStore((s) => s.setPaused);
  const bidCount = useMarketplaceStore((s) => s.bidCount);
  const ticker = useMarketplaceStore((s) => s.ticker);

  // Auto-pick a featured listing if none chosen
  useEffect(() => {
    if (!featuredId && listings.length > 0) {
      const next = [...listings]
        .filter((l) => l.endsAt > Date.now() + 5_000)
        .sort((a, b) => {
          if (a.hot !== b.hot) return a.hot ? -1 : 1;
          return b.bidderCount - a.bidderCount;
        })[0];
      if (next) setFeatured(next.id);
    }
  }, [featuredId, listings, setFeatured]);

  // If the featured listing retires, pick another
  useEffect(() => {
    if (featuredId && !listings.find((l) => l.id === featuredId)) {
      setFeatured(null);
    }
  }, [featuredId, listings, setFeatured]);

  const featured = useMemo(
    () => (featuredId ? listings.find((l) => l.id === featuredId) ?? null : null),
    [featuredId, listings],
  );

  // Top-of-page mini stats
  const stats = useMemo(() => {
    const totalVolume = ticker.reduce((s, b) => s + b.amount, 0);
    const hot = listings.filter((l) => l.hot).length;
    const closingSoon = listings.filter((l) => l.endsAt - Date.now() < 15_000).length;
    return { totalVolume, hot, closingSoon };
  }, [ticker, listings]);

  return (
    <>
      <PageHeader
        title="Marketplace"
        description="The Vortyx trading floor — real-time bidding on inbound calls."
        actions={
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full border border-border bg-card/60 px-2.5 py-1 text-xs text-muted-foreground backdrop-blur sm:inline-flex">
              <Activity className="h-3 w-3 text-accent" />
              {formatCompact(bidCount)} bids · session
            </span>
            <Button
              size="sm"
              variant={paused ? "default" : "outline"}
              onClick={() => setPaused(!paused)}
              className="gap-1.5"
            >
              {paused ? (
                <>
                  <Play className="h-3.5 w-3.5" /> Resume
                </>
              ) : (
                <>
                  <Pause className="h-3.5 w-3.5" /> Pause floor
                </>
              )}
            </Button>
          </div>
        }
      />

      {/* 4-up at @2xl/main (672px container), 2-up below */}
      <div className="grid grid-cols-2 gap-3 @2xl/main:grid-cols-4">
        <FloorStat label="Open listings" value={formatCompact(listings.length)} accent="text-accent" />
        <FloorStat
          label="Closing < 15s"
          value={formatCompact(stats.closingSoon)}
          accent="text-destructive"
        />
        <FloorStat
          label="Hot listings"
          value={formatCompact(stats.hot)}
          accent="text-[color:var(--warning)]"
        />
        <FloorStat
          label="Tape volume (session)"
          value={formatCurrency(stats.totalVolume)}
          accent="text-[color:var(--success)]"
        />
      </div>

      <MarketplaceTicker />

      {/* Container-query bento — fires only when the content area itself is
          wide enough (@6xl/main = 1152px container). On a 1366px viewport
          with the sidebar open the container is ~1078px, so the layout
          correctly stays stacked. */}
      <div className="grid grid-cols-1 gap-4 @6xl/main:grid-cols-3">
        <div className="min-w-0 @6xl/main:col-span-2">
          <FeaturedAuction listing={featured} />
        </div>
        <div className="min-w-0">
          <MyPositions />
        </div>
      </div>

      <VerticalHeat />

      <div className="grid grid-cols-1 gap-4 @6xl/main:grid-cols-3">
        <div className="min-w-0 @6xl/main:col-span-2">
          <ListingsGrid featuredId={featuredId} onFocus={setFeatured} />
        </div>
        <div className="min-w-0 @6xl/main:sticky @6xl/main:top-[5.5rem] @6xl/main:self-start">
          <BidTape />
        </div>
      </div>

      <p className="-mt-2 flex items-center justify-center gap-1.5 text-xs text-muted-foreground/70">
        <Gavel className="h-3 w-3" />
        Simulated bids stream every ~1.2s
      </p>
    </>
  );
}

function FloorStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-4">
      <div className={`text-xl font-semibold tabular-nums tracking-tight ${accent}`}>{value}</div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}
