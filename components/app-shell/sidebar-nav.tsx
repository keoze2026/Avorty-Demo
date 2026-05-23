"use client";

/**
 * Vortyx sidebar — uses the shadcn sidebar primitive with our NAV_GROUPS.
 * Items are RBAC-filtered by the current user's role.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeft } from "lucide-react";

import { Wordmark } from "@/components/brand/wordmark";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { NAV_GROUPS, type NavItem } from "@/lib/nav";
import { useAuthStore } from "@/lib/store/auth-store";
import type { Role } from "@/lib/types";

function isVisibleForRole(item: NavItem, role: Role | undefined) {
  if (!role) return false;
  return item.roles.includes(role);
}

export function AppSidebar() {
  const pathname = usePathname();
  const role = useAuthStore((s) => s.user?.role);
  const { toggleSidebar, state } = useSidebar();

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center justify-between px-1 py-1">
          <Wordmark size="sm" uid="sidebar" />
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Collapse sidebar"
            className="rounded-md p-1 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground group-data-[collapsible=icon]:hidden"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {NAV_GROUPS.map((group) => {
          const visible = group.items.filter((i) => isVisibleForRole(i, role));
          if (visible.length === 0) return null;
          return (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visible.map((item) => {
                    const active =
                      pathname === item.href || pathname.startsWith(`${item.href}/`);
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          tooltip={state === "collapsed" ? item.label : undefined}
                        >
                          <Link href={item.href} className="flex items-center gap-2">
                            <Icon />
                            <span className="flex-1 truncate">{item.label}</span>
                            {item.badge && (
                              <Badge
                                variant={item.badge === "Live" ? "default" : "outline"}
                                className={
                                  item.badge === "Live"
                                    ? "bg-accent/15 text-accent border-accent/40"
                                    : "border-accent/30 text-accent"
                                }
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="px-2 py-1 text-[10px] text-muted-foreground/70 font-mono group-data-[collapsible=icon]:hidden">
          Vortyx v0.1 · Live
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
