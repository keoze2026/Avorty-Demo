/**
 * MOCK_CALLS — deterministic call-detail-record fixtures.
 *
 * ~500 records spread over the last 30 days, weighted toward business hours
 * and recent days. Linked to the existing campaign / buyer / publisher fixtures
 * so cross-cutting analytics (leaderboards, funnels) line up with the rest
 * of the demo state.
 */

import type { Call, CallStatus } from "@/lib/types";
import { MOCK_BUYERS } from "./buyers";
import { MOCK_CAMPAIGNS } from "./campaigns";
import { ROUTABLE_DESTINATIONS } from "./destinations";
import { MOCK_PUBLISHERS } from "./publishers";

const STATES = [
  { code: "TX", city: "Austin" },
  { code: "CA", city: "Los Angeles" },
  { code: "FL", city: "Miami" },
  { code: "NY", city: "Brooklyn" },
  { code: "PA", city: "Pittsburgh" },
  { code: "OH", city: "Cleveland" },
  { code: "IL", city: "Chicago" },
  { code: "GA", city: "Atlanta" },
  { code: "NC", city: "Charlotte" },
  { code: "MI", city: "Detroit" },
] as const;

const TAG_OPTIONS = ["facebook", "google", "organic", "tiktok", "radio", "email"] as const;

const DAY = 1000 * 60 * 60 * 24;
const NOW = Date.now();
// Sized so the topbar's "today" count lands at ~3K and the "live" count
// (status = ringing | in-progress) sits in the low hundreds — matches the
// scale the operator expects from a real production tape.
const TOTAL = 6700;

/** Tiny LCG so the fixtures are stable across SSR / hydration. */
function rng(seed: number) {
  return ((seed * 9301 + 49297) % 233280) / 233280;
}

function pad(n: number, w = 4) {
  return n.toString().padStart(w, "0");
}

function fmtNumber(seed: number) {
  const area = 200 + Math.floor(rng(seed) * 700);
  const prefix = 200 + Math.floor(rng(seed + 1) * 700);
  const line = 1000 + Math.floor(rng(seed + 2) * 8999);
  // E.164 ("+1XXXXXXXXXX") — single canonical format across the app.
  return `+1${area}${prefix}${line}`;
}

/**
 * Recency-weighted timestamp inside the last 30 days, biased toward
 * business hours (8:00–20:00 local) and toward recent days.
 */
function startedAt(seed: number): number {
  const r = rng(seed);
  // Day offset: heavily skewed toward the last 7 days
  let daysAgo: number;
  if (r < 0.45) daysAgo = Math.floor(rng(seed + 10) * 1);       // today
  else if (r < 0.75) daysAgo = 1 + Math.floor(rng(seed + 11) * 6); // 1–6 days
  else if (r < 0.92) daysAgo = 7 + Math.floor(rng(seed + 12) * 7); // 7–13 days
  else daysAgo = 14 + Math.floor(rng(seed + 13) * 16);             // 14–30 days

  // Hour within the day — bell-shape-ish around mid-day
  const hour = 8 + Math.floor(rng(seed + 14) * 13); // 8–20
  const minute = Math.floor(rng(seed + 15) * 60);
  const second = Math.floor(rng(seed + 16) * 60);

  const d = new Date(NOW - daysAgo * DAY);
  d.setHours(hour, minute, second, 0);
  return d.getTime();
}

function statusFor(seed: number, daysOld: number): CallStatus {
  // Mostly completed; some misses/rejects; a few are actively in-flight
  // (only for very recent calls). The "live" thresholds are tighter than the
  // outcome thresholds so that scaling TOTAL doesn't blow the live count out
  // of proportion — Live should stay in the low hundreds even at 6.7K total.
  const r = rng(seed + 23);
  if (daysOld < 0.01 && r < 0.02) return "in-progress";
  if (daysOld < 0.01 && r < 0.03) return "ringing";
  if (r < 0.62) return "completed";
  if (r < 0.78) return "missed";
  if (r < 0.9) return "rejected";
  return "failed";
}

export const MOCK_CALLS: Call[] = Array.from({ length: TOTAL }).map((_, i): Call => {
  const seed = i * 17 + 3;
  const ts = startedAt(seed);
  const daysOld = (NOW - ts) / DAY;
  const campaign = MOCK_CAMPAIGNS[i % MOCK_CAMPAIGNS.length];
  const publisher = MOCK_PUBLISHERS[i % MOCK_PUBLISHERS.length];
  const state = STATES[i % STATES.length];
  const status = statusFor(seed, daysOld);

  // Pick a routable destination. The destination's buyer is the call's buyer
  // when the call completes — keeps destination/buyer/payout coherent.
  const destination = ROUTABLE_DESTINATIONS[i % ROUTABLE_DESTINATIONS.length];
  const destBuyer = MOCK_BUYERS.find((b) => b.id === destination.buyerId);

  const baseDuration =
    status === "in-progress"
      ? 5 + Math.floor(rng(seed + 30) * 60)
      : status === "ringing"
        ? Math.floor(rng(seed + 30) * 6)
        : status === "missed" || status === "rejected" || status === "failed"
          ? 0
          : 60 + Math.floor(rng(seed + 30) * 600);

  // Buyer is only attached for completed calls (the only path that pays).
  const buyer = status === "completed" ? destBuyer : undefined;

  const payout = status === "completed" ? campaign.payout : 0;
  const revenue = status === "completed" ? payout * 1.18 : 0;

  const tagPick = rng(seed + 40) < 0.7 ? TAG_OPTIONS[Math.floor(rng(seed + 41) * TAG_OPTIONS.length)] : undefined;

  return {
    id: `call_${pad(i + 1, 4)}`,
    campaignId: campaign.id,
    campaignName: campaign.name,
    buyerId: buyer?.id,
    buyerName: buyer?.name,
    publisherId: publisher.id,
    publisherName: publisher.name,
    callerNumber: fmtNumber(seed + 50),
    destinationNumber: destination.tfn,
    startedAt: ts,
    durationSec: baseDuration,
    status,
    payout,
    revenue,
    geo: { country: "US", state: state.code, city: state.city },
    ...(tagPick && { recordingUrl: undefined }), // placeholder for tag wiring later
  };
});

// Sort so the most recent calls are first — simplifies the call-log default view.
MOCK_CALLS.sort((a, b) => b.startedAt - a.startedAt);
