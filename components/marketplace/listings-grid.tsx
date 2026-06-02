"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Flame, Search, X } from "lucide-react";

import { ListingCard } from "./listing-card";
import { Input } from "@/components/ui/input";
import { useMarketplaceStore } from "@/lib/store/marketplace-store";
import { useTranslation } from "@/hooks/use-translation";
import type { VerticalKey } from "@/lib/types";
import { cn } from "@/lib/utils";

const VERTICAL_TABS: Array<{ id: "all" | "hot" | VerticalKey; labelKey: string }> = [
  { id: "all", labelKey: "toolsUI.marketplace.grid.tabs.all" },
  { id: "hot", labelKey: "toolsUI.marketplace.grid.tabs.hot" },
  { id: "Health", labelKey: "toolsUI.marketplace.grid.tabs.health" },
  { id: "Solar", labelKey: "toolsUI.marketplace.grid.tabs.solar" },
  { id: "Legal", labelKey: "toolsUI.marketplace.grid.tabs.legal" },
  { id: "Auto", labelKey: "toolsUI.marketplace.grid.tabs.auto" },
  { id: "Finance", labelKey: "toolsUI.marketplace.grid.tabs.finance" },
  { id: "Home", labelKey: "toolsUI.marketplace.grid.tabs.home" },
];

export function ListingsGrid({
  featuredId,
  onFocus,
}: {
  featuredId: string | null;
  onFocus: (id: string) => void;
}) {
  const { t } = useTranslation();
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
    <section className="@container/listings space-y-3">
      <header className="flex flex-wrap items-center gap-2">
        <h3 className="font-sans text-base font-semibold">{t("toolsUI.marketplace.grid.openListings")}</h3>
        <span className="rounded-full border border-border bg-card px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
          {t("toolsUI.marketplace.grid.activeCount").replace("{count}", String(filtered.length))}
        </span>

        <div className="relative ml-auto w-full max-w-xs sm:w-64">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("toolsUI.marketplace.grid.searchPlaceholder")}
            className="h-8 w-full pl-8 text-xs"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={t("toolsUI.marketplace.grid.clearAria")}
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-wrap gap-1 rounded-md border border-border bg-secondary/40 p-0.5">
        {VERTICAL_TABS.map((vt) => (
          <button
            key={vt.id}
            type="button"
            onClick={() => setTab(vt.id)}
            className={cn(
              "inline-flex h-7 items-center gap-1 rounded px-2 text-xs font-mono transition-colors",
              tab === vt.id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {vt.id === "hot" && <Flame className="h-3 w-3" />}
            {t(vt.labelKey)}
          </button>
        ))}
      </div>

      {/* Card grid measures its own track via @container/listings:
            ≥ 28rem (448 px)  → 2 cols
            ≥ 56rem (896 px)  → 3 cols
          So the grid only goes wider when the listings cell itself has room,
          regardless of viewport size or sidebar state. */}
      <div className="grid grid-cols-1 gap-3 @md/listings:grid-cols-2 @4xl/listings:grid-cols-3">
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
