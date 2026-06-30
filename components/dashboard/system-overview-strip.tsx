"use client";

/**
 * Platform-wide system overview — six compact cells sitting in a single
 * full-width strip, one per major entity:
 *
 *   Campaigns · Numbers · Buyers · Publishers · Destinations · Routing
 *
 * Each cell shows: an icon, the entity name, "active / total" headline,
 * and a thin utilization bar so the operator can see "how much of the
 * thing is wired up" at a glance — answering the client's "comprehensive
 * overview of the app's entire status" requirement without spawning a
 * dedicated detail row.
 *
 * The strip is height-locked so every cell renders identically — no
 * vertical drift between columns.
 */

import { useMemo } from "react";
import Link from "next/link";
import {
  GitFork,
  Hash,
  Megaphone,
  Target,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import { useBuyersStore } from "@/lib/store/buyers-store";
import { useCampaignsStore } from "@/lib/store/campaigns-store";
import { useDestinationsStore } from "@/lib/store/destinations-store";
import { useNumbersStore } from "@/lib/store/numbers-store";
import { usePublishersStore } from "@/lib/store/publishers-store";
import { useRoutingStore } from "@/lib/store/routing-store";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Cell {
  key: string;
  href: string;
  icon: LucideIcon;
  label: string;
  active: number;
  total: number;
}

export function SystemOverviewStrip() {
  const campaigns = useCampaignsStore((s) => s.campaigns);
  const numbers = useNumbersStore((s) => s.numbers);
  const buyers = useBuyersStore((s) => s.buyers);
  const publishers = usePublishersStore((s) => s.publishers);
  const destinations = useDestinationsStore((s) => s.destinations);
  const routing = useRoutingStore((s) => s.plans);

  const cells = useMemo<Cell[]>(() => [
    {
      key: "campaigns",
      href: ROUTES.campaigns,
      icon: Megaphone,
      label: "Campaigns",
      active: campaigns.filter((c) => c.status === "active").length,
      total: campaigns.length,
    },
    {
      key: "numbers",
      href: ROUTES.numbers,
      icon: Hash,
      label: "Numbers",
      active: numbers.filter((n) => n.status === "active").length,
      total: numbers.length,
    },
    {
      key: "buyers",
      href: ROUTES.buyers,
      icon: Wallet,
      label: "Buyers",
      active: buyers.filter((b) => b.status === "active").length,
      total: buyers.length,
    },
    {
      key: "publishers",
      href: ROUTES.publishers,
      icon: Users,
      label: "Publishers",
      active: publishers.filter((p) => p.status === "active").length,
      total: publishers.length,
    },
    {
      key: "destinations",
      href: ROUTES.destinations,
      icon: Target,
      label: "Destinations",
      active: destinations.filter((d) => d.enabled).length,
      total: destinations.length,
    },
    {
      key: "routing",
      href: ROUTES.routing,
      icon: GitFork,
      label: "Routing",
      active: routing.filter((r) => r.status === "published").length,
      total: routing.length,
    },
  ], [campaigns, numbers, buyers, publishers, destinations, routing]);

  return (
    <Card>
      <CardContent className="p-0">
        <div className="grid grid-cols-2 divide-x divide-y divide-border/60 sm:grid-cols-3 sm:divide-y-0 lg:grid-cols-6">
          {cells.map((c) => (
            <SystemCell key={c.key} cell={c} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */

function SystemCell({ cell }: { cell: Cell }) {
  const Icon = cell.icon;
  const pct = cell.total > 0 ? Math.min(100, (cell.active / cell.total) * 100) : 0;

  return (
    <Link
      href={cell.href}
      className="group flex flex-col gap-2 px-4 py-3.5 transition-colors hover:bg-secondary/30 focus-visible:outline-none focus-visible:bg-secondary/40"
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-accent/10 text-accent">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {cell.label}
        </span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-xl font-semibold tabular-nums tracking-tight">
          {formatNumber(cell.active)}
        </span>
        <span className="text-[11px] font-mono text-muted-foreground">
          / {formatNumber(cell.total)}
        </span>
      </div>
      {/* Single accent for every cell — health semantics are intentionally
       *  dropped so the strip reads as one unified theme-coloured row
       *  rather than a green/amber/blue traffic-light. */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-secondary/40">
        <div
          className={cn(
            "h-full rounded-full bg-accent transition-all duration-700",
            cell.total === 0 && "bg-muted-foreground/30",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </Link>
  );
}
