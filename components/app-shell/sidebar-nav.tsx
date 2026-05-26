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
import { ChevronsLeft } from "lucide-react";

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
  const { toggleSidebar, state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="!bg-sidebar">
      {/* Header — brand lockup */}
      <SidebarHeader className="border-b border-sidebar-border p-0">
        <BrandHeader collapsed={collapsed} onCollapse={toggleSidebar} />
      </SidebarHeader>

      {/* Content — numbered group sections */}
      <SidebarContent className="gap-0 px-2 py-3 group-data-[collapsible=icon]:px-1">
        {NAV_GROUPS.map((group, gi) => {
          const visible = group.items.filter((i) => isVisibleForRole(i, role));
          if (visible.length === 0) return null;
          const idx = gi.toString().padStart(2, "0");
          return (
            <section key={group.label} className="mb-1">
              {/* Group label */}
              <div
                className={cn(
                  "mb-1 flex items-center gap-2 px-2 pt-3 pb-1.5",
                  "group-data-[collapsible=icon]:hidden",
                )}
              >
                <span className="font-mono text-[10px] font-semibold tracking-[0.2em] text-accent">
                  {idx}
                </span>
                <span aria-hidden className="h-2.5 w-px bg-sidebar-border" />
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/85">
                  {group.label}
                </span>
                <span
                  aria-hidden
                  className="ml-auto h-px flex-1 bg-gradient-to-r from-sidebar-border to-transparent"
                />
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
              <ul className="space-y-0.5">
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

function BrandHeader({
  collapsed,
  onCollapse,
}: {
  collapsed: boolean;
  onCollapse: () => void;
}) {
  return (
    <div className="relative flex items-center gap-2 overflow-hidden px-3 py-3">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-70"
        style={{ background: "var(--vortyx-glow)" }}
      />

      <Link
        href="/dashboard"
        aria-label={BRAND.name}
        className="relative z-10 flex items-center gap-2.5"
      >
        <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-md border border-accent/40 bg-accent/10">
          <Logo className="h-5 w-5" />
        </span>
        {!collapsed && (
          <span className="flex items-baseline gap-1.5">
            <span
              className="font-bold tracking-tight text-base"
              style={{
                background:
                  "linear-gradient(120deg, #00E6B8 10%, #22D3EE 60%, #7DE1FF 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "transparent",
              }}
            >
              {BRAND.name}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground/80">
              v0.1
            </span>
          </span>
        )}
      </Link>

      {!collapsed && (
        <button
          type="button"
          onClick={onCollapse}
          aria-label="Collapse sidebar"
          className="relative z-10 ml-auto inline-flex h-7 w-7 items-center justify-center rounded-md border border-sidebar-border text-muted-foreground transition-colors hover:border-accent/40 hover:bg-sidebar-accent hover:text-foreground"
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Bottom accent rule */}
      <div
        aria-hidden
        className="absolute inset-x-3 bottom-0 h-px edge-rule-top"
      />
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
          "group/item relative flex h-9 items-center gap-2.5 rounded-md px-2 transition-all",
          "group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
          active
            ? "bg-sidebar-accent/80 text-foreground"
            : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground",
        )}
      >
        {/* Active accent rail */}
        {active && (
          <span
            aria-hidden
            className={cn(
              "absolute inset-y-1 left-0 w-[2px] rounded-full bg-accent shadow-[0_0_8px_var(--accent)]",
              "group-data-[collapsible=icon]:hidden",
            )}
          />
        )}

        {/* Icon chip */}
        <span
          className={cn(
            "relative inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors",
            active
              ? "border border-accent/45 bg-accent/15 text-accent"
              : "border border-transparent bg-secondary/30 text-muted-foreground group-hover/item:border-sidebar-border group-hover/item:text-foreground",
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>

        {/* Label */}
        <span
          className={cn(
            "flex-1 truncate text-[13px] font-medium",
            "group-data-[collapsible=icon]:hidden",
            active && "text-foreground",
          )}
        >
          {item.label}
        </span>

        {/* Badge */}
        {item.badge && (
          <span
            className={cn(
              "shrink-0 rounded-full border px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.18em]",
              "group-data-[collapsible=icon]:hidden",
              item.badge === "Live"
                ? "border-accent/45 bg-accent/15 text-accent"
                : "border-[oklch(0.6_0.2_290)]/45 bg-[oklch(0.6_0.2_290)]/10 text-[oklch(0.55_0.2_290)] dark:text-[oklch(0.78_0.2_290)]",
            )}
          >
            {item.badge === "Live" && (
              <span className="mr-1 inline-flex h-1.5 w-1.5 rounded-full bg-current align-middle animate-pulse" />
            )}
            {item.badge}
          </span>
        )}

        {/* Hover bracket — top/right only, subtle */}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute right-1 top-1 h-1.5 w-1.5 border-t border-r border-accent/0 transition-colors",
            "group-hover/item:border-accent/60",
            "group-data-[collapsible=icon]:hidden",
          )}
        />
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
