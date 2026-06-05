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
// Sized so the topbar's "today" count lands at ~5,578 (45% × 12,400) and
// the chart silhouette matches the advertising reference exactly (181 at
// 8 AM ramp → 1,029 peak at 2 PM → 55 cliff at 6 PM). The live count
// (status = ringing | in-progress) sits around 460 (8.2% of today).
const TOTAL = 12_400;

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
 * Hourly call-volume CDF — drives the "Calls by hour" silhouette on the
 * dashboard and reports surfaces. Tuned so today's 3,016 calls render as
 * a clean business-hours bell curve:
 *
 *   • 12 AM – 7 AM : zero traffic
 *   • 8  AM        : ramp begins (~3%)
 *   • 9 – 11 AM    : steep morning climb
 *   • 12 PM        : slight lunch dip
 *   • 1 – 2 PM     : peak (~18% / 18.5%)
 *   • 3 – 4 PM     : afternoon plateau
 *   • 5 – 6 PM     : sharp cliff (~1%)
 *   • 7 PM – 11 PM : zero again
 *
 * Each entry is the cumulative probability that a call falls in or before
 * that hour; binary scan in `hourFor()` picks the right bucket per call.
 */
const HOUR_CDF: ReadonlyArray<{ hour: number; cum: number }> = [
  // Each cumulative value is calibrated against the advertising reference
  // (5,575 today's calls). Deltas reproduce 181 / 267 / 444 / 607 / 587 /
  // 961 / 1,029 / 697 / 688 / 59 / 55 from 8 AM through 6 PM exactly —
  // no traffic outside that window.
  { hour: 8,  cum: 0.0325 }, //  3.25%
  { hour: 9,  cum: 0.0804 }, //  4.79%
  { hour: 10, cum: 0.1600 }, //  7.96%
  { hour: 11, cum: 0.2688 }, // 10.88%
  { hour: 12, cum: 0.3741 }, // 10.52%  (lunch dip)
  { hour: 13, cum: 0.5464 }, // 17.23%
  { hour: 14, cum: 0.7310 }, // 18.45%  (peak hour)
  { hour: 15, cum: 0.8560 }, // 12.50%
  { hour: 16, cum: 0.9795 }, // 12.33%
  { hour: 17, cum: 0.9901 }, //  1.06%
  { hour: 18, cum: 1.0000 }, //  0.99%
];

function hourFor(r: number): number {
  for (const slot of HOUR_CDF) if (r < slot.cum) return slot.hour;
  return 18;
}

/**
 * Recency-weighted timestamp inside the last 30 days, biased toward
 * business hours (8 AM – 6 PM local, lunch peak) and toward recent days.
 */
function startedAt(seed: number): number {
  const r = rng(seed);
  // Day offset: heavily skewed toward the last 7 days
  let daysAgo: number;
  if (r < 0.45) daysAgo = Math.floor(rng(seed + 10) * 1);       // today
  else if (r < 0.75) daysAgo = 1 + Math.floor(rng(seed + 11) * 6); // 1–6 days
  else if (r < 0.92) daysAgo = 7 + Math.floor(rng(seed + 12) * 7); // 7–13 days
  else daysAgo = 14 + Math.floor(rng(seed + 13) * 16);             // 14–30 days

  const hour = hourFor(rng(seed + 14));
  const minute = Math.floor(rng(seed + 15) * 60);
  const second = Math.floor(rng(seed + 16) * 60);

  const d = new Date(NOW - daysAgo * DAY);
  d.setHours(hour, minute, second, 0);
  return d.getTime();
}

function statusFor(seed: number, daysOld: number): CallStatus {
  // Tuned so the dashboard headline tells a clean ad-ready story:
  //
  //   Today's calls (~3,016)
  //     ├─ live    : ~247  (8.2% — split 5% in-progress + 3.2% ringing)
  //     ├─ converted: ~2,458 (81.5%)
  //     ├─ missed   : ~211   (7%)
  //     └─ rejected/failed: ~100 (3.3%)
  //
  // Historical days follow the same conversion ramp but with no live calls.
  const r = rng(seed + 23);
  if (daysOld < 1) {
    if (r < 0.05) return "in-progress";
    if (r < 0.082) return "ringing";
    if (r < 0.897) return "completed";
    if (r < 0.967) return "missed";
    if (r < 0.987) return "rejected";
    return "failed";
  }
  // Historical (yesterday and earlier) — same conversion rate, no live calls.
  if (r < 0.815) return "completed";
  if (r < 0.935) return "missed";
  if (r < 0.97) return "rejected";
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
