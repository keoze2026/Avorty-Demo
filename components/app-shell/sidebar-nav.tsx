"use client";

/**
 * Vortyx sidebar — HUD-style instrument panel.
 *
 *   ┌─────────────────────────────┐
 *   │  ◉ Vortyx           v0.1 ◀ │   header (brand + collapse)
 *   ├─────────────────────────────┤
 *   │  00 / OVERVIEW              │   numbered group labels
 *   │  │ ▣  Dashboard       LIVE │
 *   │  │ ●  Live Monitor    Live │
 *   │  …                          │
 *   ├─────────────────────────────┤
 *   │  ⏱ 247 in-flight · 14ms    │   status footer
 *   └─────────────────────────────┘
 */

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/brand/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { BRAND } from "@/lib/constants";
import { NAV_GROUPS, type NavItem } from "@/lib/nav";
import { useAuthStore } from "@/lib/store/auth-store";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

function isVisibleForRole(item: NavItem, role: Role | undefined) {
  if (!role) return false;
  return item.roles.includes(role);
}

export function AppSidebar() {
  const pathname = usePathname();
  const role = useAuthStore((s) => s.user?.role);
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="!bg-sidebar">
      {/* Header — brand lockup */}
      <SidebarHeader className="border-b border-sidebar-border p-0">
        <BrandHeader collapsed={collapsed} />
      </SidebarHeader>

      {/* Content — clean grouped sections without numeric prefixes */}
      <SidebarContent className="gap-0 px-3 py-4 group-data-[collapsible=icon]:px-1">
        {NAV_GROUPS.map((group) => {
          const visible = group.items.filter((i) => isVisibleForRole(i, role));
          if (visible.length === 0) return null;
          return (
            <section key={group.label} className="mb-3">
              {/* Group label — subtle, just the name */}
              <div
                className={cn(
                  "mb-2 px-2 pt-2",
                  "group-data-[collapsible=icon]:hidden",
                )}
              >
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                  {group.label}
                </span>
              </div>

              {/* Collapsed-mode group separator */}
              <div
                aria-hidden
                className={cn(
                  "mx-1 mb-1 mt-2 hidden h-px bg-sidebar-border first:mt-0",
                  "group-data-[collapsible=icon]:block",
                )}
              />

              {/* Items */}
              <ul className="space-y-1">
                {visible.map((item) => {
                  const active =
                    pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <SidebarItem
                      key={item.href}
                      item={item}
                      active={active}
                      collapsed={collapsed}
                    />
                  );
                })}
              </ul>
            </section>
          );
        })}
      </SidebarContent>

      {/* Footer — instrument status */}
      <SidebarFooter className="border-t border-sidebar-border p-0">
        <StatusFooter collapsed={collapsed} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

/* ─────────────────────────────────────────────────────────────────── */

function BrandHeader({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex h-16 items-center px-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
      <Link
        href="/dashboard"
        aria-label={BRAND.name}
        className="flex min-w-0 items-center gap-2.5"
      >
        <Logo className="h-8 w-8 shrink-0" />
        {!collapsed && (
          <span
            className="truncate text-xl font-bold tracking-tight"
            style={{
              background:
                "linear-gradient(120deg, #3A4BC4 0%, #5266E0 55%, #818CF8 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "transparent",
            }}
          >
            {BRAND.name}
          </span>
        )}
      </Link>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */

function SidebarItem({
  item,
  active,
  collapsed,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
}) {
  const Icon = item.icon;

  return (
    <li>
      <Link
        href={item.href}
        title={collapsed ? item.label : undefined}
        className={cn(
          "group/item relative flex h-11 items-center gap-3 rounded-lg px-3 transition-all",
          "group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
          active
            ? "bg-accent text-accent-foreground shadow-[0_4px_16px_rgba(82,102,224,0.30)]"
            : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
        )}
      >
        {/* Icon */}
        <Icon className={cn("h-[18px] w-[18px] shrink-0", active ? "" : "opacity-80")} />

        {/* Label */}
        <span
          className={cn(
            "flex-1 truncate text-[14px] font-medium",
            "group-data-[collapsible=icon]:hidden",
          )}
        >
          {item.label}
        </span>

        {/* Badge */}
        {item.badge && (
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
              "group-data-[collapsible=icon]:hidden",
              active
                ? "bg-accent-foreground/20 text-accent-foreground"
                : item.badge === "Live"
                  ? "bg-[color:var(--success)]/15 text-[color:var(--success)]"
                  : "bg-accent/15 text-accent",
            )}
          >
            {item.badge === "Live" && (
              <span className="mr-1 inline-flex h-1.5 w-1.5 rounded-full bg-current align-middle animate-pulse" />
            )}
            {item.badge}
          </span>
        )}
      </Link>
    </li>
  );
}

/* ─────────────────────────────────────────────────────────────────── */

function StatusFooter({ collapsed }: { collapsed: boolean }) {
  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-1.5 py-3">
        <span className="relative inline-flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
        </span>
        <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-accent">v0.1</span>
      </div>
    );
  }

  return (
    <div className="relative px-3 py-3 group-data-[collapsible=icon]:hidden">
      <div aria-hidden className="absolute inset-x-3 top-0 h-px edge-rule-top opacity-60" />

      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="relative inline-flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
          live
        </span>
        <span className="text-accent tabular-nums">v0.1</span>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-1.5">
        <Stat label="rtt" value="14ms" />
        <Stat label="active" value="247" />
        <Stat label="q" value="0" />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-sidebar-border bg-sidebar-accent/40 px-1.5 py-1">
      <div className="font-mono text-[10px] font-semibold tabular-nums text-foreground/90">
        {value}
      </div>
      <div className="font-mono text-[8px] uppercase tracking-[0.18em] text-muted-foreground/70">
        {label}
      </div>
    </div>
  );
}
