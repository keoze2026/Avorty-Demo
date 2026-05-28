/**
 * Shared notification data + types — used by the topbar dropdown and the
 * dedicated /notifications page.
 */

export type NotificationSeverity = "critical" | "warn" | "info" | "insight";

export interface NotificationItem {
  id: string;
  severity: NotificationSeverity;
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

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    severity: "critical",
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
    title: "Acceptance dipped in OH / MI",
    body: "Auto Warranty acceptance is 14% over the past 48h vs 22% baseline.",
    time: "26m",
    source: "Auto Warranty",
    delta: -8.4,
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
