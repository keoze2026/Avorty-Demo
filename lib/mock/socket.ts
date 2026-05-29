/**
 * Mock real-time event source.
 * Emits CallEvents on an interval so the UI can render a live feed without a real backend.
 * Swap for a Socket.IO / WebSocket client by replacing this file's exports.
 */

"use client";

import type { Call, CallEvent, CallStatus } from "@/lib/types";
import { MOCK_CAMPAIGNS } from "./campaigns";

const STATES = ["TX", "CA", "FL", "NY", "PA", "OH", "IL", "GA"];
const CITIES = ["Austin", "Los Angeles", "Miami", "Brooklyn", "Pittsburgh", "Cleveland", "Chicago", "Atlanta"];
const PROGRESSION: CallStatus[] = ["in-progress", "in-progress", "completed", "completed", "missed"];

function rng(seed: number) {
  return ((seed * 9301 + 49297) % 233280) / 233280;
}

let counter = 0;

function generateCall(): Call {
  counter += 1;
  const campaign = MOCK_CAMPAIGNS[counter % MOCK_CAMPAIGNS.length];
  const stateIdx = counter % STATES.length;
  return {
    id: `live_${counter}_${Date.now().toString(36)}`,
    campaignId: campaign.id,
    campaignName: campaign.name,
    publisherId: `p_${(counter % 4) + 1}`,
    publisherName: `Publisher ${(counter % 4) + 1}`,
    // E.164 ("+1XXXXXXXXXX") to match the rest of the app.
    callerNumber: `+1${200 + Math.floor(rng(counter) * 700)}${200 + Math.floor(rng(counter + 1) * 700)}${1000 + Math.floor(rng(counter + 2) * 8999)}`,
    destinationNumber: `+1${200 + Math.floor(rng(counter + 3) * 700)}${200 + Math.floor(rng(counter + 4) * 700)}${1000 + Math.floor(rng(counter + 5) * 8999)}`,
    startedAt: Date.now(),
    durationSec: 0,
    status: "ringing",
    payout: 0,
    revenue: 0,
    geo: { country: "US", state: STATES[stateIdx], city: CITIES[stateIdx] },
  };
}

export type Unsubscribe = () => void;

/**
 * Subscribe to a live stream of call events.
 * @param handler called for every emitted event
 * @param intervalMs how often new "incoming" calls are emitted
 */
export function subscribeToCallStream(
  handler: (event: CallEvent) => void,
  intervalMs = 2500,
): Unsubscribe {
  const inFlight: Call[] = [];

  const tick = setInterval(() => {
    // Emit a new call ~every intervalMs
    const call = generateCall();
    inFlight.push(call);
    handler({ kind: "call:incoming", call });

    // Progress / complete existing
    for (let i = inFlight.length - 1; i >= 0; i--) {
      const c = inFlight[i];
      c.durationSec += 1 + Math.floor(rng(counter + i) * 3);
      if (c.durationSec > 6 + Math.floor(rng(counter + i) * 20)) {
        const finalStatus = PROGRESSION[Math.floor(rng(counter + i + 7) * PROGRESSION.length)];
        const campaign = MOCK_CAMPAIGNS.find((m) => m.id === c.campaignId)!;
        const payout = finalStatus === "completed" ? campaign.payout : 0;
        const revenue = finalStatus === "completed" ? campaign.payout * 1.18 : 0;
        handler({ kind: "call:completed", id: c.id, durationSec: c.durationSec, payout, revenue });
        inFlight.splice(i, 1);
      } else {
        handler({ kind: "call:progress", id: c.id, durationSec: c.durationSec, status: "in-progress" });
      }
    }
  }, intervalMs);

  return () => clearInterval(tick);
}
