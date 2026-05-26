"use client";

import { Command, Search } from "lucide-react";

import { Breadcrumbs } from "./breadcrumbs";
import { NotificationsMenu } from "./notifications-menu";
import { RoleSwitcher } from "./role-switcher";
import { UserMenu } from "./user-menu";
import { LiveBadge } from "@/components/shared/live-badge";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/50 bg-background/85 backdrop-blur-xl">
      <div className="relative flex h-14 items-center gap-3 px-3 sm:px-4">
        {/* LEFT — trigger + breadcrumb cluster */}
        <div className="flex items-center gap-2">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/70 bg-secondary/40">
            <SidebarTrigger className="!h-7 !w-7 text-muted-foreground hover:text-foreground" />
          </div>
          <span aria-hidden className="hidden h-5 w-px bg-border md:block" />
          <div className="hidden md:block">
            <Breadcrumbs />
          </div>
        </div>

        {/* CENTER — command search.
            Below xl the right cluster needs the room, so the search
            takes a smaller slot and is hidden on tablet widths to avoid
            colliding with breadcrumbs + actions. */}
        <div className="relative mx-auto hidden w-full max-w-md lg:block xl:max-w-md">
          <CommandSearch />
        </div>

        {/* RIGHT — instrument cluster */}
        <div className="ml-auto flex items-center gap-2">
          {/* Live status pill */}
          <LiveBadge className="hidden lg:inline-flex" />

          {/* Theme + notifications grouped in a pill */}
          <div className="hidden items-center gap-0.5 rounded-md border border-border/70 bg-secondary/30 p-0.5 sm:inline-flex">
            <ThemeToggle variant="icon" />
            <span aria-hidden className="h-4 w-px bg-border/70" />
            <NotificationsMenu />
          </div>

          {/* Role switcher */}
          <RoleSwitcher />

          {/* Vertical separator before identity */}
          <span aria-hidden className="hidden h-6 w-px bg-border/70 sm:block" />

          <UserMenu />
        </div>

        {/* Mobile: search lives under the bar (could be wired later); for now hidden */}
      </div>

      {/* Bottom hairline — gradient accent that fades to border */}
      <div aria-hidden className="relative h-px w-full">
        <div className="absolute inset-x-0 top-0 h-px bg-border/60" />
        <div
          className="absolute left-0 top-0 h-px w-40"
          style={{
            background:
              "linear-gradient(to right, var(--accent), transparent)",
          }}
        />
      </div>
    </header>
  );
}

/* ─────────────────────────────────────────────────────────────────── */

function CommandSearch() {
  return (
    <label className="group/cmd relative flex h-9 w-full items-center gap-2 rounded-md border border-border/70 bg-secondary/30 px-2.5 text-xs transition-colors hover:border-accent/40 focus-within:border-accent/55 focus-within:bg-secondary/50">
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-sm bg-accent/10 text-accent">
        <Search className="h-3 w-3" />
      </span>
      <input
        type="search"
        placeholder="Search calls, buyers, campaigns…"
        className="flex-1 bg-transparent font-mono text-[11px] tracking-wide text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
      />
      <kbd className="pointer-events-none hidden h-5 select-none items-center gap-0.5 rounded border border-border bg-card px-1 font-mono text-[9px] font-semibold text-muted-foreground sm:inline-flex">
        <Command className="h-2.5 w-2.5" />
        K
      </kbd>
    </label>
  );
}
