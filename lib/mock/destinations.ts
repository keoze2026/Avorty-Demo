/**
 * MOCK_DESTINATIONS — one row per (buyer, TFN). Each entry models a single
 * dialing target with its own concurrency cap and daily/monthly caps.
 *
 * Active and capped buyers get 1–3 destinations each (real production
 * traffic). Paused / pending buyers get 1 each (configured but not routing).
 */

import type { Destination } from "@/lib/types";

/** Deterministic TFN generator so the SSR + hydration pass agree. */
function tfn(seed: number): string {
  const area = 200 + ((seed * 9301 + 49297) % 700);
  const prefix = 200 + ((seed * 13 + 17) % 700);
  const line = 1000 + ((seed * 31 + 7) % 8999);
  return `+1 (${area}) ${prefix}-${line}`;
}

export const MOCK_DESTINATIONS: Destination[] = [
  // Apex Insurance — 3 destinations
  { id: "dest_001", buyerId: "b_001", tfn: tfn(1), name: "Tier-1 Medicare", concurrencyCap: 10, dailyCap: 200, monthlyCap: 5_000, enabled: true },
  { id: "dest_002", buyerId: "b_001", tfn: tfn(2), name: "Tier-1 ACA", concurrencyCap: 10, dailyCap: 150, monthlyCap: 4_000, enabled: true },
  { id: "dest_003", buyerId: "b_001", tfn: tfn(3), name: "Backup Inbound", concurrencyCap: 5, dailyCap: 50, monthlyCap: 1_500, enabled: true },

  // Solar United — 2 destinations
  { id: "dest_004", buyerId: "b_002", tfn: tfn(4), name: "Solar Inbound", concurrencyCap: 8, dailyCap: 200, monthlyCap: 5_000, enabled: true },
  { id: "dest_005", buyerId: "b_002", tfn: tfn(5), name: "Solar West", concurrencyCap: 6, dailyCap: 100, monthlyCap: 2_500, enabled: true },

  // LawHelp Direct — 1 destination
  { id: "dest_006", buyerId: "b_003", tfn: tfn(6), name: "Mass Tort Intake", concurrencyCap: 10, dailyCap: 80, monthlyCap: 2_000, enabled: true },

  // AutoSafe Warranty — 2 destinations (buyer paused → enabled false)
  { id: "dest_007", buyerId: "b_004", tfn: tfn(7), name: "Auto Day Shift", concurrencyCap: 12, dailyCap: 200, monthlyCap: 5_000, enabled: false },
  { id: "dest_008", buyerId: "b_004", tfn: tfn(8), name: "Auto Night Shift", concurrencyCap: 8, dailyCap: 50, monthlyCap: 1_000, enabled: false },

  // Medi Connect — 3 destinations
  { id: "dest_009", buyerId: "b_005", tfn: tfn(9), name: "AEP Inbound", concurrencyCap: 15, dailyCap: 300, monthlyCap: 7_000, enabled: true },
  { id: "dest_010", buyerId: "b_005", tfn: tfn(10), name: "OEP Inbound", concurrencyCap: 10, dailyCap: 150, monthlyCap: 4_000, enabled: true },
  { id: "dest_011", buyerId: "b_005", tfn: tfn(11), name: "GenPop", concurrencyCap: 5, dailyCap: 50, monthlyCap: 1_000, enabled: true },

  // Home Pro Network — 2 destinations
  { id: "dest_012", buyerId: "b_006", tfn: tfn(12), name: "HVAC Leads", concurrencyCap: 6, dailyCap: 120, monthlyCap: 3_000, enabled: true },
  { id: "dest_013", buyerId: "b_006", tfn: tfn(13), name: "Roofing Leads", concurrencyCap: 6, dailyCap: 80, monthlyCap: 2_000, enabled: true },

  // Lendly Direct — 2 destinations
  { id: "dest_014", buyerId: "b_007", tfn: tfn(14), name: "Tier-1 Debt", concurrencyCap: 10, dailyCap: 150, monthlyCap: 4_000, enabled: true },
  { id: "dest_015", buyerId: "b_007", tfn: tfn(15), name: "Tier-2 Debt", concurrencyCap: 8, dailyCap: 80, monthlyCap: 2_000, enabled: true },

  // ClaimRight — 1 destination (pending buyer)
  { id: "dest_016", buyerId: "b_008", tfn: tfn(16), name: "Sandbox", concurrencyCap: 5, dailyCap: 50, monthlyCap: 1_500, enabled: false },
];

/** Destinations that the router will actually pick from. */
export const ROUTABLE_DESTINATIONS = MOCK_DESTINATIONS.filter((d) => d.enabled);
