import type { NumberPool, NumberStatus, NumberType, TrackingNumber } from "@/lib/types";
import { MOCK_CAMPAIGNS } from "./campaigns";

const STATES = [
  { code: "TX", city: "Austin", area: 512 },
  { code: "CA", city: "Los Angeles", area: 213 },
  { code: "CA", city: "San Francisco", area: 415 },
  { code: "FL", city: "Miami", area: 305 },
  { code: "NY", city: "New York", area: 212 },
  { code: "PA", city: "Pittsburgh", area: 412 },
  { code: "IL", city: "Chicago", area: 312 },
  { code: "GA", city: "Atlanta", area: 404 },
  { code: "OH", city: "Cleveland", area: 216 },
  { code: "MI", city: "Detroit", area: 313 },
];

function pad(n: number, w = 4) {
  return n.toString().padStart(w, "0");
}

function num(area: number, i: number): string {
  const prefix = 200 + ((i * 31) % 700);
  const line = 1000 + ((i * 17) % 8999);
  // E.164 "+1XXXXXXXXXX" — single canonical format across the app.
  return `+1${area}${prefix}${line}`;
}

const TYPES: NumberType[] = ["local", "local", "local", "tollfree"];
const STATUSES: NumberStatus[] = ["active", "active", "active", "active", "paused", "pending"];

export const MOCK_NUMBERS: TrackingNumber[] = Array.from({ length: 36 }).map((_, i) => {
  const region = STATES[i % STATES.length];
  const type = TYPES[i % TYPES.length];
  const status = STATUSES[i % STATUSES.length];
  // Tollfree numbers get area code 800/888 instead of regional
  const area = type === "tollfree" ? (i % 2 === 0 ? 800 : 888) : region.area;
  // Some numbers are assigned to a campaign, some are unassigned
  const campaign = i % 5 !== 4 ? MOCK_CAMPAIGNS[i % MOCK_CAMPAIGNS.length] : undefined;
  const callsToday = status === "active" ? 4 + ((i * 13) % 60) : 0;
  return {
    id: `n_${pad(i + 1)}`,
    number: num(area, i + 1),
    type,
    status,
    campaignId: campaign?.id,
    campaignName: campaign?.name,
    state: type === "tollfree" ? undefined : region.code,
    city: type === "tollfree" ? undefined : region.city,
    monthlyCost: type === "tollfree" ? 5 : 2,
    callsToday,
    callsMonthly: callsToday * (10 + (i % 8)),
    conversionRate: status === "active" ? 0.3 + ((i % 7) * 0.07) : 0,
    provisionedAt: Date.now() - 1000 * 60 * 60 * 24 * (i + 1),
    lastCallAt: status === "active" ? Date.now() - 1000 * 60 * ((i * 7) % 240) : undefined,
  };
});

export const MOCK_POOLS: NumberPool[] = [
  {
    id: "pool_health_dynamic",
    name: "Health — Dynamic rotation",
    campaignId: MOCK_CAMPAIGNS[0].id,
    campaignName: MOCK_CAMPAIGNS[0].name,
    rotationStrategy: "weighted",
    numberCount: 24,
    callsToday: 87,
    active: true,
  },
  {
    id: "pool_solar_geo",
    name: "Solar — Geo-routed",
    campaignId: MOCK_CAMPAIGNS[1].id,
    campaignName: MOCK_CAMPAIGNS[1].name,
    rotationStrategy: "priority",
    numberCount: 18,
    callsToday: 42,
    active: true,
  },
  {
    id: "pool_legal_intake",
    name: "Legal — Intake desk",
    campaignId: MOCK_CAMPAIGNS[3].id,
    campaignName: MOCK_CAMPAIGNS[3].name,
    rotationStrategy: "round-robin",
    numberCount: 8,
    callsToday: 14,
    active: true,
  },
  {
    id: "pool_finance_q2",
    name: "Finance Q2 — Test",
    campaignId: MOCK_CAMPAIGNS[5].id,
    campaignName: MOCK_CAMPAIGNS[5].name,
    rotationStrategy: "round-robin",
    numberCount: 6,
    callsToday: 0,
    active: false,
  },
];
