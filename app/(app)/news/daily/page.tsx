"use client";

import * as React from "react";
import { Loader2, RefreshCw } from "lucide-react";

import { NewsFeed } from "@/components/news/news-feed";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import {
  MOCK_DAILY_NEWS,
  type NewsCategory,
  type NewsItem,
} from "@/lib/mock/news";

const DAILY_CATEGORIES: NewsCategory[] = [
  "Tech",
  "Business",
  "World",
  "Politics",
  "Science",
  "Sports",
];

/** Refresh the feed every 10 minutes so the page stays live without the
 *  user manually reloading. Same cadence as the server-side RSS cache so
 *  every auto-poll is cheap. */
const REFRESH_INTERVAL_MS = 10 * 60 * 1000;

interface NewsResponse {
  items: NewsItem[];
  cached: boolean;
  fetchedAt: number;
  failedSources?: string[];
}

export default function DailyNewsPage() {
  const { t } = useTranslation();
  const [items, setItems] = React.useState<NewsItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = React.useState<number | null>(null);

  const load = React.useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/daily-news", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: NewsResponse = await res.json();
      // If the upstream returned zero items (every feed failed) keep the
      // mock fixture as a fallback so the page is never empty.
      setItems(data.items.length > 0 ? data.items : MOCK_DAILY_NEWS);
      setFetchedAt(data.fetchedAt);
    } catch (err) {
      setError(String(err));
      // On hard failure, show mocked data so the UI never goes blank.
      setItems(MOCK_DAILY_NEWS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial fetch + 10-minute auto-refresh loop. Resets if the component
  // unmounts so navigating away cleanly stops the polling.
  React.useEffect(() => {
    load();
    const id = window.setInterval(() => load(true), REFRESH_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [load]);

  return (
    <>
      <PageHeader
        title={t("toolsUI.news.daily.title")}
        description={t("toolsUI.news.daily.description")}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => load(true)}
            disabled={loading || refreshing}
          >
            {refreshing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            {t("common.refresh")}
          </Button>
        }
      />

      {/* Status strip — only shown while loading or on error so it doesn't
          clutter the page once the live feed is in. */}
      {loading && items.length === 0 ? (
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("common.loading")}
        </div>
      ) : (
        <>
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/8 px-3 py-2 text-xs text-destructive">
              {t("toolsUI.news.daily.fetchError")}
            </div>
          )}
          <NewsFeed items={items} categories={DAILY_CATEGORIES} />
          {fetchedAt && (
            <p className="text-center text-[11px] text-muted-foreground">
              {t("toolsUI.news.daily.lastUpdated").replace(
                "{time}",
                new Date(fetchedAt).toLocaleTimeString(),
              )}
            </p>
          )}
        </>
      )}
    </>
  );
}
