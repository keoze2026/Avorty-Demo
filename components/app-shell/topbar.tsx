"use client";

import { Command, Search } from "lucide-react";

import { NotificationsMenu } from "./notifications-menu";
import { UserMenu } from "./user-menu";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/50 bg-background/85 backdrop-blur-xl">
      <div className="relative flex h-16 items-center gap-4 px-4 sm:px-6">
        {/* LEFT — sidebar trigger only */}
        <div className="flex items-center">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 bg-secondary/40">
            <SidebarTrigger className="!h-8 !w-8 text-muted-foreground hover:text-foreground" />
          </div>
        </div>

        {/* CENTER — command search */}
        <div className="relative mx-auto hidden w-full max-w-lg lg:block">
          <CommandSearch />
        </div>

        {/* RIGHT — theme + notifications + identity */}
        <div className="ml-auto flex items-center gap-3">
          {/* Theme + notifications grouped in a pill */}
          <div className="hidden items-center gap-1 rounded-lg border border-border/70 bg-secondary/30 p-1 sm:inline-flex">
            <ThemeToggle variant="icon" />
            <span aria-hidden className="h-5 w-px bg-border/70" />
            <NotificationsMenu />
          </div>

          {/* Vertical separator before identity */}
          <span aria-hidden className="hidden h-7 w-px bg-border/70 sm:block" />

          <UserMenu />
        </div>
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
    <label className="group/cmd relative flex h-10 w-full items-center gap-2.5 rounded-lg border border-border/70 bg-secondary/30 px-3 text-sm transition-colors hover:border-accent/40 focus-within:border-accent/55 focus-within:bg-secondary/50">
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-accent/10 text-accent">
        <Search className="h-3.5 w-3.5" />
      </span>
      <input
        type="search"
        placeholder="Search calls, buyers, campaigns…"
        className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
      />
      <kbd className="pointer-events-none hidden h-6 select-none items-center gap-0.5 rounded border border-border bg-card px-1.5 font-mono text-[10px] font-semibold text-muted-foreground sm:inline-flex">
        <Command className="h-3 w-3" />
        K
      </kbd>
    </label>
  );
}
