"use client";

/**
 * Drives the live marketplace simulation:
 * - Emits competing bids on existing listings (price climbs).
 * - When a listing's timer expires: resolve any user position, then retire it
 *   and spawn a fresh listing to replace it.
 * - Promotes user positions through leading → outbid → won/lost.
 *
 * Pauses cleanly when `paused` is true on the store.
 */

import { useEffect, useRef } from "react";

import { BUYER_POOL, makeListing } from "@/lib/mock/marketplace";
import { useMarketplaceStore } from "@/lib/store/marketplace-store";
import type { BidEvent, MarketListing } from "@/lib/types";

const TICK_MS = 1200;

let seedCounter = 9_991;

function rng() {
  seedCounter = (seedCounter * 9301 + 49297) % 233280;
  return seedCounter / 233280;
}

function competingBid(listing: MarketListing): BidEvent {
  // Step bumps a few cents to a couple of dollars
  const step = Math.round((0.25 + rng() * 2.75) * 100) / 100;
  const amount = Math.round((listing.topBid + step) * 100) / 100;
  const pool = BUYER_POOL.filter((n) => n !== listing.topBidder);
  const buyerName = pool[Math.floor(rng() * pool.length)] ?? BUYER_POOL[0];
  return {
    id: `b_${listing.id}_${Date.now().toString(36)}_${Math.floor(rng() * 1000)}`,
    listingId: listing.id,
    buyerName,
    amount,
    at: Date.now(),
  };
}

export function useMarketplaceStream() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const tick = () => {
      const s = useMarketplaceStore.getState();
      if (s.paused) return;

      const now = Date.now();

      // Resolve expired listings first
      const expired = s.listings.filter((l) => l.endsAt <= now);
      for (const l of expired) {
        const userPos = s.positions.find((p) => p.listingId === l.id);
        if (userPos) {
          const won = l.topBidder === "You";
          s.setPositionStatus(l.id, won ? "won" : "lost");
        }
        s.removeListing(l.id);
        // Spawn a replacement so the floor stays roughly full
        s.pushListing(makeListing(Math.floor(Math.random() * 1e6), now));
      }

      // Emit 1–3 new competing bids on currently-active listings
      const active = useMarketplaceStore.getState().listings.filter((l) => l.endsAt > now);
      if (active.length === 0) return;

      const wave = 1 + Math.floor(rng() * 3);
      for (let i = 0; i < wave; i++) {
        // Bias toward hot listings + listings that already have bidders
        const idx = pickWeightedIndex(active);
        const l = active[idx];
        if (!l) continue;

        const ev = competingBid(l);
        s.patchListing(l.id, {
          topBid: ev.amount,
          topBidder: ev.buyerName,
          bidderCount: l.bidderCount + (l.topBidder !== ev.buyerName ? 1 : 0),
          bidHistory: [...l.bidHistory, ev.amount].slice(-30),
        });
        s.pushBid(ev);

        // If the user was leading this listing, mark them as outbid
        const userPos = useMarketplaceStore.getState().positions.find((p) => p.listingId === l.id);
        if (userPos?.status === "leading" && ev.buyerName !== "You") {
          s.setPositionStatus(l.id, "outbid");
        }
      }
    };

    intervalRef.current = setInterval(tick, TICK_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);
}

function pickWeightedIndex(list: MarketListing[]): number {
  const weights = list.map((l) => (l.hot ? 3 : 1) + l.bidderCount * 0.4);
  const total = weights.reduce((s, w) => s + w, 0);
  let r = rng() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return list.length - 1;
}
