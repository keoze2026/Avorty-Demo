"use client";

import * as React from "react";
import { ArrowUpRight, Clock3, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatRelativeTime } from "@/lib/format";
import type { NewsCategory, NewsItem } from "@/lib/mock/news";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

interface Props {
  items: NewsItem[];
  /** Tag pills offered as a quick filter. "All" is always prepended. */
  categories: NewsCategory[];
}

export function NewsFeed({ items, categories }: Props) {
  const { t } = useTranslation();
  const [query, setQuery] = React.useState("");
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [category, setCategory] = React.useState<NewsCategory | "all">("all");

  const filtered = React.useMemo(() => {
    let list = items;
    if (category !== "all") list = list.filter((i) => i.category === category);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((i) =>
        `${i.title} ${i.summary} ${i.source}`.toLowerCase().includes(q),
      );
    }
    return list;
  }, [items, query, category]);

  // Sort newest-first so the hero story is always the most recent.
  const sorted = React.useMemo(
    () => [...filtered].sort((a, b) => b.publishedAt - a.publishedAt),
    [filtered],
  );
  const [featured, ...rest] = sorted;

  return (
    <div className="space-y-5">
      {/* Toolbar: search + category chips */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Chip
            label={t("toolsUI.news.feed.all")}
            active={category === "all"}
            onClick={() => setCategory("all")}
          />
          {categories.map((c) => (
            <Chip
              key={c}
              label={c}
              active={category === c}
              onClick={() => setCategory(c)}
            />
          ))}
        </div>

        <div className="ml-auto">
          {searchOpen || query ? (
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("toolsUI.news.feed.searchPlaceholder")}
                className="h-9 w-64 pl-7 pr-7 text-xs"
              />
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSearchOpen(false);
                }}
                aria-label={t("toolsUI.news.feed.closeSearch")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground"
              aria-label={t("toolsUI.news.feed.searchAria")}
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {sorted.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          {t("toolsUI.news.feed.noMatches")}
        </Card>
      ) : (
        <>
          {/* Featured story */}
          {featured && <FeaturedCard item={featured} />}

          {/* Grid of remaining stories */}
          {rest.length > 0 && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {rest.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────────────── */

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
        active
          ? "border-accent/50 bg-accent/15 text-foreground"
          : "border-border bg-card text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

function FeaturedCard({ item }: { item: NewsItem }) {
  const { t } = useTranslation();
  return (
    <a href={item.url} className="group/featured block">
      <Card className="overflow-hidden p-0">
        <div className="grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)]">
          {/* Thumbnail — real image when CryptoCompare returned one, gradient otherwise */}
          <div
            className="relative hidden h-48 md:block md:h-full"
            style={
              item.imageUrl
                ? undefined
                : {
                    background: `linear-gradient(135deg, ${item.tint[0]} 0%, ${item.tint[1]} 100%)`,
                  }
            }
          >
            {item.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.imageUrl}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            )}
            <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/35 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
              {t("toolsUI.news.feed.featured")}
            </span>
          </div>
          {/* Body */}
          <div className="p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
              <span className="font-semibold text-foreground/80">{item.source}</span>
              <span>·</span>
              <span>{item.category}</span>
              <span>·</span>
              <Clock3 className="h-3 w-3" />
              <span className="tabular-nums">{formatRelativeTime(item.publishedAt)}</span>
            </div>
            <h2 className="mt-2 text-xl font-semibold leading-snug tracking-tight transition-colors group-hover/featured:text-accent">
              {item.title}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{item.summary}</p>
            <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-accent">
              {t("toolsUI.news.feed.readFullStory")}
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover/featured:translate-x-0.5 group-hover/featured:-translate-y-0.5" />
            </div>
          </div>
        </div>
      </Card>
    </a>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  return (
    <a href={item.url} className="group/card block h-full">
      <Card className="flex h-full flex-col overflow-hidden p-0 transition-colors group-hover/card:border-accent/45">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt=""
            className="h-24 w-full shrink-0 object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className="h-24 shrink-0"
            style={{
              background: `linear-gradient(135deg, ${item.tint[0]} 0%, ${item.tint[1]} 100%)`,
            }}
            aria-hidden
          />
        )}
        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            <span className="font-semibold text-foreground/80">{item.source}</span>
            <span>·</span>
            <span>{item.category}</span>
          </div>
          <h3 className="mt-1.5 text-sm font-semibold leading-snug transition-colors group-hover/card:text-accent">
            {item.title}
          </h3>
          <p className="mt-1.5 text-xs text-muted-foreground line-clamp-3">{item.summary}</p>
          <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Clock3 className="h-3 w-3" />
              {formatRelativeTime(item.publishedAt)}
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/60 transition-transform group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5 group-hover/card:text-accent" />
          </div>
        </div>
      </Card>
    </a>
  );
}
