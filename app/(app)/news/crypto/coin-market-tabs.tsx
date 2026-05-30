"use client";

import * as React from "react";
import { Coins, Newspaper, RefreshCw } from "lucide-react";

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

/**
 * How often to poll /api/tokens for the visible block (ms).
 * Synced with the upstream cache window in app/api/tokens/route.ts so polls
 * arrive right after the cache refreshes — every poll is guaranteed-fresh.
 */
const POLL_INTERVAL_MS = 8_000;
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
  // Refresh status surfaced in the toolbar so the user can see freshness.
  const [refreshing, setRefreshing] = React.useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = React.useState<number>(Date.now());

  /**
   * Pull the latest block-1 snapshot and splice it into state. Held in a ref
   * so the interval / visibility handlers all share the same closure-stable
   * function without re-arming the effect on every render.
   */
  const refreshLatestRef = React.useRef<() => Promise<void>>(async () => {});
  React.useEffect(() => {
    refreshLatestRef.current = async () => {
      setRefreshing(true);
      try {
        const res = await fetch(
          `/api/tokens?page=1&perPage=${BLOCK_SIZE}`,
          { cache: "no-store" },
        );
        if (!res.ok) return;
        const payload = (await res.json()) as {
          tokens: TokenEntry[];
          source: unknown;
        };
        const fresh = payload.tokens;
        // Only commit when we got real data. An empty array means the
        // upstream call failed — keep the last good snapshot in place so the
        // user continues to see real, recent values.
        if (!Array.isArray(fresh) || fresh.length === 0) return;
        setTokens((prev) => [...fresh, ...prev.slice(fresh.length)]);
        setLastUpdatedAt(Date.now());
      } catch {
        /* swallow — keep the last good snapshot on transient errors */
      } finally {
        setRefreshing(false);
      }
    };
  }, []);

  const manualRefresh = React.useCallback(() => {
    void refreshLatestRef.current();
  }, []);

  /* ─── Poll block 1 on a short interval so the "live" rows stay fresh. ── */
  React.useEffect(() => {
    if (tab !== "tokens") return;
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      if (typeof document !== "undefined" && document.hidden) return;
      void refreshLatestRef.current();
    };

    // Re-poll instantly when the tab opens (or the operator switches back
    // from another browser tab) so they don't stare at stale numbers.
    void refreshLatestRef.current();
    const onVisible = () => {
      if (!document.hidden) void refreshLatestRef.current();
    };
    document.addEventListener("visibilitychange", onVisible);

    const id = window.setInterval(tick, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [tab]);

  /* ─── "Updated Ns ago" rolls every second to feel alive. ───────────── */
  const [now, setNow] = React.useState<number>(() => Date.now());
  React.useEffect(() => {
    if (tab !== "tokens") return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [tab]);
  const secondsAgo = Math.max(0, Math.floor((now - lastUpdatedAt) / 1000));

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
        const payload = (await res.json()) as {
          tokens: TokenEntry[];
          source: unknown;
        };
        const more = payload.tokens;
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
          {/* Live status strip — shows freshness + manual refresh affordance.
              When the upstream API can't be reached we silently keep the
              last good snapshot; the "Updated Ns ago" counter is the only
              hint that polling has paused (it just keeps climbing). */}
          <div className="flex items-center justify-end gap-2 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="relative inline-flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[oklch(0.78_0.18_155)] opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[oklch(0.78_0.18_155)]" />
              </span>
              <span className="font-semibold uppercase tracking-wider text-[oklch(0.5_0.18_155)] dark:text-[oklch(0.78_0.18_155)]">
                Live
              </span>
            </span>
            <span aria-hidden className="text-muted-foreground/40">·</span>
            <span className="tabular-nums">
              Updated {secondsAgo < 1 ? "just now" : `${secondsAgo}s ago`}
            </span>
            <button
              type="button"
              onClick={manualRefresh}
              disabled={refreshing}
              aria-label="Refresh tokens"
              className={cn(
                "ml-1 inline-flex h-6 w-6 items-center justify-center rounded-md border border-border transition-colors",
                "hover:bg-muted hover:text-foreground",
                refreshing && "opacity-60",
              )}
            >
              <RefreshCw
                className={cn(
                  "h-3 w-3",
                  refreshing && "animate-spin",
                )}
              />
            </button>
          </div>

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
