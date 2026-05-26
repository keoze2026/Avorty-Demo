"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Flame, Search, X } from "lucide-react";

import { ListingCard } from "./listing-card";
import { Input } from "@/components/ui/input";
import { useMarketplaceStore } from "@/lib/store/marketplace-store";
import type { VerticalKey } from "@/lib/types";
import { cn } from "@/lib/utils";

const VERTICAL_TABS: Array<{ id: "all" | "hot" | VerticalKey; label: string }> = [
  { id: "all", label: "All" },
  { id: "hot", label: "Hot" },
  { id: "Health", label: "Health" },
  { id: "Solar", label: "Solar" },
  { id: "Legal", label: "Legal" },
  { id: "Auto", label: "Auto" },
  { id: "Finance", label: "Finance" },
  { id: "Home", label: "Home" },
];

export function ListingsGrid({
  featuredId,
  onFocus,
}: {
  featuredId: string | null;
  onFocus: (id: string) => void;
}) {
  const listings = useMarketplaceStore((s) => s.listings);
  const [tab, setTab] = useState<(typeof VERTICAL_TABS)[number]["id"]>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    let l = [...listings];
    if (tab === "hot") l = l.filter((x) => x.hot);
    else if (tab !== "all") l = l.filter((x) => x.vertical === tab);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      l = l.filter(
        (x) =>
          x.campaignName.toLowerCase().includes(q) ||
          x.geo.state.toLowerCase().includes(q) ||
          x.vertical.toLowerCase().includes(q),
      );
    }
    // Sort by hot first, then closing soonest
    return l.sort((a, b) => {
      if (a.hot !== b.hot) return a.hot ? -1 : 1;
      return a.endsAt - b.endsAt;
    });
  }, [listings, tab, query]);

  return (
    <section className="space-y-3">
      <header className="flex flex-wrap items-center gap-2">
        <h3 className="font-sans text-base font-semibold">Open listings</h3>
        <span className="rounded-full border border-border bg-card px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
          {filtered.length} active
        </span>

        <div className="relative ml-auto w-full max-w-xs sm:w-64">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by campaign, state, vertical…"
            className="h-8 w-full pl-8 text-xs"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-wrap gap-1 rounded-md border border-border bg-secondary/40 p-0.5">
        {VERTICAL_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "inline-flex h-7 items-center gap-1 rounded px-2 text-xs font-mono transition-colors",
              tab === t.id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.id === "hot" && <Flame className="h-3 w-3" />}
            {t.label}
          </button>
        ))}
      </div>

      {/* Inner card grid responds to its own track:
           - 1 col mobile · 2 col sm+ · 3 col only at 2xl where the
             marketplace bento's 2/3 column finally has enough room. */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3">
        <AnimatePresence>
          {filtered.map((l) => (
            <ListingCard
              key={l.id}
              listing={l}
              onFocus={onFocus}
              isFeatured={l.id === featuredId}
            />
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
