/**
 * AI Insights fixtures — daily briefing, recommendations, anomalies,
 * autopilot config. All wire-shape (snake_case).
 */

const NOW = Date.now();
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export function seedAiBriefing() {
  return {
    headline: "Revenue is pacing 18% ahead of last week",
    summary:
      "Medicare Open Enrollment is driving 42% of today's revenue. Solar conversion is up 6 points after the FICO 700+ gate rolled out. Two campaigns are nearing daily cap.",
    generated_at: new Date(NOW).toISOString(),
    highlights: [
      { kind: "positive", label: "Medicare Open Enrollment 2026", value: "+$12,410 today", delta: 0.42 },
      { kind: "positive", label: "Solar — Homeowner 700+ FICO", value: "Conversion 22% → 28%", delta: 0.06 },
      { kind: "warning", label: "Auto Insurance — High Intent", value: "Approaching 80% of daily cap", delta: 0.8 },
      { kind: "negative", label: "Cruise Cancellation Refund", value: "Spend dropped 64%", delta: -0.64 },
    ],
  };
}

export function seedRecommendations() {
  return [
    {
      id: "rec_demo_1",
      title: "Raise bid floor on Medicare campaign",
      summary:
        "Average winning bid is $48 versus your floor of $35. Lift the floor to $42 to capture an estimated $4,800/day in additional margin.",
      confidence: 0.86,
      category: "pricing",
      impact_estimate_usd: 4_820,
      before: { metric: "Avg margin / call", value: 18.4 },
      after: { metric: "Avg margin / call", value: 24.6 },
      created_at: new Date(NOW - 2 * HOUR).toISOString(),
      status: "open",
      campaign_id: "c_health_001",
      campaign_name: "Medicare Open Enrollment 2026",
    },
    {
      id: "rec_demo_2",
      title: "Pause Cruise Cancellation Refund",
      summary:
        "Conversion rate dropped from 19% to 6% over the last 72 hours. Pause to avoid further loss while the buyer reviews intent.",
      confidence: 0.74,
      category: "risk",
      impact_estimate_usd: 1_240,
      before: { metric: "Conversion", value: 0.19 },
      after: { metric: "Conversion", value: 0.06 },
      created_at: new Date(NOW - 5 * HOUR).toISOString(),
      status: "open",
      campaign_id: "c_travel_001",
      campaign_name: "Cruise Cancellation Refund",
    },
    {
      id: "rec_demo_3",
      title: "Add 'TX' to Roofing geo allowlist",
      summary:
        "Texas storm activity is up 38% this week. Hearthside Roofing has spare capacity and a 41% conversion in TX historically.",
      confidence: 0.79,
      category: "geo",
      impact_estimate_usd: 3_410,
      before: { metric: "Daily revenue", value: 7_640 },
      after: { metric: "Daily revenue", value: 11_050 },
      created_at: new Date(NOW - 14 * HOUR).toISOString(),
      status: "open",
      campaign_id: "c_home_001",
      campaign_name: "Roofing Storm Damage",
    },
    {
      id: "rec_demo_4",
      title: "Reroute Solar overflow to Lighthouse",
      summary:
        "Solar United has been hitting concurrency cap for 11 of the last 14 days. Lighthouse will accept overflow at 90% payout.",
      confidence: 0.68,
      category: "routing",
      impact_estimate_usd: 2_180,
      before: { metric: "Calls dropped", value: 84 },
      after: { metric: "Calls dropped", value: 12 },
      created_at: new Date(NOW - 22 * HOUR).toISOString(),
      status: "applied",
      campaign_id: "c_solar_001",
      campaign_name: "Solar — Homeowner 700+ FICO",
    },
    {
      id: "rec_demo_5",
      title: "Tighten TCPA window from 90 → 30 days",
      summary:
        "Carrier complaints are trending up. A 30-day consent window would reduce risk while only excluding 2.1% of inbound.",
      confidence: 0.81,
      category: "compliance",
      impact_estimate_usd: 940,
      before: { metric: "Complaint rate", value: 0.014 },
      after: { metric: "Complaint rate", value: 0.006 },
      created_at: new Date(NOW - 1 * DAY).toISOString(),
      status: "open",
      campaign_id: null,
      campaign_name: null,
    },
  ];
}

export function seedAnomalies() {
  return [
    {
      id: "anom_demo_1",
      severity: "high",
      title: "Spike in rejected calls — Apex Insurance",
      description: "Reject rate jumped from 6% to 28% in the last hour on b_apex.",
      detected_at: new Date(NOW - 18 * 60 * 1000).toISOString(),
      campaign_id: "c_health_001",
      buyer_id: "b_apex",
      metric: "reject_rate",
      observed: 0.28,
      expected: 0.06,
    },
    {
      id: "anom_demo_2",
      severity: "medium",
      title: "Latency drift on Pinnacle Legal endpoint",
      description: "Average ping latency 412ms → 1,840ms over the last 30 minutes.",
      detected_at: new Date(NOW - 32 * 60 * 1000).toISOString(),
      campaign_id: "c_legal_001",
      buyer_id: "b_pinnacle_legal",
      metric: "endpoint_latency_ms",
      observed: 1_840,
      expected: 412,
    },
    {
      id: "anom_demo_3",
      severity: "low",
      title: "Off-hours surge — Solar campaign",
      description: "Inbound at 02:00 ET is 4× the typical baseline.",
      detected_at: new Date(NOW - 2 * HOUR).toISOString(),
      campaign_id: "c_solar_001",
      buyer_id: null,
      metric: "calls_per_hour",
      observed: 42,
      expected: 10,
    },
  ];
}

export function seedAutopilotConfig() {
  return {
    enabled: false,
    mode: "advisory",
    auto_pause_on_anomaly: true,
    auto_adjust_bid_floor: false,
    auto_reroute_overflow: true,
    daily_change_budget_usd: 500,
    last_action_at: new Date(NOW - 6 * HOUR).toISOString(),
  };
}
