/**
 * Initial marketplace listings — deterministic seed for the trading floor.
 * Live simulation (see `hooks/use-marketplace-stream.ts`) appends bids,
 * retires listings on expiry, and creates new ones over time.
 */

import type { MarketListing, VerticalKey } from "@/lib/types";

const STATES = [
  { code: "TX", city: "Austin" },
  { code: "CA", city: "Los Angeles" },
  { code: "FL", city: "Miami" },
  { code: "NY", city: "Brooklyn" },
  { code: "PA", city: "Pittsburgh" },
  { code: "IL", city: "Chicago" },
  { code: "GA", city: "Atlanta" },
  { code: "OH", city: "Cleveland" },
  { code: "NC", city: "Charlotte" },
  { code: "MI", city: "Detroit" },
];

const VERTICAL_WEIGHTS: Array<{ key: VerticalKey; weight: number; floor: [number, number]; tags: string[]; campaigns: string[] }> = [
  { key: "Health", weight: 0.32, floor: [32, 55], tags: ["Medicare-eligible", "ACA-qualified", "Senior"], campaigns: ["Health Tier 1", "Medicare AEP", "ACA Marketplace"] },
  { key: "Solar", weight: 0.18, floor: [22, 38], tags: ["Roof-owner", "Credit 700+", "Daylight scored"], campaigns: ["Solar Nationwide", "Roof + Solar Bundle"] },
  { key: "Legal", weight: 0.15, floor: [80, 145], tags: ["Mass tort", "Intake signed", "Camp Lejeune"], campaigns: ["Mass Tort Intake", "Personal Injury"] },
  { key: "Auto", weight: 0.13, floor: [26, 42], tags: ["Off-warranty", "VIN verified"], campaigns: ["Auto Warranty HQ", "Extended Auto"] },
  { key: "Finance", weight: 0.12, floor: [28, 52], tags: ["Debt $10k+", "Pre-qual", "FICO 620+"], campaigns: ["Debt Consolidation", "Personal Loan"] },
  { key: "Home", weight: 0.10, floor: [22, 36], tags: ["Owner-occupied", "Service-eligible"], campaigns: ["Home Services", "HVAC Premium"] },
];

function rng(seed: number) {
  return ((seed * 9301 + 49297) % 233280) / 233280;
}

function pickVertical(seed: number): (typeof VERTICAL_WEIGHTS)[number] {
  const r = rng(seed);
  let acc = 0;
  for (const v of VERTICAL_WEIGHTS) {
    acc += v.weight;
    if (r <= acc) return v;
  }
  return VERTICAL_WEIGHTS[0];
}

function pickTags(pool: string[], seed: number, max = 3) {
  const count = 1 + Math.floor(rng(seed) * Math.min(max, pool.length));
  const taken = new Set<string>();
  for (let i = 0; taken.size < count && i < 10; i++) {
    taken.add(pool[Math.floor(rng(seed + i * 7) * pool.length)]);
  }
  return [...taken];
}

let lastId = 0;
export function newListingId() {
  lastId += 1;
  return `lst_${Date.now().toString(36)}_${lastId.toString(36)}`;
}

/** Generate one listing with deterministic-ish randomness from a seed. */
export function makeListing(seed: number, now = Date.now()): MarketListing {
  const v = pickVertical(seed);
  const state = STATES[Math.floor(rng(seed + 11) * STATES.length)];
  const floor = Math.round(v.floor[0] + rng(seed + 21) * (v.floor[1] - v.floor[0]));
  const payout = Math.round(floor * (1.7 + rng(seed + 23) * 0.6));
  const bidderCount = Math.floor(rng(seed + 31) * 6); // 0..5 initial bidders
  const bidHistory: number[] = [floor];
  let top = floor;
  for (let i = 0; i < bidderCount; i++) {
    top = Math.round(top + (0.5 + rng(seed + 41 + i) * 2.5) * 100) / 100;
    bidHistory.push(top);
  }
  const campaign = v.campaigns[Math.floor(rng(seed + 51) * v.campaigns.length)];
  const buyerNames = ["Apex Insurance", "Solar United", "LawHelp Direct", "AutoSafe", "Medi Connect", "Home Pro", "Lendly", "ClaimRight"];
  const topBidder = bidderCount > 0 ? buyerNames[Math.floor(rng(seed + 61) * buyerNames.length)] : "";
  // 10–60 seconds to expiry — staggered so some close fast
  const ttl = 10_000 + Math.floor(rng(seed + 71) * 50_000);
  const hot = rng(seed + 81) > 0.78;

  return {
    id: newListingId(),
    vertical: v.key,
    campaignName: campaign,
    geo: { state: state.code, city: state.city },
    floorBid: floor,
    topBid: top,
    topBidder,
    bidderCount,
    estimatedPayout: payout,
    qualityScore: 0.55 + rng(seed + 91) * 0.4,
    tags: pickTags(v.tags, seed + 101),
    bidHistory,
    endsAt: now + ttl,
    hot,
  };
}

export function makeInitialListings(count = 18): MarketListing[] {
  const now = Date.now();
  return Array.from({ length: count }).map((_, i) => makeListing(i * 17 + 3, now));
}

/** Buyer-name pool used by the bid simulator + featured-auction display. */
export const BUYER_POOL = [
  "Apex Insurance",
  "Solar United",
  "LawHelp Direct",
  "AutoSafe Warranty",
  "Medi Connect",
  "Home Pro Network",
  "Lendly Direct",
  "ClaimRight",
  "Northstar",
  "DialSurge",
];

export const VERTICAL_PALETTE: Record<VerticalKey, { dot: string; chip: string; line: string }> = {
  Health: {
    dot: "bg-[oklch(0.6_0.18_155)]",
    chip: "border-[oklch(0.6_0.18_155)]/40 bg-[oklch(0.6_0.18_155)]/10 text-[oklch(0.6_0.18_155)] dark:text-[oklch(0.78_0.18_155)]",
    line: "oklch(0.6 0.18 155)",
  },
  Solar: {
    dot: "bg-[oklch(0.6_0.16_75)]",
    chip: "border-[oklch(0.6_0.16_75)]/40 bg-[oklch(0.6_0.16_75)]/10 text-[oklch(0.6_0.16_75)] dark:text-[oklch(0.82_0.16_75)]",
    line: "oklch(0.6 0.16 75)",
  },
  Legal: {
    dot: "bg-[oklch(0.6_0.2_290)]",
    chip: "border-[oklch(0.6_0.2_290)]/40 bg-[oklch(0.6_0.2_290)]/10 text-[oklch(0.55_0.2_290)] dark:text-[oklch(0.72_0.2_290)]",
    line: "oklch(0.6 0.2 290)",
  },
  Auto: {
    dot: "bg-accent",
    chip: "border-accent/40 bg-accent/10 text-accent",
    line: "var(--accent)",
  },
  Finance: {
    dot: "bg-[oklch(0.6_0.2_10)]",
    chip: "border-[oklch(0.6_0.2_10)]/40 bg-[oklch(0.6_0.2_10)]/10 text-[oklch(0.55_0.2_10)] dark:text-[oklch(0.72_0.2_10)]",
    line: "oklch(0.6 0.2 10)",
  },
  Home: {
    dot: "bg-[color:var(--vortyx-cyan)]",
    chip: "border-[color:var(--vortyx-cyan)]/40 bg-[color:var(--vortyx-cyan)]/10 text-[color:var(--vortyx-cyan)]",
    line: "var(--vortyx-cyan)",
  },
};
