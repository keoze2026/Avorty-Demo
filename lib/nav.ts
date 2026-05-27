/**
 * Navigation configuration for the authenticated app shell.
 * Group → items. Each item has a `roles` allowlist for RBAC.
 */

import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Radio,
  Megaphone,
  Hash,
  GitFork,
  Building2,
  Target,
  Users,
  PhoneCall,
  BarChart3,
  Store,
  Sparkles,
  Plug,
  CreditCard,
  Settings,
} from "lucide-react";

import { ROUTES } from "./constants";
import type { Role } from "./types/auth";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: readonly Role[];
  /** Optional badge text (e.g. "Live", "New") */
  badge?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

const ALL_ROLES = ["admin", "buyer", "publisher"] as const;

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: ROUTES.dashboard, icon: LayoutDashboard, roles: ALL_ROLES },
      { label: "Live Monitor", href: ROUTES.live, icon: Radio, roles: ALL_ROLES, badge: "Live" },
    ],
  },
  {
    label: "Traffic",
    items: [
      { label: "Campaigns", href: ROUTES.campaigns, icon: Megaphone, roles: ["admin", "publisher"] },
      { label: "Numbers", href: ROUTES.numbers, icon: Hash, roles: ["admin"] },
      { label: "Routing", href: ROUTES.routing, icon: GitFork, roles: ["admin"] },
    ],
  },
  {
    label: "Network",
    items: [
      { label: "Buyers", href: ROUTES.buyers, icon: Building2, roles: ["admin", "buyer"] },
      { label: "Destinations", href: ROUTES.destinations, icon: Target, roles: ["admin", "buyer"] },
      { label: "Publishers", href: ROUTES.publishers, icon: Users, roles: ["admin", "publisher"] },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "Call Logs", href: ROUTES.calls, icon: PhoneCall, roles: ALL_ROLES },
      { label: "Reports", href: ROUTES.reports, icon: BarChart3, roles: ALL_ROLES },
      { label: "Marketplace", href: ROUTES.marketplace, icon: Store, roles: ["admin", "buyer"] },
      { label: "AI Insights", href: ROUTES.insights, icon: Sparkles, roles: ["admin"], badge: "AI" },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Integrations", href: ROUTES.integrations, icon: Plug, roles: ["admin"] },
      { label: "Billing", href: ROUTES.billing, icon: CreditCard, roles: ["admin", "buyer", "publisher"] },
      { label: "Settings", href: ROUTES.settings, icon: Settings, roles: ALL_ROLES },
    ],
  },
];

/** Flat lookup table for breadcrumb labels. */
export const NAV_LABEL_BY_PATH: Record<string, string> = Object.fromEntries(
  NAV_GROUPS.flatMap((g) => g.items.map((i) => [i.href, i.label] as const)),
);
