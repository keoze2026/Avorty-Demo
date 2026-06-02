"use client";

/**
 * Stock-ticker marquee — horizontally scrolling recent bid events with
 * vertical chips and color-coded buyer names. The strip pauses on hover.
 */

import { useMemo } from "react";
import { Activity } from "lucide-react";

import { VERTICAL_PALETTE } from "@/lib/mock/marketplace";
import { useMarketplaceStore } from "@/lib/store/marketplace-store";
import { useTranslation } from "@/hooks/use-translation";
import type { VerticalKey } from "@/lib/types";
import { cn } from "@/lib/utils";

export function MarketplaceTicker() {
  const { t } = useTranslation();
  const ticker = useMarketplaceStore((s) => s.ticker);
  const listings = useMarketplaceStore((s) => s.listings);

  // Pre-compute vertical per listing for fast lookup
  const verticalByListing = useMemo(() => {
    const m = new Map<string, VerticalKey>();
    for (const l of listings) m.set(l.id, l.vertical);
    return m;
  }, [listings]);

  // Take the most recent 30 — duplicated so the scroll loops cleanly
  const items = ticker.slice(0, 30);
  if (items.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-border bg-card/60 px-3 py-2 backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Activity className="h-3.5 w-3.5 text-accent animate-pulse" />
          {t("toolsUI.marketplace.ticker.warmingUp")}
        </div>
      </div>
    );
  }
  const loop = [...items, ...items];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-card/60 backdrop-blur-md",
        "[--ticker-mask:linear-gradient(to_right,transparent,#000_4%,#000_96%,transparent)]",
      )}
    >
      {/* Live label */}
      <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center gap-1.5 bg-gradient-to-r from-background via-background/95 to-transparent pl-3 pr-6 text-xs font-medium">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
        </span>
        <span className="text-foreground/80">{t("toolsUI.marketplace.ticker.liveTape")}</span>
      </div>

      <div
        className="flex w-max items-center gap-6 py-2.5 pl-28 pr-4 hover:[animation-play-state:paused]"
        style={{
          maskImage: "var(--ticker-mask)",
          WebkitMaskImage: "var(--ticker-mask)",
          animation: "marketTickerScroll 60s linear infinite",
        }}
      >
        {loop.map((b, i) => {
          const v = verticalByListing.get(b.listingId);
          const palette = v ? VERTICAL_PALETTE[v] : null;
          return (
            <span
              key={`${b.id}-${i}`}
              className="inline-flex items-center gap-1.5 text-[12px]"
            >
              {palette && <span className={cn("inline-block h-1.5 w-1.5 rounded-full", palette.dot)} />}
              <span className={b.mine ? "text-accent font-semibold" : "text-muted-foreground"}>
                {b.buyerName}
              </span>
              <span className="font-medium tabular-nums text-foreground">${b.amount.toFixed(2)}</span>
              {v && <span className="text-muted-foreground/70">{v}</span>}
            </span>
          );
        })}
      </div>

      {/* Keyframes injected once via inline <style>. Animation key is custom-named so it can't collide with `animate-shimmer` from globals. */}
      <style jsx>{`
        @keyframes marketTickerScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
