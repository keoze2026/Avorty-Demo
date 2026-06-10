import type {
  ApiKey,
  Capability,
  DeviceSession,
  Member,
  MemberRole,
  NotificationPref,
} from "@/lib/types";

const DAY = 1000 * 60 * 60 * 24;
const HOUR = 1000 * 60 * 60;

export const MOCK_MEMBERS: Member[] = [
  {
    id: "m_001",
    name: "Avery Quinn",
    email: "avery@avortyx.io",
    role: "admin",
    initials: "AQ",
    avatar: ["#00e6b8", "#1656d6"],
    status: "active",
    invitedAt: Date.now() - DAY * 220,
    joinedAt: Date.now() - DAY * 218,
    lastActiveAt: Date.now() - HOUR * 0.4,
  },
  {
    id: "m_002",
    name: "Morgan Reed",
    email: "morgan@avortyx.io",
    role: "manager",
    initials: "MR",
    avatar: ["#22d3ee", "#1656d6"],
    status: "active",
    invitedAt: Date.now() - DAY * 180,
    joinedAt: Date.now() - DAY * 175,
    lastActiveAt: Date.now() - HOUR * 2,
  },
  {
    id: "m_003",
    name: "Riley Chen",
    email: "riley@avortyx.io",
    role: "publisher",
    initials: "RC",
    avatar: ["#7de1ff", "#22d3ee"],
    status: "active",
    invitedAt: Date.now() - DAY * 90,
    joinedAt: Date.now() - DAY * 88,
    lastActiveAt: Date.now() - HOUR * 0.1,
  },
  {
    id: "m_004",
    name: "Priya Desai",
    email: "priya@avortyx.io",
    role: "buyer",
    initials: "PD",
    avatar: ["#a855f7", "#1656d6"],
    status: "active",
    invitedAt: Date.now() - DAY * 60,
    joinedAt: Date.now() - DAY * 58,
    lastActiveAt: Date.now() - HOUR * 26,
  },
  {
    id: "m_005",
    name: "Devon Walker",
    email: "devon@avortyx.io",
    role: "viewer",
    initials: "DW",
    avatar: ["#f472b6", "#7c3aed"],
    status: "active",
    invitedAt: Date.now() - DAY * 4,
  },
  {
    id: "m_006",
    name: "Hana Becker",
    email: "hana@avortyx.io",
    role: "buyer",
    initials: "HB",
    avatar: ["#f59e0b", "#dc2626"],
    status: "suspended",
    invitedAt: Date.now() - DAY * 140,
    joinedAt: Date.now() - DAY * 138,
    lastActiveAt: Date.now() - DAY * 25,
  },
];

export const ROLES_IN_ORDER: MemberRole[] = [
  "admin",
  "manager",
  "buyer",
  "publisher",
  "viewer",
];

/**
 * Internal team roles only — used by the Workspace > Members invite/edit
 * flows. Buyer and Publisher accounts are not provisioned through workspace
 * invites; they sign up via the buyer/publisher onboarding paths.
 */
export const INTERNAL_ROLES_IN_ORDER: MemberRole[] = [
  "admin",
  "manager",
  "agent",
  "viewer",
];

export const ROLE_DESCRIPTIONS: Record<MemberRole, string> = {
  admin: "Full access. Can manage members and billing.",
  manager: "Run campaigns, routing, and reports.",
  agent: "Handle live calls and update dispositions.",
  buyer: "View own buyer dashboards, accept calls.",
  publisher: "View own publisher dashboards, manage numbers.",
  viewer: "Read-only access across the workspace.",
};

export const CAPABILITIES: Capability[] = [
  { key: "manage.campaigns", label: "Manage campaigns", description: "Create, edit, archive campaigns" },
  { key: "manage.routing", label: "Edit routing plans", description: "Build and publish ring trees" },
  { key: "manage.numbers", label: "Provision numbers", description: "Buy and assign tracking DIDs" },
  { key: "manage.buyers", label: "Manage buyers", description: "Invite, configure, suspend buyers" },
  { key: "manage.publishers", label: "Manage publishers", description: "Invite, configure, suspend publishers" },
  { key: "view.reports", label: "View reports", description: "Read-only access to analytics" },
  { key: "place.bids", label: "Place bids", description: "Bid on marketplace listings" },
  { key: "manage.billing", label: "Manage billing", description: "Plans, invoices, payment methods" },
  { key: "manage.members", label: "Manage members", description: "Invite, edit roles, remove members" },
];

/** Default permission matrix — true = role can do capability. */
export const DEFAULT_MATRIX: Record<MemberRole, Record<string, boolean>> = {
  admin: Object.fromEntries(CAPABILITIES.map((c) => [c.key, true])),
  manager: {
    "manage.campaigns": true,
    "manage.routing": true,
    "manage.numbers": true,
    "manage.buyers": true,
    "manage.publishers": true,
    "view.reports": true,
    "place.bids": true,
    "manage.billing": false,
    "manage.members": false,
  },
  agent: {
    "manage.campaigns": false,
    "manage.routing": false,
    "manage.numbers": false,
    "manage.buyers": false,
    "manage.publishers": false,
    "view.reports": true,
    "place.bids": false,
    "manage.billing": false,
    "manage.members": false,
  },
  buyer: {
    "manage.campaigns": false,
    "manage.routing": false,
    "manage.numbers": false,
    "manage.buyers": false,
    "manage.publishers": false,
    "view.reports": true,
    "place.bids": true,
    "manage.billing": false,
    "manage.members": false,
  },
  publisher: {
    "manage.campaigns": false,
    "manage.routing": false,
    "manage.numbers": true,
    "manage.buyers": false,
    "manage.publishers": false,
    "view.reports": true,
    "place.bids": false,
    "manage.billing": false,
    "manage.members": false,
  },
  viewer: {
    "manage.campaigns": false,
    "manage.routing": false,
    "manage.numbers": false,
    "manage.buyers": false,
    "manage.publishers": false,
    "view.reports": true,
    "place.bids": false,
    "manage.billing": false,
    "manage.members": false,
  },
};

export const MOCK_API_KEYS: ApiKey[] = [
  {
    id: "k_001",
    name: "Production server",
    prefix: "vx_live_a3F8c21x",
    scopes: ["read", "write"],
    createdAt: Date.now() - DAY * 184,
    lastUsedAt: Date.now() - HOUR * 0.2,
    createdByName: "Avery Quinn",
  },
  {
    id: "k_002",
    name: "Webhook receiver",
    prefix: "vx_live_b7d2e09y",
    scopes: ["read"],
    createdAt: Date.now() - DAY * 92,
    lastUsedAt: Date.now() - HOUR * 4,
    createdByName: "Morgan Reed",
  },
  {
    id: "k_003",
    name: "Salesforce sync",
    prefix: "vx_live_c9a1f342",
    scopes: ["read", "write"],
    createdAt: Date.now() - DAY * 45,
    lastUsedAt: Date.now() - DAY * 1,
    createdByName: "Morgan Reed",
  },
  {
    id: "k_004",
    name: "Legacy migration",
    prefix: "vx_test_d4e6b78f",
    scopes: ["admin"],
    createdAt: Date.now() - DAY * 12,
    createdByName: "Avery Quinn",
  },
];

export const MOCK_SESSIONS: DeviceSession[] = [
  {
    id: "s_001",
    device: "MacBook Pro · macOS 15.4",
    browser: "Safari 18",
    ip: "73.14.221.108",
    city: "San Francisco, CA",
    current: true,
    lastActiveAt: Date.now() - 1000 * 30,
  },
  {
    id: "s_002",
    device: "iPhone 16 Pro · iOS 18.4",
    browser: "Safari Mobile",
    ip: "73.14.221.110",
    city: "San Francisco, CA",
    current: false,
    lastActiveAt: Date.now() - HOUR * 3,
  },
  {
    id: "s_003",
    device: "Windows 11 · Edge",
    browser: "Edge 128",
    ip: "104.221.45.18",
    city: "Austin, TX",
    current: false,
    lastActiveAt: Date.now() - DAY * 2,
  },
  {
    id: "s_004",
    device: "Linux · Ubuntu",
    browser: "Chrome 142",
    ip: "192.241.18.220",
    city: "Newark, NJ",
    current: false,
    lastActiveAt: Date.now() - DAY * 9,
  },
];

export const MOCK_NOTIFICATIONS: NotificationPref[] = [
  {
    key: "call.completed",
    label: "Call completed",
    description: "When a call settles and pays out.",
    email: false,
    inApp: true,
    sms: false,
  },
  {
    key: "buyer.capped",
    label: "Buyer reached cap",
    description: "When a buyer hits their daily / monthly cap.",
    email: true,
    inApp: true,
    sms: false,
  },
  {
    key: "publisher.spike",
    label: "Publisher traffic spike",
    description: "Volume up >50% vs trailing 24h average.",
    email: true,
    inApp: true,
    sms: false,
  },
  {
    key: "webhook.failing",
    label: "Webhook failing",
    description: "5+ consecutive delivery failures.",
    email: true,
    inApp: true,
    sms: true,
  },
  {
    key: "billing.invoice",
    label: "Invoice ready",
    description: "Monthly invoice or receipt.",
    email: true,
    inApp: false,
    sms: false,
  },
  {
    key: "ai.recommendation",
    label: "AI recommendation",
    description: "New optimization suggestion.",
    email: false,
    inApp: true,
    sms: false,
  },
];
