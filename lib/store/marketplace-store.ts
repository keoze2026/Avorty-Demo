/**
 * Marketplace store — listings, ticker tape, and the user's own positions.
 *
 * This is ephemeral on purpose (no persist): the trading floor is a live
 * snapshot; on reload you join the floor afresh.
 */

"use client";

import { create } from "zustand";

import { makeInitialListings } from "@/lib/mock/marketplace";
import type { BidEvent, MarketListing, MyPosition, PositionStatus } from "@/lib/types";

const TICKER_CAP = 60;
const POSITIONS_CAP = 12;

interface MarketState {
  listings: MarketListing[];
  ticker: BidEvent[];
  positions: MyPosition[];
  /** Featured listing id (auto-selected) */
  featuredId: string | null;

  /** True when the user has paused the live simulation. */
  paused: boolean;
  setPaused: (next: boolean) => void;

  /** Total bid count emitted (used as a tiny KPI on the page). */
  bidCount: number;

  /** Replace the whole listings array (used during ticks / resets). */
  setListings: (next: MarketListing[]) => void;
  /** Append a listing — used when one rotates in. */
  pushListing: (l: MarketListing) => void;
  /** Drop a listing — used on expiry. */
  removeListing: (id: string) => void;
  /** Patch a listing's mutable fields (top bid, history, etc.). */
  patchListing: (id: string, patch: Partial<MarketListing>) => void;

  /** Append a bid event to the ticker (capped). */
  pushBid: (b: BidEvent) => void;

  /** Pick which listing is featured. */
  setFeatured: (id: string | null) => void;

  /** Place a bid as the current user — also pushes a position and a ticker event. */
  placeBid: (listing: MarketListing, amount: number) => void;
  /** Update a single position's status. */
  setPositionStatus: (listingId: string, status: PositionStatus) => void;
}

export const useMarketplaceStore = create<MarketState>()((set, get) => ({
  listings: makeInitialListings(),
  ticker: [],
  positions: [],
  featuredId: null,
  paused: false,
  bidCount: 0,

  setPaused: (next) => set({ paused: next }),
  setListings: (next) => set({ listings: next }),
  pushListing: (l) => set((s) => ({ listings: [...s.listings, l] })),
  removeListing: (id) =>
    set((s) => ({
      listings: s.listings.filter((l) => l.id !== id),
      featuredId: s.featuredId === id ? null : s.featuredId,
    })),
  patchListing: (id, patch) =>
    set((s) => ({
      listings: s.listings.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    })),

  pushBid: (b) =>
    set((s) => ({
      ticker: [b, ...s.ticker].slice(0, TICKER_CAP),
      bidCount: s.bidCount + 1,
    })),

  setFeatured: (id) => set({ featuredId: id }),

  placeBid: (listing, amount) => {
    const now = Date.now();
    const ev: BidEvent = {
      id: `b_${listing.id}_${now.toString(36)}`,
      listingId: listing.id,
      buyerName: "You",
      amount,
      at: now,
      mine: true,
    };

    set((s) => ({
      listings: s.listings.map((l) =>
        l.id === listing.id
          ? {
              ...l,
              topBid: amount,
              topBidder: "You",
              bidderCount: l.bidderCount + (l.topBidder === "You" ? 0 : 1),
              bidHistory: [...l.bidHistory, amount].slice(-30),
            }
          : l,
      ),
      ticker: [ev, ...s.ticker].slice(0, TICKER_CAP),
      bidCount: s.bidCount + 1,
      positions: dedupePosition(
        {
          listingId: listing.id,
          vertical: listing.vertical,
          campaignName: listing.campaignName,
          geo: listing.geo,
          myBid: amount,
          status: "leading",
          placedAt: now,
        },
        s.positions,
      ).slice(0, POSITIONS_CAP),
    }));
  },

  setPositionStatus: (listingId, status) =>
    set((s) => ({
      positions: s.positions.map((p) =>
        p.listingId === listingId ? { ...p, status } : p,
      ),
    })),
}));

function dedupePosition(next: MyPosition, current: MyPosition[]): MyPosition[] {
  const filtered = current.filter((p) => p.listingId !== next.listingId);
  return [next, ...filtered];
}
