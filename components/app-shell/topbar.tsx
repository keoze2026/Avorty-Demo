"use client";

import { useMemo } from "react";
import { Command, PhoneCall, PhoneIncoming, Search, Wallet } from "lucide-react";

import { NotificationsMenu } from "./notifications-menu";
import { UserMenu } from "./user-menu";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { formatCompact, formatCurrency } from "@/lib/format";
import { MOCK_CALLS } from "@/lib/mock/calls";

export function Topbar() {
  // Lightweight live stats derived from the mock call dataset — recomputes
  // on each render but cheap since MOCK_CALLS is small.
  const { rechargeAmount, liveCalls, totalCalls } = useMemo(() => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const start = startOfDay.getTime();

    let total = 0;
    let live = 0;
    for (const c of MOCK_CALLS) {
      if (c.startedAt >= start) total += 1;
      if (c.status === "ringing" || c.status === "in-progress") live += 1;
    }
    return { rechargeAmount: 12480, liveCalls: live, totalCalls: total };
  }, []);

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

        {/* RIGHT — stats + theme + notifications + identity */}
        <div className="ml-auto flex items-center gap-3">
          {/* Live stats — recharge, in-flight, total today */}
          <div className="hidden items-center gap-3 rounded-lg border border-border/70 bg-secondary/30 px-3 py-1.5 md:inline-flex">
            <TopStat
              icon={Wallet}
              label="Recharge"
              value={formatCurrency(rechargeAmount)}
            />
            <span aria-hidden className="h-7 w-px bg-border/70" />
            <TopStat
              icon={PhoneIncoming}
              label="Live"
              value={formatCompact(liveCalls)}
              live
            />
            <span aria-hidden className="h-7 w-px bg-border/70" />
            <TopStat
              icon={PhoneCall}
              label="Total"
              value={formatCompact(totalCalls)}
            />
          </div>

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

/* ─────────────────────────────────────────────────────────────────── */

interface TopStatProps {
  icon: React.ElementType;
  label: string;
  value: string;
  /** Pulses the icon when true (used for the "Live" stat). */
  live?: boolean;
}

function TopStat({ icon: Icon, label, value, live = false }: TopStatProps) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="relative inline-flex h-6 w-6 items-center justify-center rounded-md bg-accent/10 text-accent">
        <Icon className="h-3.5 w-3.5" />
        {live && (
          <span className="absolute -right-0.5 -top-0.5 flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--success)] opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[color:var(--success)]" />
          </span>
        )}
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="text-[13px] font-semibold tabular-nums text-foreground">
          {value}
        </span>
      </span>
    </span>
  );
}
