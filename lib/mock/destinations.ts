/**
 * MOCK_DESTINATIONS — one row per (buyer, TFN). Each entry models a single
 * dialing target with its own concurrency cap and daily/monthly caps.
 *
 * The hand-crafted 16 entries cover the headline cases (per-buyer split,
 * paused vs active, pending sandbox). A programmatic block extends the list
 * to 100+ entries with a mix of local TFNs and toll-free (800/833/844/…)
 * numbers spread across the active buyer roster — large enough that the
 * Destinations table actually scrolls and the dashboard summary card has
 * material to surface.
 */

import type { Destination } from "@/lib/types";

/**
 * Deterministic TFN generator so SSR + hydration agree.
 * Emits E.164 ("+1XXXXXXXXXX") — same format the rest of the app expects.
 */
function tfn(seed: number): string {
  const area = 200 + ((seed * 9301 + 49297) % 700);
  const prefix = 200 + ((seed * 13 + 17) % 700);
  const line = 1000 + ((seed * 31 + 7) % 8999);
  return `+1${area}${prefix}${line}`;
}

/** Toll-free area-code pool. */
const TOLL_FREE_AREAS = [800, 833, 844, 855, 866, 877, 888] as const;

/** Deterministic toll-free generator. */
function tollFreeTfn(seed: number): string {
  const area = TOLL_FREE_AREAS[seed % TOLL_FREE_AREAS.length];
  const prefix = 200 + ((seed * 7 + 11) % 700);
  const line = 1000 + ((seed * 41 + 19) % 8999);
  return `+1${area}${prefix}${line}`;
}

const SEED: Destination[] = [
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

/* ─── Generated destinations ───────────────────────────────────────────
 * Per-buyer name pools, plus a mix of local + toll-free TFNs. The output
 * is deterministic (driven by seed index) so SSR and client hydration
 * agree, and so the same row always carries the same TFN across renders. */

interface BuyerProfile {
  id: string;
  /** True when the buyer's roster should default to enabled. False mirrors
   *  the paused/pending state in MOCK_BUYERS so the demo set stays coherent. */
  defaultEnabled: boolean;
  names: string[];
}

const BUYER_PROFILES: BuyerProfile[] = [
  {
    id: "b_001",
    defaultEnabled: true,
    names: [
      "Tier-2 Medicare", "Tier-2 ACA", "Medicare AEP East", "Medicare AEP West",
      "ACA Open Enrollment", "Medicare Supplement", "Part D Inbound",
      "Tier-1 ACA East", "Tier-1 ACA West", "Backup ACA",
      "Carrier Direct — UHC", "Carrier Direct — Humana", "Carrier Direct — Aetna",
      "Medicare South", "Medicare Northeast", "Tier-3 ACA",
    ],
  },
  {
    id: "b_002",
    defaultEnabled: true,
    names: [
      "Solar East", "Solar Midwest", "Solar Pacific", "Solar Southwest",
      "Solar Texas", "Solar Florida", "Solar California",
      "Roof-owner Verified", "Battery Storage", "Solar Backup",
      "Solar Arizona", "Solar Nevada", "Solar Colorado",
    ],
  },
  {
    id: "b_003",
    defaultEnabled: true,
    names: [
      "Camp Lejeune", "Roundup Plaintiff", "Talcum Powder",
      "Hair Relaxer Intake", "AFFF Firefighter", "Hernia Mesh",
      "Paragard IUD", "Zantac Plaintiff", "Mass Tort Backup",
      "3M Earplug", "Tylenol ADHD", "Suboxone Tooth Decay",
    ],
  },
  {
    id: "b_004",
    defaultEnabled: false,
    names: [
      "Auto Weekend", "Auto Backup", "Tier-2 Warranty",
      "Auto Day East", "Auto Day West", "Auto Night East", "Auto Night West",
      "VSC Direct", "Extended Warranty", "Pre-owned Warranty",
    ],
  },
  {
    id: "b_005",
    defaultEnabled: true,
    names: [
      "AEP East", "AEP Central", "AEP West",
      "OEP East", "OEP Central", "OEP West",
      "Dual Eligible", "C-SNP Inbound", "D-SNP Inbound",
      "Carrier Direct — Cigna", "Carrier Direct — Wellcare", "Backup Medi",
      "Medicare Advantage", "Special Needs Plan", "Medigap Direct",
    ],
  },
  {
    id: "b_006",
    defaultEnabled: true,
    names: [
      "Plumbing Leads", "Electrician Leads", "Solar Install",
      "Window Replacement", "Bath Remodel", "Kitchen Remodel",
      "Pest Control", "Lawn Care", "Garage Door",
      "Painting Leads", "Flooring Leads", "Gutter Cleaning",
    ],
  },
  {
    id: "b_007",
    defaultEnabled: true,
    names: [
      "Tier-3 Debt", "Debt Settlement", "Credit Counseling",
      "Tax Relief", "Student Loan", "Personal Loan",
      "Bankruptcy Intake", "Lendly Backup",
      "Mortgage Refinance", "HELOC Direct", "Reverse Mortgage",
    ],
  },
  {
    id: "b_008",
    defaultEnabled: false,
    names: ["Sandbox B", "Sandbox C", "Sandbox D", "Sandbox E"],
  },
];

const GENERATED: Destination[] = (() => {
  const out: Destination[] = [];
  let seed = 100;
  let serial = 17; // continues right after dest_016
  for (const buyer of BUYER_PROFILES) {
    for (const name of buyer.names) {
      // ~35% of generated entries get a toll-free number to reflect a
      // realistic mix between local DIDs and 800-class destinations.
      const isTollFree = seed % 3 === 0;
      const numberSeed = seed * 17 + 1;
      const number = isTollFree ? tollFreeTfn(numberSeed) : tfn(numberSeed);
      const concurrencyCap = 4 + (seed % 14); // 4..17
      const dailyCap = 50 + (seed % 7) * 50; // 50..350
      const monthlyCap = dailyCap * 25; // ~one month at daily cap
      // Sprinkle a few disabled destinations even on active buyers so the
      // table has both states to render.
      const enabled = buyer.defaultEnabled && seed % 11 !== 0;
      out.push({
        id: `dest_${String(serial).padStart(3, "0")}`,
        buyerId: buyer.id,
        tfn: number,
        name,
        concurrencyCap,
        dailyCap,
        monthlyCap,
        enabled,
      });
      seed += 1;
      serial += 1;
    }
  }
  return out;
})();

export const MOCK_DESTINATIONS: Destination[] = [...SEED, ...GENERATED];

/** Destinations that the router will actually pick from. */
export const ROUTABLE_DESTINATIONS = MOCK_DESTINATIONS.filter((d) => d.enabled);
