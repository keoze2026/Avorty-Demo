"use client";

import { Search } from "lucide-react";

import { LiveBadge } from "@/components/shared/live-badge";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Breadcrumbs } from "./breadcrumbs";
import { NotificationsMenu } from "./notifications-menu";
import { RoleSwitcher } from "./role-switcher";
import { UserMenu } from "./user-menu";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/40 bg-background/85 px-3 backdrop-blur-xl sm:px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-5" />

      <div className="hidden md:block">
        <Breadcrumbs />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search calls, buyers, campaigns…"
            className="h-8 w-64 pl-8 text-xs font-mono"
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border border-border bg-secondary px-1.5 font-mono text-[10px] text-muted-foreground sm:inline-flex">
            ⌘K
          </kbd>
        </div>

        <LiveBadge className="hidden lg:inline-flex" />
        <ThemeToggle variant="icon" />
        <NotificationsMenu />
        <RoleSwitcher />
        <UserMenu />
      </div>
    </header>
  );
}
