import type { Call, CallStatus } from "@/lib/types";
import { MOCK_CAMPAIGNS } from "./campaigns";

const STATUSES: CallStatus[] = ["completed", "completed", "completed", "in-progress", "missed", "rejected"];
const STATES = ["TX", "CA", "FL", "NY", "PA", "OH", "IL", "GA", "NC", "MI"];
const CITIES = ["Austin", "Los Angeles", "Miami", "Brooklyn", "Pittsburgh", "Cleveland", "Chicago", "Atlanta", "Charlotte", "Detroit"];

function pad(n: number, w = 3) {
  return n.toString().padStart(w, "0");
}

function randomNumber(seed: number) {
  // Deterministic-ish caller numbers for nicer logs
  const area = 200 + (seed * 31) % 700;
  const prefix = 200 + (seed * 17) % 700;
  const line = 1000 + (seed * 7) % 8999;
  return `+1 (${area}) ${prefix}-${line}`;
}

export const MOCK_CALLS: Call[] = Array.from({ length: 80 }).map((_, i) => {
  const campaign = MOCK_CAMPAIGNS[i % MOCK_CAMPAIGNS.length];
  const status = STATUSES[i % STATUSES.length];
  const duration = status === "missed" || status === "rejected" ? 0 : 30 + ((i * 13) % 540);
  const stateIdx = i % STATES.length;
  return {
    id: `call_${pad(i + 1, 4)}`,
    campaignId: campaign.id,
    campaignName: campaign.name,
    buyerId: status === "completed" ? `b_${pad((i % 6) + 1)}` : undefined,
    buyerName: status === "completed" ? `Buyer ${(i % 6) + 1}` : undefined,
    publisherId: `p_${pad((i % 4) + 1)}`,
    publisherName: `Publisher ${(i % 4) + 1}`,
    callerNumber: randomNumber(i + 1),
    destinationNumber: randomNumber(i + 100),
    startedAt: Date.now() - i * 1000 * 60 * 3,
    durationSec: duration,
    status,
    payout: status === "completed" ? campaign.payout : 0,
    revenue: status === "completed" ? campaign.payout * 1.18 : 0,
    geo: { country: "US", state: STATES[stateIdx], city: CITIES[stateIdx] },
  };
});
