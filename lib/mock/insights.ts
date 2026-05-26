/** Mock fixtures for the AI Insights surface. */

import type {
  AiRecommendation,
  Anomaly,
  AutopilotRule,
  ChatSuggestion,
} from "@/lib/types";

const NOW = Date.now();
const MIN = 1000 * 60;
const HOUR = MIN * 60;

/** Quick LCG so series are stable across SSR / hydration. */
function rng(seed: number) {
  return ((seed * 9301 + 49297) % 233280) / 233280;
}
function series(seed: number, len: number, base: number, drift: number, jitter: number) {
  return Array.from({ length: len }).map((_, i) => {
    const trend = base + drift * i;
    const noise = (rng(seed + i) - 0.5) * jitter;
    return Math.round((trend + noise) * 100) / 100;
  });
}

export const MOCK_RECOMMENDATIONS: AiRecommendation[] = [
  {
    id: "rec_001",
    kind: "scale",
    title: "Scale Health Tier 1 publisher mix",
    body: "Conversion is up 24% over the last 6h. Three buyers have spare capacity.",
    rationale:
      "TrafficHub and ClickWave Media are both showing conversion above their 14-day baselines while Apex Insurance and Medi Connect have ~38% unused daily cap. Routing more traffic toward TrafficHub for Health Tier 1 is statistically dominated by your current weights.",
    scope: { type: "campaign", id: "c_health_001", name: "Health Insurance — Tier 1" },
    confidence: 0.92,
    impact: { label: "Projected revenue / day", value: "+$1,840", direction: "up" },
    baseline: series(11, 12, 38, 0.6, 6),
    projected: series(11, 12, 38, 1.6, 5).map((v, i) => v + i * 1.4),
    createdAt: NOW - MIN * 18,
    status: "open",
  },
  {
    id: "rec_002",
    kind: "pause",
    title: "Pause Auto Warranty in OH, MI",
    body: "Acceptance has dropped below 18% in those geos for the past 48h.",
    rationale:
      "AutoSafe Warranty is rejecting 82% of OH/MI calls while still being charged the bid. Pausing geo routing for these two states will free budget for higher-converting states.",
    scope: { type: "campaign", id: "c_auto_003", name: "Auto Warranty" },
    confidence: 0.86,
    impact: { label: "Save / day", value: "−$620", direction: "down" },
    baseline: series(12, 12, 22, -0.3, 4),
    projected: series(12, 12, 18, 0, 2),
    createdAt: NOW - MIN * 42,
    status: "open",
  },
  {
    id: "rec_003",
    kind: "rebalance",
    title: "Rebalance Solar to morning slots",
    body: "07:00–11:00 calls convert 2.3× higher than the overall average.",
    rationale:
      "Hour-of-day breakdown shows TX & FL morning windows converting at 71% vs the all-day average of 31%. Shifting weight via the existing weight-split node will compound across the next week.",
    scope: { type: "campaign", id: "c_solar_002", name: "Solar — Nationwide" },
    confidence: 0.78,
    impact: { label: "Conversion lift", value: "+11%", direction: "up" },
    baseline: series(13, 12, 31, 0.2, 3),
    projected: series(13, 12, 31, 0.9, 2).map((v, i) => v + (i > 5 ? i * 1.2 : 0)),
    createdAt: NOW - HOUR * 1.4,
    status: "open",
  },
  {
    id: "rec_004",
    kind: "alert",
    title: "Buyer Apex hit daily cap early",
    body: "Apex hit cap at 14:12 today vs the 18:30 historical median.",
    rationale:
      "Apex Insurance has been capping out earlier 4 days in a row. Daily cap is currently 400, but actual demand looks closer to 530. Consider raising the cap or adding a backup buyer.",
    scope: { type: "buyer", id: "b_001", name: "Apex Insurance" },
    confidence: 0.83,
    impact: { label: "Calls / day at risk", value: "32", direction: "up" },
    baseline: series(14, 12, 387, 1.2, 18),
    projected: series(14, 12, 420, 1.4, 18),
    createdAt: NOW - HOUR * 3,
    status: "open",
  },
  {
    id: "rec_005",
    kind: "optimize",
    title: "Tighten qualify duration on Legal Intake",
    body: "Raising the qualify-duration to 200s drops noise without hurting payouts.",
    rationale:
      "23% of completed Legal Intake calls last under 180 seconds, and 92% of those are later refunded by the buyer. Setting qualify-duration to 200 gates the noise out before payout.",
    scope: { type: "campaign", id: "c_legal_004", name: "Mass Tort — Injury Intake" },
    confidence: 0.81,
    impact: { label: "Refund-rate ↓", value: "−14%", direction: "down" },
    baseline: series(15, 12, 0.74, -0.002, 0.04),
    projected: series(15, 12, 0.84, 0.004, 0.03),
    createdAt: NOW - HOUR * 6,
    status: "open",
  },
  {
    id: "rec_006",
    kind: "scale",
    title: "Add a backup buyer for Finance Q2",
    body: "Single-buyer concentration is risky during Lendly's morning lulls.",
    rationale:
      "Lendly Direct accepts 96% of Finance Q2 traffic — but their 6am–9am acceptance dips to 62%, causing 14% of morning calls to drop unmatched. Adding ClaimRight as a fallback would absorb the lull without affecting Lendly's rate.",
    scope: { type: "campaign", id: "c_fin_006", name: "Debt Consolidation — Q2" },
    confidence: 0.74,
    impact: { label: "Match-rate ↑", value: "+8%", direction: "up" },
    baseline: series(16, 12, 0.62, 0, 0.06),
    projected: series(16, 12, 0.7, 0.005, 0.04),
    createdAt: NOW - HOUR * 11,
    status: "open",
  },
];

export const MOCK_ANOMALIES: Anomaly[] = [
  {
    id: "an_001",
    kind: "conversion-drop",
    severity: "critical",
    title: "Solar conversion dropped 32%",
    body: "Compared to the trailing 7-day average. Likely the new GeoFilter that landed at 12:04.",
    scope: { type: "campaign", id: "c_solar_002", name: "Solar Nationwide" },
    detectedAt: NOW - MIN * 14,
    delta: { metric: "Conversion", pct: -32 },
  },
  {
    id: "an_002",
    kind: "volume-spike",
    severity: "warning",
    title: "Publisher TrafficHub volume +62%",
    body: "Volume well above the 95th percentile. Verify campaign settings before celebrating.",
    scope: { type: "publisher", id: "p_001", name: "TrafficHub" },
    detectedAt: NOW - MIN * 22,
    delta: { metric: "Volume", pct: 62 },
  },
  {
    id: "an_003",
    kind: "latency-spike",
    severity: "warning",
    title: "Routing decision latency 218ms (p95)",
    body: "Up from 142ms last hour. Concentrated on the Health Tier 1 plan.",
    scope: { type: "network", name: "Network" },
    detectedAt: NOW - MIN * 38,
    delta: { metric: "p95 latency", pct: 53 },
  },
  {
    id: "an_004",
    kind: "cap-reached",
    severity: "info",
    title: "Apex hit daily cap (400)",
    body: "Routing currently bypasses Apex until 00:00 tomorrow.",
    scope: { type: "buyer", id: "b_001", name: "Apex Insurance" },
    detectedAt: NOW - HOUR * 0.7,
    delta: { metric: "Cap consumed", pct: 100 },
  },
  {
    id: "an_005",
    kind: "reject-rate",
    severity: "warning",
    title: "AutoSafe reject-rate 78% in OH",
    body: "Up from 41% last week. Likely buyer-side filter change.",
    scope: { type: "buyer", id: "b_004", name: "AutoSafe Warranty" },
    detectedAt: NOW - HOUR * 1.2,
    delta: { metric: "Rejects", pct: 90 },
  },
  {
    id: "an_006",
    kind: "geo-shift",
    severity: "info",
    title: "Health calls shifting to South",
    body: "TX & FL share of completed Health calls up 14 points week-over-week.",
    scope: { type: "campaign", id: "c_health_001", name: "Health Tier 1" },
    detectedAt: NOW - HOUR * 2.4,
    delta: { metric: "Geo share", pct: 14 },
  },
  {
    id: "an_007",
    kind: "conversion-drop",
    severity: "info",
    title: "Mass Tort intake conversion soft",
    body: "−6% vs trailing 7d — within normal weekly variance.",
    scope: { type: "campaign", id: "c_legal_004", name: "Mass Tort Intake" },
    detectedAt: NOW - HOUR * 4,
    delta: { metric: "Conversion", pct: -6 },
  },
  {
    id: "an_008",
    kind: "volume-spike",
    severity: "info",
    title: "Off-hours volume up 22%",
    body: "20:00–23:00 weekday calls trending up. Schedule may need to extend.",
    scope: { type: "network", name: "Network" },
    detectedAt: NOW - HOUR * 7,
    delta: { metric: "Off-hours volume", pct: 22 },
  },
];

export const MOCK_CHAT_SUGGESTIONS: ChatSuggestion[] = [
  { id: "qs_001", question: "What's my best campaign this week?", category: "performance" },
  { id: "qs_002", question: "Why did Solar conversion drop today?", category: "anomaly" },
  { id: "qs_003", question: "Forecast revenue for the next 7 days", category: "forecast" },
  { id: "qs_004", question: "Which publisher should I scale next?", category: "performance" },
  { id: "qs_005", question: "Show me buyers with capacity headroom", category: "performance" },
  { id: "qs_006", question: "Explain the latency spike at 14:00", category: "explain" },
];

/** Canned response for each suggestion category. */
export const CHAT_REPLIES: Record<ChatSuggestion["category"], string[]> = {
  performance: [
    "Health Insurance — Tier 1 leads the week with $13,260 revenue and a 62% conversion rate.",
    "Driven by **TrafficHub** (412 calls, 62% conv) and **DialSurge** (162 calls, 58% conv).",
    "Suggestion: shift +8% routing weight from ClickWave to TrafficHub — projected +$1,840/day.",
  ],
  anomaly: [
    "Solar conversion fell 32% starting at **12:04 today**.",
    "Cause: a GeoFilter node was published that excludes TX & FL — your two highest-converting states.",
    "Recommended fix: revert the Solar routing plan to v3, or re-enable TX/FL in the GeoFilter.",
  ],
  forecast: [
    "Next 7 days projected revenue: **$94,320 ± $4,180** (P50 estimate, 90% CI).",
    "Up 11% vs the prior 7-day window, driven by AEP-season Medicare traffic.",
    "Bottleneck: Apex Insurance daily cap hits limit ~4h before EoD — worth raising to 600.",
  ],
  explain: [
    "Latency spiked from **142ms → 218ms** at 14:00, concentrated on the Health Tier 1 routing plan.",
    "Probable cause: a new Cap-Check node added in the latest publish, with limit=400 (matches Apex).",
    "It now evaluates every call serially against three buyer caps. Reordering to put the cheapest checks first should restore latency.",
  ],
};

export const MOCK_AUTOPILOT_RULES: AutopilotRule[] = [
  {
    id: "ap_001",
    label: "Auto-pause failing geos",
    description: "If a state's acceptance < 20% over 24h, pause it on that campaign.",
    tone: "safe",
    enabled: true,
  },
  {
    id: "ap_002",
    label: "Auto-raise caps when capping early",
    description: "If a buyer caps 3+ days in a row before 16:00, raise their daily cap by 15%.",
    tone: "caution",
    enabled: true,
  },
  {
    id: "ap_003",
    label: "Auto-rebalance weight splits",
    description: "Reweight A/B splits toward the higher-converting branch nightly.",
    tone: "caution",
    enabled: false,
  },
  {
    id: "ap_004",
    label: "Auto-archive cold campaigns",
    description: "If a campaign has 0 calls for 14 days, archive it automatically.",
    tone: "safe",
    enabled: false,
  },
  {
    id: "ap_005",
    label: "Auto-bid on hot marketplace listings",
    description: "Place a bid up to your configured ceiling on listings with quality > 80%.",
    tone: "aggressive",
    enabled: false,
  },
];
