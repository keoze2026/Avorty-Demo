/**
 * Live daily-news aggregator — fetches RSS feeds from ~8 reputable sources
 * in parallel, normalizes the items into the shared `NewsItem` shape, and
 * returns the freshest 60 entries.
 *
 * Caching:
 *   - 10-minute in-memory cache (server-side) so concurrent requests don't
 *     thunder the upstream feeds.
 *   - `next: { revalidate: 600 }` on each fetch so Next's data cache also
 *     respects the 10-minute window.
 *
 * No API key required — every source is publicly accessible RSS / Atom.
 */

import { NextResponse } from "next/server";

import type { NewsCategory, NewsItem } from "@/lib/mock/news";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CACHE_MS = 10 * 60 * 1000; // 10 minutes
const PER_FEED_LIMIT = 12; // most-recent N per source
const TOTAL_LIMIT = 60;

interface FeedSource {
  url: string;
  /** Display name used as `NewsItem.source`. */
  source: string;
  category: NewsCategory;
}

/**
 * Curated RSS feeds. All publicly accessible, no API key required.
 * Mix of UK + US outlets so politics / sports lean toward the English-
 * speaking common denominator.
 */
const FEEDS: FeedSource[] = [
  { url: "https://feeds.bbci.co.uk/news/world/rss.xml",                   source: "BBC News",     category: "World" },
  { url: "https://feeds.bbci.co.uk/news/business/rss.xml",                source: "BBC Business", category: "Business" },
  { url: "https://feeds.bbci.co.uk/news/technology/rss.xml",              source: "BBC Tech",     category: "Tech" },
  { url: "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml", source: "BBC Science",  category: "Science" },
  { url: "https://feeds.bbci.co.uk/sport/rss.xml",                        source: "BBC Sport",    category: "Sports" },
  { url: "https://feeds.npr.org/1014/rss.xml",                            source: "NPR Politics", category: "Politics" },
  { url: "https://techcrunch.com/feed/",                                  source: "TechCrunch",   category: "Tech" },
  { url: "https://www.theverge.com/rss/index.xml",                        source: "The Verge",    category: "Tech" },
];

/** Deterministic gradient tint per item — uses the title hash so the same
 *  story always lands on the same color. */
const TINTS: Array<[string, string]> = [
  ["#3A4BC4", "#818CF8"],
  ["#14B8A6", "#6366F1"],
  ["#F97316", "#EC4899"],
  ["#06B6D4", "#4F46E5"],
  ["#D946EF", "#6366F1"],
  ["#DC2626", "#F59E0B"],
];

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

let cache: { items: NewsItem[]; at: number } | null = null;

export async function GET() {
  if (cache && Date.now() - cache.at < CACHE_MS) {
    return NextResponse.json(
      { items: cache.items, cached: true, fetchedAt: cache.at },
      { headers: { "Cache-Control": "public, max-age=600" } },
    );
  }

  const results = await Promise.allSettled(
    FEEDS.map(async (feed) => {
      const res = await fetch(feed.url, {
        next: { revalidate: 600 },
        headers: {
          // Some feeds (notably TechCrunch) 403 a default-UA fetch.
          "User-Agent":
            "Mozilla/5.0 (compatible; AvortyxNewsBot/1.0; +https://avortyx.io)",
          Accept:
            "application/rss+xml, application/atom+xml, application/xml;q=0.9, */*;q=0.8",
        },
      });
      if (!res.ok) throw new Error(`${feed.source} HTTP ${res.status}`);
      const xml = await res.text();
      return parseFeed(xml, feed);
    }),
  );

  const items: NewsItem[] = results
    .flatMap((r) => (r.status === "fulfilled" ? r.value : []))
    .sort((a, b) => b.publishedAt - a.publishedAt)
    .slice(0, TOTAL_LIMIT);

  // Only update cache when we actually got results — preserve the previous
  // batch if every feed fails so the UI never has to render zero items.
  if (items.length > 0) {
    cache = { items, at: Date.now() };
  }

  const failedSources = results
    .map((r, i) => (r.status === "rejected" ? FEEDS[i].source : null))
    .filter((x): x is string => x !== null);

  return NextResponse.json(
    {
      items: items.length > 0 ? items : (cache?.items ?? []),
      cached: false,
      fetchedAt: cache?.at ?? Date.now(),
      failedSources,
    },
    { headers: { "Cache-Control": "public, max-age=600" } },
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/*  RSS / Atom parser — regex-based, handles both feed flavors            */
/* ────────────────────────────────────────────────────────────────────── */

function parseFeed(xml: string, feed: FeedSource): NewsItem[] {
  const isAtom =
    xml.includes("<feed") &&
    xml.includes('xmlns="http://www.w3.org/2005/Atom"');
  const itemTag = isAtom ? "entry" : "item";
  const blocks = extractAll(xml, itemTag);

  const items: NewsItem[] = [];
  for (const block of blocks.slice(0, PER_FEED_LIMIT)) {
    const title = decode(extractFirst(block, "title")) ?? "";
    const description =
      decode(extractFirst(block, isAtom ? "summary" : "description")) ??
      decode(extractFirst(block, "content")) ??
      "";
    const link = isAtom
      ? extractAttr(block, "link", "href") ??
        decode(extractFirst(block, "link")) ??
        ""
      : decode(extractFirst(block, "link")) ?? "";
    const pubDateRaw =
      decode(extractFirst(block, isAtom ? "published" : "pubDate")) ??
      decode(extractFirst(block, isAtom ? "updated" : "dc:date"));
    const publishedAt = pubDateRaw ? Date.parse(pubDateRaw) : NaN;

    // Try `<media:thumbnail url="..."/>`, `<media:content url="..."/>`,
    // `<enclosure url="..."/>`, and lastly an `<img src="...">` embedded
    // in the HTML description.
    const imageUrl =
      extractAttr(block, "media:thumbnail", "url") ??
      extractAttr(block, "media:content", "url") ??
      extractAttr(block, "enclosure", "url") ??
      extractImgSrc(description) ??
      undefined;

    if (!title || !link || !Number.isFinite(publishedAt)) continue;

    const id = `${feed.source}-${hashCode(link)}`;
    const tint = TINTS[hashCode(title) % TINTS.length];

    items.push({
      id,
      title: title.trim(),
      summary: stripTags(description).slice(0, 220).trim(),
      source: feed.source,
      category: feed.category,
      publishedAt,
      url: link.trim(),
      tint,
      ...(imageUrl ? { imageUrl } : {}),
    });
  }
  return items;
}

/** Extract every `<tag>…</tag>` block (non-greedy). */
function extractAll(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}[\\s>][\\s\\S]*?<\\/${tag}>`, "g");
  return xml.match(re) ?? [];
}

/** Extract the first inner text of `<tag>…</tag>`. CDATA-aware. */
function extractFirst(xml: string, tag: string): string | null {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`);
  const m = xml.match(re);
  if (!m) return null;
  const inner = m[1].trim();
  const cdata = inner.match(/^<!\[CDATA\[([\s\S]*?)\]\]>$/);
  return cdata ? cdata[1] : inner;
}

/** Extract `<tag attr="…">` value of a given attribute. */
function extractAttr(xml: string, tag: string, attr: string): string | null {
  const re = new RegExp(`<${tag}[^>]*\\s${attr}="([^"]+)"`);
  const m = xml.match(re);
  return m ? m[1] : null;
}

function extractImgSrc(html: string): string | null {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ");
}

function decode(s: string | null): string | null {
  if (s == null) return null;
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x([0-9A-Fa-f]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(parseInt(d, 10)));
}
