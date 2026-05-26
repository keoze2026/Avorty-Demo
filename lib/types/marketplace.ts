/**
 * Marketplace types — real-time call auction primitives.
 *
 * Listings represent open inbound-call inventory that buyers bid on.
 * Bids are atomic events appended to a listing; the top bid wins when
 * the listing's countdown expires.
 */

export type VerticalKey = "Health" | "Solar" | "Legal" | "Auto" | "Finance" | "Home";

export interface BidEvent {
  id: string;
  listingId: string;
  buyerName: string;
  amount: number;
  /** ms epoch */
  at: number;
  /** True if this bid is from the current user */
  mine?: boolean;
}

export interface MarketListing {
  id: string;
  vertical: VerticalKey;
  campaignName: string;
  /** Caller geo */
  geo: { state: string; city?: string };
  /** The floor / starting price */
  floorBid: number;
  /** The current top bid amount */
  topBid: number;
  /** Buyer name leading the auction */
  topBidder: string;
  /** Count of unique bidders */
  bidderCount: number;
  /** Estimated payout if the winner converts the call */
  estimatedPayout: number;
  /** 0..1 — quality / qualification score */
  qualityScore: number;
  /** Pre-qualified tags (e.g. "FICO 700+", "Owner-occupied") */
  tags: string[];
  /** Recent bid amounts for sparkline — newest at end */
  bidHistory: number[];
  /** ms epoch when bidding closes */
  endsAt: number;
  /** "hot" listings get the gold accent treatment */
  hot?: boolean;
}

export type PositionStatus = "leading" | "outbid" | "won" | "lost";

export interface MyPosition {
  /** Mirror of the listing id this position is on */
  listingId: string;
  /** Snapshot of the listing for display (so we can show won/lost cards even after the listing retires) */
  vertical: VerticalKey;
  campaignName: string;
  geo: { state: string; city?: string };
  myBid: number;
  status: PositionStatus;
  placedAt: number;
}
