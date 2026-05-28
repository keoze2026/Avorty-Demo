/**
 * Brand and product-wide constants.
 * Single source of truth — change here, propagate everywhere.
 */

export const BRAND = {
  name: "Vortyx",
  tagline: "The next generation of call intelligence.",
  description:
    "A real-time call tracking, routing, and analytics platform built for modern pay-per-call marketers.",
  domain: "vortyx.io",
  email: "hello@vortyx.io",
} as const;

/** Routes — keep paths centralized so renames are safe. */
export const ROUTES = {
  home: "/",
  pricing: "/pricing",

  // Auth
  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",

  // App
  dashboard: "/dashboard",
  live: "/live",
  campaigns: "/campaigns",
  numbers: "/numbers",
  routing: "/routing",
  buyers: "/buyers",
  destinations: "/destinations",
  publishers: "/publishers",
  calls: "/calls",
  reports: "/reports",
  marketplace: "/marketplace",
  insights: "/insights",
  integrations: "/integrations",
  billing: "/billing",
  settings: "/settings",
} as const;

/** Brand color stops — single-hue indigo ramp.
 *  Mirrors CSS vars; use for inline JS gradients. */
export const VORTYX_COLORS = {
  deep: "#3A4BC4",
  mid: "#5266E0",
  bright: "#818CF8",
  ultra: "#C7D2FE",
} as const;
