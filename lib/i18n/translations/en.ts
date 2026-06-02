/**
 * English — base translation dictionary. Every key here is the contract; the
 * other locales mirror this shape. Missing keys in non-English locales fall
 * back to the English value via the `t()` helper.
 */

export const en = {
  /* ─── Sidebar / nav ──────────────────────────────────────── */
  nav: {
    workspace: "Workspace",
    dashboard: "Dashboard",
    liveMonitor: "Live Monitor",
    reports: "Reports",
    campaigns: "Campaigns",
    phoneNumbers: "Phone Numbers",
    routing: "Routing",
    buyers: "Buyers",
    destinations: "Destinations",
    publishers: "Publishers",
    voipShield: "VoIP Shield",
    tcpaShield: "TCPA Shield",
    blockedNumbers: "Blocked Numbers",
    callLogs: "Call Logs",
    marketplace: "Marketplace",
    aiInsights: "AI Insights",
    coinMarket: "Coin Market",
    dailyNews: "Daily News",
    referrals: "Referrals",
    trustEngine: "Trust Engine",
    integrations: "Integrations",
    billing: "Billing",
    settings: "Settings",
    // section labels
    section: {
      overview: "OVERVIEW",
      traffic: "TRAFFIC",
      network: "NETWORK",
      suppressionList: "SUPPRESSION LIST",
      insights: "INSIGHTS",
      news: "NEWS",
      account: "ACCOUNT",
    },
  },

  /* ─── Top bar ────────────────────────────────────────────── */
  topbar: {
    searchPlaceholder: "Search calls, buyers, campaigns…",
    live: "Live",
    total: "Total",
    theme: "Theme",
    language: "Language",
    notifications: "Notifications",
  },

  /* ─── Page headers ───────────────────────────────────────── */
  page: {
    dashboard: {
      title: "Dashboard",
      description: "Today's performance at a glance.",
    },
    live: {
      title: "Live Monitor",
      description: "Every call as it lands, routes, and settles — in real time.",
    },
    reports: {
      title: "Reporting",
      description: "Calls, performance, and detail logs.",
    },
    callLogs: {
      title: "Call Logs",
      description: "Every call your network has handled.",
    },
    campaigns: {
      title: "Campaigns",
      description: "Active campaigns routing traffic across your network.",
    },
    phoneNumbers: {
      title: "Phone Numbers",
      description: "Provisioned TFNs across all destinations.",
    },
    routing: {
      title: "Routing",
      description: "Visual routing trees that decide who gets the call.",
    },
    buyers: {
      title: "Buyers",
      description: "Networks bidding on your inbound calls.",
    },
    destinations: {
      title: "Destinations",
      description: "Where qualified calls land — buyer TFNs and call centers.",
    },
    publishers: {
      title: "Publishers",
      description: "Traffic sources driving calls into your network.",
    },
    billing: {
      title: "Billing",
      description: "Subscription, usage, payment method, and invoice history.",
    },
    settings: {
      title: "Settings",
      description: "Personal account, API keys, notifications, and active sessions.",
    },
    workspace: {
      title: "Workspace",
      description: "Org defaults, members, and roles that apply to your entire organization.",
    },
    marketplace: {
      title: "Marketplace",
      description: "Live auctions for high-intent inventory across verticals.",
    },
    aiInsights: {
      title: "AI Insights",
      description: "Anomalies, recommendations, and Autopilot suggestions.",
    },
    integrations: {
      title: "Integrations",
      description: "Connect Vortyx to the tools your team already runs on.",
    },
    referrals: {
      title: "Referrals",
      description: "Invite operators and earn recurring revenue from their calls.",
    },
    trustEngine: {
      title: "Trust Engine",
      description: "KYC and identity verification across all 5 trust vectors.",
    },
  },

  /* ─── Common actions / buttons ───────────────────────────── */
  common: {
    save: "Save",
    cancel: "Cancel",
    discard: "Discard",
    apply: "Apply",
    activate: "Activate",
    pause: "Pause",
    paused: "Paused",
    active: "Active",
    pending: "Pending",
    invite: "Invite",
    sendInvite: "Send invite",
    getStarted: "Get started",
    signIn: "Sign in",
    signOut: "Sign out",
    signUp: "Sign up",
    export: "Export",
    refresh: "Refresh",
    delete: "Delete",
    remove: "Remove",
    edit: "Edit",
    add: "Add",
    create: "Create",
    learnMore: "Learn more",
    viewAll: "View all",
    close: "Close",
    confirm: "Confirm",
    yes: "Yes",
    no: "No",
    today: "Today",
    yesterday: "Yesterday",
    name: "Name",
    email: "Email",
    password: "Password",
    status: "Status",
    actions: "Actions",
    search: "Search",
    filter: "Filter",
    settings: "Settings",
    loading: "Loading…",
  },

  /* ─── Login ──────────────────────────────────────────────── */
  login: {
    welcomeBack: "Welcome back",
    description: "Sign in to your Vortyx workspace.",
    email: "Email",
    password: "Password",
    forgot: "Forgot?",
    signIn: "Sign in",
    continue: "Continue",
    signingIn: "Signing in…",
    newHere: "New here?",
    createAccount: "Create an account",
    inviteHint:
      "Buyers and publishers sign in via the role-scoped invite link emailed to them, not this form.",
    twoFactor: {
      title: "Two-factor required",
      description: "Open Google Authenticator and enter the current 6-digit code for",
      label: "Authenticator code",
      hint: "Codes refresh every 30 seconds. Lost your device? Contact your admin.",
      verify: "Verify and continue",
      back: "← Back to sign-in",
      enabled: "Two-factor authentication is on for this account",
    },
  },

  /* ─── Settings rail ──────────────────────────────────────── */
  settings: {
    profile: "Profile",
    security: "Security",
    apiKeys: "API Keys",
    notifications: "Notifications",
    sessions: "Sessions",
    organization: "Organization",
    members: "Members",
    roles: "Roles",
    activity: "Activity",
    general: "General",
  },

  /* ─── Billing ────────────────────────────────────────────── */
  billing: {
    rates: "Rates",
    expenses: "Expenses",
    total: "Total",
    totalExpenses: "Total expenses",
    subscription: "Subscription",
    usage: "Usage",
    paymentMethod: "Payment method",
    invoices: "Invoices",
    invoiceHistory: "Invoice history",
    categories: {
      rentNumbers: "Rent Numbers",
      voiceMinutes: "Voice Minutes",
      voipShield: "VoIP Shield",
      rejectedCall: "Rejected Call",
      callerIdentity: "Caller Identity",
      callRecording: "Call Recording",
    },
  },

  /* ─── Theme / language picker ────────────────────────────── */
  preferences: {
    mode: "MODE",
    light: "Light",
    dark: "Dark",
    auto: "Auto",
    colorTheme: "COLOR THEME",
    language: "LANGUAGE",
    reset: "Reset",
  },
} as const;

export type TranslationShape = typeof en;
