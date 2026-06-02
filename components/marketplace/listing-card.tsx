"use client";

import { motion } from "framer-motion";
import { MapPin, Star, Users } from "lucide-react";

import { AnimatedPrice } from "./animated-price";
import { CountdownTimer } from "./countdown-timer";
import { DepthSpark } from "./depth-spark";
import { Button } from "@/components/ui/button";
import { VERTICAL_PALETTE } from "@/lib/mock/marketplace";
import { useMarketplaceStore } from "@/lib/store/marketplace-store";
import { useTranslation } from "@/hooks/use-translation";
import type { MarketListing } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ListingCard({
  listing,
  onFocus,
  isFeatured,
}: {
  listing: MarketListing;
  onFocus: (id: string) => void;
  isFeatured?: boolean;
}) {
  const { t } = useTranslation();
  const placeBid = useMarketplaceStore((s) => s.placeBid);
  const myPos = useMarketplaceStore((s) =>
    s.positions.find((p) => p.listingId === listing.id),
  );
  const palette = VERTICAL_PALETTE[listing.vertical];
  const ended = listing.endsAt - Date.now() <= 0;
  const quickBid = () => placeBid(listing, Math.round((listing.topBid + 1) * 100) / 100);

  return (
    <motion.div
      layout
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18 }}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-xl border bg-card p-4 transition-colors",
        isFeatured
          ? "border-accent shadow-lg shadow-accent/15 ring-1 ring-accent/30"
          : listing.hot
            ? "border-[oklch(0.78_0.16_75)]/50 shadow-md shadow-[oklch(0.78_0.16_75)]/10"
            : "border-border hover:border-accent/30 hover:shadow-md hover:shadow-accent/10",
      )}
      onClick={() => onFocus(listing.id)}
    >
      {/* Tone glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `color-mix(in oklab, ${palette.line} 35%, transparent)` }}
      />

      {/* Top row: vertical, hot, timer */}
      <div className="relative flex items-center justify-between gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider",
            palette.chip,
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", palette.dot)} />
          {listing.vertical}
        </span>
        {listing.hot && (
          <Star className="h-3 w-3 fill-[oklch(0.78_0.16_75)] text-[oklch(0.78_0.16_75)]" />
        )}
        <CountdownTimer endsAt={listing.endsAt} className="ml-auto" />
      </div>

      {/* Center: price + geo */}
      <div className="relative mt-3 flex items-end justify-between gap-2">
        <div className="min-w-0">
          <AnimatedPrice value={listing.topBid} size="md" className="text-lg" />
          <p className="text-[11px] text-muted-foreground">
            <span className="font-mono">{listing.topBidder || "—"}</span>{" "}
            <span className="text-muted-foreground/60">{t("toolsUI.marketplace.listingCard.leading")}</span>
          </p>
        </div>
        <DepthSpark series={listing.bidHistory} vertical={listing.vertical} width={80} height={24} />
      </div>

      {/* Campaign + geo */}
      <div className="relative mt-3 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <span className="truncate">{listing.campaignName}</span>
        <span className="inline-flex items-center gap-1 font-mono">
          <MapPin className="h-2.5 w-2.5" />
          {listing.geo.state}
        </span>
      </div>

      {/* Bottom: bidders + quick-bid */}
      <div className="relative mt-3 flex items-center justify-between gap-2 border-t border-border/60 pt-3">
        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <Users className="h-3 w-3" />
          <span className="font-mono">{listing.bidderCount}</span>
        </span>

        {/* My status chip */}
        {myPos && (
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider",
              myPos.status === "leading" &&
                "border-[color:var(--success)]/40 bg-[color:var(--success)]/10 text-[color:var(--success)]",
              myPos.status === "outbid" &&
                "border-destructive/40 bg-destructive/10 text-destructive",
              myPos.status === "won" &&
                "border-[color:var(--success)]/40 bg-[color:var(--success)]/10 text-[color:var(--success)]",
              myPos.status === "lost" &&
                "border-border bg-secondary/40 text-muted-foreground",
            )}
          >
            {myPos.status === "leading"
              ? t("toolsUI.marketplace.myPositions.leading")
              : myPos.status === "outbid"
                ? t("toolsUI.marketplace.myPositions.outbid")
                : myPos.status === "won"
                  ? t("toolsUI.marketplace.myPositions.won")
                  : t("toolsUI.marketplace.myPositions.lost")}
          </span>
        )}

        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2 text-xs"
          disabled={ended}
          onClick={(e) => {
            e.stopPropagation();
            quickBid();
          }}
        >
          +$1
        </Button>
      </div>
    </motion.div>
  );
}
