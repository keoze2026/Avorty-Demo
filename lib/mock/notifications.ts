/**
 * Shared notification data + types — used by the topbar dropdown and the
 * dedicated /notifications page.
 */

export type NotificationSeverity = "critical" | "warn" | "info" | "insight";

/**
 * Fine-grained alert taxonomy used by the Alerts sub-filter chips. Only set
 * on alert-level severities (`critical` / `warn`); insight + info ignore it.
 */
export type AlertKind = "missed" | "cap-over" | "low-aht" | "other";

export interface NotificationItem {
  id: string;
  severity: NotificationSeverity;
  /** Sub-classification — drives the Missed / Cap over / Low AHT filter. */
  alertKind?: AlertKind;
  title: string;
  body: string;
  /** Already-formatted relative time, e.g. "11m". */
  time: string;
  /** Optional KPI delta (% change) shown as a chip. */
  delta?: number;
  /** Optional action label rendered as a chip button. */
  action?: string;
  /** Mark as already read. */
  read?: boolean;
  /** Source label (campaign, buyer, etc.). */
  source?: string;
}

export const SEVERITY_DOT: Record<NotificationSeverity, string> = {
  critical: "bg-destructive",
  warn: "bg-[color:var(--warning)]",
  info: "bg-accent",
  insight: "bg-[oklch(0.7_0.2_290)]",
};

/**
 * Color tokens for the three alert sub-categories. Picked to be visually
 * distinct so a glance at the dot tells you the alert type.
 */
export const ALERT_KIND_DOT: Record<AlertKind, string> = {
  missed: "bg-[#EF4444]",      // red — missed calls are urgent
  "cap-over": "bg-[#F97316]",  // orange — cap reached / over
  "low-aht": "bg-[#FACC15]",   // yellow — low AHT warning
  other: "bg-muted-foreground",
};

export const ALERT_KIND_TEXT: Record<AlertKind, string> = {
  missed: "text-[#EF4444]",
  "cap-over": "text-[#F97316]",
  "low-aht": "text-[#FACC15]",
  other: "text-muted-foreground",
};

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    severity: "critical",
    alertKind: "cap-over",
    title: "Buyer Apex hit daily cap",
    body: "Routing temporarily paused. 14 calls re-routed to fallback Tier-2.",
    time: "11m",
    source: "Apex Solutions",
    delta: -32,
    action: "Raise cap",
  },
  {
    id: "n2",
    severity: "warn",
    alertKind: "low-aht",
    title: "Acceptance dipped in OH / MI",
    body: "Auto Warranty acceptance is 14% over the past 48h vs 22% baseline.",
    time: "26m",
    source: "Auto Warranty",
    delta: -8.4,
    action: "Investigate",
  },
  {
    id: "n_missed_1",
    severity: "critical",
    alertKind: "missed",
    title: "12 missed calls in the last hour",
    body: "Solar Nationwide dropped 12 calls between 14:00–15:00. Likely a destination outage.",
    time: "5m",
    source: "Solar Nationwide",
    delta: -18,
    action: "View calls",
  },
  {
    id: "n_missed_2",
    severity: "warn",
    alertKind: "missed",
    title: "Mass Tort missed 4 calls",
    body: "All 4 hit the queue but no destination answered within 30s. Worth checking buyer caps.",
    time: "42m",
    source: "Mass Tort — Injury",
    delta: -6,
    action: "Investigate",
  },
  {
    id: "n_cap_2",
    severity: "warn",
    alertKind: "cap-over",
    title: "TFN +1 (212) 555-0184 hit hourly cap",
    body: "60 calls in the last hour — hourly cap is 50. Excess routed to fallback.",
    time: "18m",
    source: "Health Tier 1",
    delta: 20,
    action: "Raise cap",
  },
  {
    id: "n_aht_2",
    severity: "warn",
    alertKind: "low-aht",
    title: "Auto Warranty AHT dropped to 38s",
    body: "Average handle time on the last 10 calls is under the 60s qualified threshold.",
    time: "12m",
    source: "Auto Warranty",
    delta: -22,
    action: "Investigate",
  },
  {
    id: "n3",
    severity: "info",
    title: "Health Tier 1 spiked 24%",
    body: "Conversion is trending up over the last hour — 3 publishers contributing.",
    time: "2m",
    source: "Health Tier 1",
    delta: 24,
    action: "Scale up",
  },
  {
    id: "n4",
    severity: "insight",
    title: "AI suggests retiring 3 numbers",
    body: "Low conversion across the last 7 days — 0.3% vs network 4.1%.",
    time: "1h",
    source: "AI Insights",
    action: "Review",
  },
  {
    id: "n5",
    severity: "info",
    title: "Webhook latency normalized",
    body: "Buyer Apex webhook P95 returned to 142ms after 4h spike.",
    time: "2h",
    source: "System",
    read: true,
  },
  {
    id: "n6",
    severity: "warn",
    title: "Card expires in 9 days",
    body: "Update the primary payment method to avoid an auto-suspend.",
    time: "5h",
    source: "Billing",
    action: "Update card",
  },
  {
    id: "n7",
    severity: "insight",
    title: "Best-performing publisher this week",
    body: "TrafficHub drove +42% qualified calls vs last week — consider raising their cap.",
    time: "8h",
    source: "TrafficHub",
    delta: 42,
    action: "Review",
  },
  {
    id: "n8",
    severity: "info",
    title: "Daily report ready",
    body: "Yesterday's network summary is available — $24.3K revenue across 4,812 calls.",
    time: "1d",
    source: "Reports",
    read: true,
  },
  {
    id: "n9",
    severity: "critical",
    alertKind: "other",
    title: "Webhook failed for ApexSolutions",
    body: "3 deliveries failed in the last 5 minutes — endpoint returning 502.",
    time: "1d",
    source: "Apex Solutions",
    action: "View logs",
    read: true,
  },
  {
    id: "n10",
    severity: "info",
    title: "New buyer onboarded",
    body: "PayPerHero completed verification and is now active in the marketplace.",
    time: "2d",
    source: "PayPerHero",
    read: true,
  },
];
