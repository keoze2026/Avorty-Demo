/**
 * Marketplace / RTB service — /api/rtb/*.
 *
 * Backend exposes 4 endpoints: list auctions, get auction detail, list bids
 * on an auction, submit a bid. RTB events also stream through the call
 * WebSocket (`rtb.auction_created`, `rtb.bid_placed`, `rtb.auction_settled`)
 * so the marketplace ticker can be socket-driven.
 */

import { http } from "@/lib/api/http";
import type { Paginated } from "@/lib/api/types";

export type AuctionStatus = "open" | "settled" | "cancelled";

export interface Auction {
  id: string;
  campaignId?: string;
  campaignName?: string;
  callerNumber?: string;
  status: AuctionStatus;
  bidFloor: number;
  winningBid?: number;
  winningBuyerId?: string;
  winningBuyerName?: string;
  createdAt: number;
  settledAt?: number;
}

export interface Bid {
  id: string;
  auctionId: string;
  buyerId: string;
  buyerName?: string;
  amount: number;
  /** Backend may store either "winning" or a boolean. */
  isWinning?: boolean;
  createdAt: number;
}

interface AuctionWire {
  id: string;
  campaignId?: string;
  campaignName?: string;
  callerNumber?: string;
  status: string;
  bidFloor: string;
  winningBid?: string;
  winningBuyerId?: string;
  winningBuyerName?: string;
  createdAt: string;
  settledAt?: string | null;
}

interface BidWire {
  id: string;
  auctionId: string;
  buyerId: string;
  buyerName?: string;
  amount: string;
  isWinning?: boolean;
  createdAt: string;
}

function toNum(s: string | number | undefined, fallback = 0): number {
  if (typeof s === "number") return s;
  if (typeof s === "string") {
    const n = Number(s);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

function toTs(s: string | null | undefined): number | undefined {
  if (!s) return undefined;
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : undefined;
}

function normalizeStatus(raw: string): AuctionStatus {
  const s = raw.toLowerCase();
  if (s === "settled" || s === "cancelled") return s;
  return "open";
}

function wireToAuction(w: AuctionWire): Auction {
  return {
    id: w.id,
    campaignId: w.campaignId,
    campaignName: w.campaignName,
    callerNumber: w.callerNumber,
    status: normalizeStatus(w.status),
    bidFloor: toNum(w.bidFloor),
    winningBid: w.winningBid !== undefined ? toNum(w.winningBid) : undefined,
    winningBuyerId: w.winningBuyerId,
    winningBuyerName: w.winningBuyerName,
    createdAt: toTs(w.createdAt) ?? Date.now(),
    settledAt: toTs(w.settledAt ?? null),
  };
}

function wireToBid(w: BidWire): Bid {
  return {
    id: w.id,
    auctionId: w.auctionId,
    buyerId: w.buyerId,
    buyerName: w.buyerName,
    amount: toNum(w.amount),
    isWinning: !!w.isWinning,
    createdAt: toTs(w.createdAt) ?? Date.now(),
  };
}

export const marketplaceService = {
  async listAuctions(
    query: { page?: number; pageSize?: number; status?: AuctionStatus } = {},
  ): Promise<Paginated<Auction>> {
    const res = await http.get<Paginated<AuctionWire>>("/api/rtb/auctions", { query });
    return { ...res, items: res.items.map(wireToAuction) };
  },

  async getAuction(id: string): Promise<Auction> {
    return wireToAuction(await http.get<AuctionWire>(`/api/rtb/auctions/${id}`));
  },

  async listBids(auctionId: string): Promise<Bid[]> {
    const wire = await http.get<BidWire[]>(`/api/rtb/auctions/${auctionId}/bids`);
    return wire.map(wireToBid);
  },

  async submitBid(input: {
    auctionId: string;
    buyerId: string;
    amount: number;
  }): Promise<Bid> {
    const wire = await http.post<BidWire>("/api/rtb/bid", {
      body: {
        auctionId: input.auctionId,
        buyerId: input.buyerId,
        amount: String(input.amount),
      },
    });
    return wireToBid(wire);
  },
};
