import type {
  IntegrationApp,
  IntegrationCategory,
  Webhook,
  WebhookDelivery,
} from "@/lib/types";

const DAY = 1000 * 60 * 60 * 24;
const HOUR = 1000 * 60 * 60;
const MIN = 1000 * 60;
const NOW = Date.now();

export const INTEGRATION_CATEGORIES: { key: IntegrationCategory; label: string }[] = [
  { key: "crm", label: "CRM" },
  { key: "telephony", label: "Telephony" },
  { key: "analytics", label: "Analytics" },
  { key: "communication", label: "Communication" },
  { key: "data", label: "Data warehouse" },
  { key: "automation", label: "Automation" },
];

export const MOCK_INTEGRATIONS: IntegrationApp[] = [
  // Connected (4)
  {
    id: "hubspot",
    name: "HubSpot",
    description: "Sync qualified calls as deals + contacts.",
    category: "crm",
    color: "#FF7A59",
    mark: "Hs",
    connected: true,
    connectedAt: NOW - DAY * 142,
  },
  {
    id: "twilio",
    name: "Twilio",
    description: "Carrier-level call setup and SMS verification.",
    category: "telephony",
    color: "#F22F46",
    mark: "Tw",
    connected: true,
    connectedAt: NOW - DAY * 220,
  },
  {
    id: "slack",
    name: "Slack",
    description: "Operator alerts in your team channels.",
    category: "communication",
    color: "#4A154B",
    mark: "Sl",
    connected: true,
    connectedAt: NOW - DAY * 88,
  },
  {
    id: "segment",
    name: "Segment",
    description: "Stream every call event to your data stack.",
    category: "data",
    color: "#52BD95",
    mark: "Sg",
    connected: true,
    connectedAt: NOW - DAY * 51,
  },
  // Available (14)
  {
    id: "salesforce",
    name: "Salesforce",
    description: "Push leads & opportunities into your CRM of record.",
    category: "crm",
    color: "#00A1E0",
    mark: "Sf",
    connected: false,
  },
  {
    id: "ghl",
    name: "GoHighLevel",
    description: "Sync leads into agencies' favorite CRM.",
    category: "crm",
    color: "#10B981",
    mark: "Gh",
    connected: false,
  },
  {
    id: "zoho",
    name: "Zoho CRM",
    description: "Two-way contact + deal sync.",
    category: "crm",
    color: "#E42527",
    mark: "Zh",
    connected: false,
  },
  {
    id: "bandwidth",
    name: "Bandwidth",
    description: "Alternative carrier for toll-free + local DIDs.",
    category: "telephony",
    color: "#0072CE",
    mark: "Bw",
    connected: false,
  },
  {
    id: "plivo",
    name: "Plivo",
    description: "Global telephony with SIP trunking.",
    category: "telephony",
    color: "#5856D6",
    mark: "Pl",
    connected: false,
  },
  {
    id: "snowflake",
    name: "Snowflake",
    description: "Stream calls into your warehouse.",
    category: "data",
    color: "#29B5E8",
    mark: "Sn",
    connected: false,
  },
  {
    id: "bigquery",
    name: "BigQuery",
    description: "Push call records to Google's warehouse.",
    category: "data",
    color: "#4285F4",
    mark: "Bq",
    connected: false,
  },
  {
    id: "postgres",
    name: "PostgreSQL",
    description: "Direct DB replication via logical decoding.",
    category: "data",
    color: "#336791",
    mark: "Pg",
    connected: false,
  },
  {
    id: "google-analytics",
    name: "Google Analytics",
    description: "Send conversions back to GA4 for attribution.",
    category: "analytics",
    color: "#F9AB00",
    mark: "GA",
    connected: false,
  },
  {
    id: "mixpanel",
    name: "Mixpanel",
    description: "Product analytics with call funnels.",
    category: "analytics",
    color: "#7856FF",
    mark: "Mp",
    connected: false,
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Billing + payouts processor.",
    category: "automation",
    color: "#635BFF",
    mark: "St",
    connected: false,
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "5000+ no-code connectors.",
    category: "automation",
    color: "#FF4F00",
    mark: "Zp",
    connected: false,
  },
  {
    id: "make",
    name: "Make",
    description: "Visual automation with Vortyx triggers.",
    category: "automation",
    color: "#6D00CC",
    mark: "Mk",
    connected: false,
  },
  {
    id: "discord",
    name: "Discord",
    description: "Operator alerts in your Discord server.",
    category: "communication",
    color: "#5865F2",
    mark: "Dc",
    connected: false,
  },
  {
    id: "teams",
    name: "Microsoft Teams",
    description: "Push notifications into MS Teams channels.",
    category: "communication",
    color: "#6264A7",
    mark: "Ts",
    connected: false,
  },
  {
    id: "datadog",
    name: "Datadog",
    description: "Monitor routing latency and error rates.",
    category: "analytics",
    color: "#632CA6",
    mark: "Dd",
    connected: false,
  },
];

export const MOCK_WEBHOOKS: Webhook[] = [
  {
    id: "wh_001",
    name: "CRM postback",
    url: "https://crm.example.com/vortyx/events",
    events: ["call.completed", "call.qualified"],
    status: "active",
    createdAt: NOW - DAY * 184,
    lastDeliveryAt: NOW - MIN * 2,
    successRate24h: 0.987,
  },
  {
    id: "wh_002",
    name: "Slack #ops",
    url: "https://hooks.slack.com/services/T0XXX/B0XXX/abcdef",
    events: ["buyer.capped", "publisher.spike"],
    status: "active",
    createdAt: NOW - DAY * 92,
    lastDeliveryAt: NOW - MIN * 12,
    successRate24h: 1,
  },
  {
    id: "wh_003",
    name: "Warehouse stream",
    url: "https://etl.example.com/ingest/vortyx",
    events: ["call.completed", "bid.placed"],
    status: "failing",
    createdAt: NOW - DAY * 21,
    lastDeliveryAt: NOW - MIN * 5,
    successRate24h: 0.42,
  },
];

const EVENTS = ["call.completed", "call.qualified", "buyer.capped", "publisher.spike", "bid.placed"];

export const MOCK_DELIVERIES: WebhookDelivery[] = Array.from({ length: 24 }).map((_, i) => {
  const webhookId = MOCK_WEBHOOKS[i % MOCK_WEBHOOKS.length].id;
  const isFailingHook = webhookId === "wh_003";
  const statusRoll = (i * 37) % 100;
  const status: WebhookDelivery["status"] = isFailingHook && statusRoll < 60
    ? statusRoll < 30 ? "failed" : "retrying"
    : "delivered";
  return {
    id: `dlv_${i + 1}`,
    webhookId,
    event: EVENTS[i % EVENTS.length],
    status,
    responseCode: status === "delivered" ? 200 : status === "retrying" ? 502 : 500,
    responseTimeMs: 80 + ((i * 47) % 320),
    at: NOW - MIN * (2 + i * 7),
  };
});
