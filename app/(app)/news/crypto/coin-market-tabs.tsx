"use client";

import * as React from "react";
import { Coins, Newspaper } from "lucide-react";

import { MarketStatsRow } from "@/components/coinmarket/market-stats-row";
import { TokensTable } from "@/components/coinmarket/tokens-table";
import { NewsFeed } from "@/components/news/news-feed";
import type { NewsCategory, NewsItem } from "@/lib/mock/news";
import type { TokenEntry } from "@/lib/mock/tokens";
import { cn } from "@/lib/utils";

type TabId = "tokens" | "news";

const TABS: Array<{
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "tokens", label: "Tokens", icon: Coins },
  { id: "news", label: "Crypto News", icon: Newspaper },
];

const CRYPTO_CATEGORIES: NewsCategory[] = [
  "Bitcoin",
  "Ethereum",
  "DeFi",
  "NFT",
  "Layer 2",
  "Regulation",
  "Markets",
];

/** How often to poll /api/tokens for the visible block (ms). */
const POLL_INTERVAL_MS = 20_000;
/** Each CoinGecko fetch returns this many tokens. */
const BLOCK_SIZE = 250;
/** Rough upper bound — used while we haven't hit the end of CoinGecko's list. */
const ESTIMATED_MAX_TOKENS = 15_000;

interface Props {
  tokens: TokenEntry[];
  news: NewsItem[];
}

/** Client-side tab switcher — the server page hands us the initial data. */
export function CoinMarketTabs({ tokens: initialTokens, news }: Props) {
  const [tab, setTab] = React.useState<TabId>("tokens");
  const [tokens, setTokens] = React.useState<TokenEntry[]>(initialTokens);
  const [loading, setLoading] = React.useState(false);
  // True until we hit a CoinGecko page that returns an empty array.
  const [hasMore, setHasMore] = React.useState(true);

  /* ─── Poll block 1 every 20s so the "live" rows stay fresh. ───────── */
  React.useEffect(() => {
    if (tab !== "tokens") return;
    let cancelled = false;

    const refresh = async () => {
      if (typeof document !== "undefined" && document.hidden) return;
      try {
        const res = await fetch(
          `/api/tokens?page=1&perPage=${BLOCK_SIZE}`,
          { cache: "no-store" },
        );
        if (!res.ok) return;
        const fresh = (await res.json()) as TokenEntry[];
        if (cancelled || !Array.isArray(fresh) || fresh.length === 0) return;
        // Replace the first BLOCK_SIZE rows; keep any later blocks the user
        // already paginated into.
        setTokens((prev) => [...fresh, ...prev.slice(fresh.length)]);
      } catch {
        /* swallow — keep the last good snapshot on transient errors */
      }
    };

    const id = window.setInterval(refresh, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [tab]);

  /* ─── Append the next block when the user paginates past loaded data. ── */
  const ensureLoadedForPage = React.useCallback(
    async (tablePage: number, tablePageSize: number) => {
      const tokensNeeded = (tablePage + 1) * tablePageSize;
      if (tokensNeeded <= tokens.length) return;
      if (!hasMore || loading) return;

      setLoading(true);
      try {
        const nextCgPage = Math.floor(tokens.length / BLOCK_SIZE) + 1;
        const res = await fetch(
          `/api/tokens?page=${nextCgPage}&perPage=${BLOCK_SIZE}`,
          { cache: "no-store" },
        );
        if (!res.ok) return;
        const more = (await res.json()) as TokenEntry[];
        if (!Array.isArray(more) || more.length === 0) {
          // Reached the end of CoinGecko's list.
          setHasMore(false);
          return;
        }
        setTokens((prev) => [...prev, ...more]);
      } finally {
        setLoading(false);
      }
    },
    [tokens.length, hasMore, loading],
  );

  // Display total: rough upper bound until we know we've hit the end,
  // then the exact loaded count.
  const estimatedTotal = hasMore
    ? Math.max(ESTIMATED_MAX_TOKENS, tokens.length)
    : tokens.length;

  return (
    <>
      <div className="no-scrollbar flex overflow-x-auto border-b border-border">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "relative inline-flex items-center gap-1.5 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none",
                active
                  ? "text-accent"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
              {active && (
                <span
                  aria-hidden
                  className="absolute inset-x-2 -bottom-px h-0.5 bg-accent"
                />
              )}
            </button>
          );
        })}
      </div>

      {tab === "tokens" && (
        <div className="space-y-5">
          <MarketStatsRow tokens={tokens.slice(0, BLOCK_SIZE)} />
          <TokensTable
            tokens={tokens}
            estimatedTotal={estimatedTotal}
            loading={loading}
            onPageChange={ensureLoadedForPage}
            pageSize={100}
          />
        </div>
      )}

      {tab === "news" && (
        <NewsFeed items={news} categories={CRYPTO_CATEGORIES} />
      )}
    </>
  );
}
