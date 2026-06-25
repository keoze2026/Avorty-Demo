/**
 * Call CDR generator + analytics fixtures.
 *
 * `generateCalls(count)` produces wire-shape call records spread across
 * the trailing N days. Hourly distribution follows a realistic business-
 * hours bell curve (peak 11am–4pm local) so the dashboard charts look
 * convincing. Numbers are stable across reloads via a fixed-seed RNG.
 */

import { makeRng, pick, intRange, range, chance } from "../rng";

const NOW = Date.now();
const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;

const AREA_CODES = ["212", "415", "713", "404", "305", "303", "617", "773", "602", "206", "619", "512", "214", "503", "702", "615", "904", "210", "480", "813"];
const STATES = ["TX", "CA", "FL", "NY", "PA", "OH", "IL", "GA", "NC", "MI", "WA", "AZ", "MA", "VA", "NJ", "CO"];
const COUNTRIES = ["US"];

const CAMPAIGN_REFS = [
  { id: "c_health_001", name: "Medicare Open Enrollment 2026", payout: 65 },
  { id: "c_health_002", name: "ACA Subsidy Verification", payout: 55 },
  { id: "c_auto_001", name: "Auto Insurance — High Intent", payout: 42 },
  { id: "c_home_001", name: "Roofing Storm Damage", payout: 92 },
  { id: "c_home_002", name: "HVAC Installation Leads", payout: 75 },
  { id: "c_solar_001", name: "Solar — Homeowner 700+ FICO", payout: 110 },
  { id: "c_legal_001", name: "Mass Tort Intake — Talc", payout: 320 },
  { id: "c_legal_002", name: "Personal Injury Auto", payout: 180 },
  { id: "c_fin_001", name: "Debt Relief Consultation", payout: 58 },
];

const BUYER_REFS = [
  { id: "b_apex", name: "Apex Insurance Group" },
  { id: "b_solar_united", name: "Solar United" },
  { id: "b_pinnacle_legal", name: "Pinnacle Legal Partners" },
  { id: "b_meridian_auto", name: "Meridian Auto Insurance" },
  { id: "b_hearthside", name: "Hearthside Roofing Network" },
  { id: "b_clearpath_debt", name: "Clearpath Debt Solutions" },
  { id: "b_lighthouse_aca", name: "Lighthouse ACA Verification" },
];

const PUBLISHER_REFS = [
  { id: "p_redline", name: "Redline Media Group" },
  { id: "p_blueprint", name: "Blueprint Lead Network" },
  { id: "p_apex_dial", name: "Apex Dialer Partners" },
  { id: "p_summit_traffic", name: "Summit Traffic Inc." },
  { id: "p_northstar", name: "Northstar Digital" },
];

const STATUSES = ["completed", "completed", "completed", "completed", "missed", "rejected", "failed"] as const;

/** Probability a call lands at hour h (0-23). Business-hours bell. */
const HOUR_WEIGHTS = [
  0.005, 0.003, 0.002, 0.002, 0.004, 0.008,
  0.020, 0.040, 0.060, 0.085, 0.105, 0.110,
  0.105, 0.100, 0.095, 0.080, 0.060, 0.045,
  0.030, 0.018, 0.012, 0.008, 0.006, 0.005,
];

function pickHourOffset(rng: () => number): number {
  let r = rng();
  for (let h = 0; h < 24; h++) {
    r -= HOUR_WEIGHTS[h];
    if (r <= 0) return h;
  }
  return 12;
}

function makePhone(rng: () => number): string {
  const ac = pick(AREA_CODES, rng);
  const tail = String(intRange(rng, 1_000_000, 9_999_999)).padStart(7, "0");
  return `+1${ac}${tail}`;
}

export interface DemoCallWire {
  id: string;
  caller_number: string;
  destination_number: string;
  status: string;
  duration: number;
  caller_area_code: string;
  caller_state: string;
  caller_country: string;
  campaign_id: string;
  campaign_name: string;
  buyer_id: string;
  buyer_name: string;
  publisher_id: string;
  publisher_name: string;
  revenue: string;
  buyer_payout: string;
  publisher_payout: string;
  recording_url: string;
  created_at: string;
  tags: string[];
  notes: string;
}

/** Generate `count` call records spread across the last `days` days. */
export function generateCalls(count: number, days = 14, seed = 42): DemoCallWire[] {
  const rng = makeRng(seed);
  const rows: DemoCallWire[] = [];
  for (let i = 0; i < count; i++) {
    const dayOffset = intRange(rng, 0, days - 1);
    const hour = pickHourOffset(rng);
    const minute = intRange(rng, 0, 59);
    const second = intRange(rng, 0, 59);
    const startedAt = NOW - dayOffset * DAY - (23 - hour) * HOUR + minute * 60_000 + second * 1000;
    const camp = pick(CAMPAIGN_REFS, rng);
    const buyer = pick(BUYER_REFS, rng);
    const publisher = pick(PUBLISHER_REFS, rng);
    const status = pick(STATUSES, rng);
    const duration = status === "completed" ? intRange(rng, 45, 720) : intRange(rng, 2, 28);
    const isConverted = status === "completed" && chance(rng, 0.62);
    const revenue = isConverted ? camp.payout : 0;
    const buyerPayout = isConverted ? camp.payout : 0;
    const publisherPayout = isConverted ? Math.round(camp.payout * 0.6) : 0;
    const areaCode = pick(AREA_CODES, rng);
    const state = pick(STATES, rng);

    rows.push({
      id: `call_demo_${i.toString(36)}_${seed}`,
      caller_number: makePhone(rng),
      destination_number: `+1800${String(intRange(rng, 5_550_000, 5_559_999))}`,
      status,
      duration,
      caller_area_code: areaCode,
      caller_state: state,
      caller_country: pick(COUNTRIES, rng),
      campaign_id: camp.id,
      campaign_name: camp.name,
      buyer_id: buyer.id,
      buyer_name: buyer.name,
      publisher_id: publisher.id,
      publisher_name: publisher.name,
      revenue: revenue.toFixed(2),
      buyer_payout: buyerPayout.toFixed(2),
      publisher_payout: publisherPayout.toFixed(2),
      recording_url: isConverted ? `https://demo.avortyx.io/rec/${i}.mp3` : "",
      created_at: new Date(startedAt).toISOString(),
      tags: isConverted ? ["converted"] : [],
      notes: "",
    });
  }
  return rows.sort(
    (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at),
  );
}

/* ─── Live-monitor snapshot (calls currently in flight) ────────────── */

export function generateLiveCalls(count = 6): DemoCallWire[] {
  const rng = makeRng(7);
  const rows: DemoCallWire[] = [];
  const liveStatuses = ["ringing", "in-progress"];
  for (let i = 0; i < count; i++) {
    const startedAt = NOW - intRange(rng, 5, 220) * 1000;
    const camp = pick(CAMPAIGN_REFS, rng);
    const buyer = pick(BUYER_REFS, rng);
    const publisher = pick(PUBLISHER_REFS, rng);
    rows.push({
      id: `live_demo_${i.toString(36)}`,
      caller_number: makePhone(rng),
      destination_number: `+1800${String(intRange(rng, 5_550_000, 5_559_999))}`,
      status: pick(liveStatuses, rng),
      duration: Math.floor((NOW - startedAt) / 1000),
      caller_area_code: pick(AREA_CODES, rng),
      caller_state: pick(STATES, rng),
      caller_country: "US",
      campaign_id: camp.id,
      campaign_name: camp.name,
      buyer_id: buyer.id,
      buyer_name: buyer.name,
      publisher_id: publisher.id,
      publisher_name: publisher.name,
      revenue: "0.00",
      buyer_payout: "0.00",
      publisher_payout: "0.00",
      recording_url: "",
      created_at: new Date(startedAt).toISOString(),
      tags: [],
      notes: "",
    });
  }
  return rows;
}

/* ─── Dashboard KPI snapshot ──────────────────────────────────────── */

export function dashboardSnapshot() {
  // Derived from a 14-day window of ~16k calls so the numbers stay coherent
  // with whatever the chart components compute client-side.
  return {
    total_calls: 1_204,
    total_revenue: 48_320.5,
    avg_call_duration: 248,
    conversion_rate: 0.31,
    total_completed: 894,
    total_missed: 218,
    total_rejected: 92,
  };
}
