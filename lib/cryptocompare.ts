/**
 * Crypto news fetcher with a multi-source fallback chain.
 *
 * Primary source is CryptoCompare's free JSON endpoint. When that's
 * unreachable (rate-limited, WAF-blocked, etc.) we fall through to public RSS
 * feeds from CoinDesk and CoinTelegraph — neither requires an API key and
 * they rarely all fail together.
 *
 * Server-side only — Next.js caches the response via the caller-supplied
 * `revalidateSec` window. On total failure across every source we return an
 * empty array; the client keeps the last good snapshot in place so the
 * operator continues to see real, recent headlines instead of placeholders.
 */

import type { NewsCategory, NewsItem } from "./mock/news";

const CRYPTOCOMPARE_ENDPOINT =
  "https://min-api.cryptocompare.com/data/v2/news/?lang=EN&excludeCategories=Sponsored";

/** Public RSS feeds — used as a fallback if CryptoCompare returns empty. */
const RSS_SOURCES: Array<{ name: string; url: string }> = [
  { name: "CoinDesk", url: "https://www.coindesk.com/arc/outboundfeeds/rss/?outputType=xml" },
  { name: "CoinTelegraph", url: "https://cointelegraph.com/rss" },
  { name: "Decrypt", url: "https://decrypt.co/feed" },
];

/** Hard cap on every upstream call. Without this, a slow RSS source can
 *  hang the build (60s static-gen timeout) or stall a real visitor's
 *  request indefinitely. 5s is generous for HTTP; faster than build-time
 *  pressure but slower than a typical healthy fetch. */
const UPSTREAM_TIMEOUT_MS = 5_000;

/** fetch() with a hard AbortController deadline. Throws on timeout. */
async function fetchWithTimeout(
  url: string,
  init: RequestInit & { next?: { revalidate?: number } },
  timeoutMs = UPSTREAM_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

interface CryptoCompareItem {
  id: string;
  guid: string;
  published_on: number; // unix seconds
  imageurl: string;
  title: string;
  url: string;
  body: string;
  source: string;
  source_info?: { name?: string };
  categories: string;
}

interface CryptoCompareResponse {
  Data: CryptoCompareItem[];
  Type?: number;
  Message?: string;
}

/**
 * Pull the latest English-language crypto news. Tries CryptoCompare first,
 * then falls back to public RSS feeds. Returns an empty array only when
 * every source fails — no mock fallback.
 */
export async function fetchCryptoNews(
  limit = 24,
  revalidateSec = 60,
): Promise<NewsItem[]> {
  const primary = await fetchCryptoCompare(limit, revalidateSec);
  if (primary.length > 0) return primary;

  // CryptoCompare failed — race every RSS source in parallel so we don't
  // chain 3 sequential network calls on a cold cache.
  console.warn("[news] CryptoCompare empty, falling back to RSS sources");
  const results = await Promise.all(
    RSS_SOURCES.map((src) => fetchRss(src.name, src.url, revalidateSec)),
  );
  const collected = results.flat();
  // Sort newest-first, dedupe by url, and trim to limit.
  const seen = new Set<string>();
  return collected
    .filter((n) => {
      if (seen.has(n.url)) return false;
      seen.add(n.url);
      return true;
    })
    .sort((a, b) => b.publishedAt - a.publishedAt)
    .slice(0, limit);
}

/* ─── Primary: CryptoCompare JSON ────────────────────────────────────── */

async function fetchCryptoCompare(
  limit: number,
  revalidateSec: number,
): Promise<NewsItem[]> {
  try {
    const res = await fetchWithTimeout(CRYPTOCOMPARE_ENDPOINT, {
      next: { revalidate: revalidateSec },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const json = (await res.json()) as CryptoCompareResponse;
    const items = json.Data;
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("empty payload");
    }
    return items.slice(0, limit).map(toNewsItem);
  } catch (err) {
    console.warn("[cryptocompare] upstream failed:", (err as Error).message);
    return [];
  }
}

/* ─── Fallback: RSS feeds ────────────────────────────────────────────── */

async function fetchRss(
  source: string,
  url: string,
  revalidateSec: number,
): Promise<NewsItem[]> {
  try {
    const res = await fetchWithTimeout(url, {
      next: { revalidate: revalidateSec },
      headers: {
        Accept: "application/rss+xml, application/xml, text/xml",
        "User-Agent": "Mozilla/5.0 (compatible; AvortyxNewsAggregator/1.0)",
      },
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const xml = await res.text();
    return parseRssItems(xml, source);
  } catch (err) {
    console.warn(`[rss:${source}] upstream failed:`, (err as Error).message);
    return [];
  }
}

/**
 * Minimal RSS 2.0 parser. We only need title/link/description/pubDate/image
 * — sufficient for every major crypto-news feed. Avoids pulling in an XML
 * library and keeps the bundle small.
 */
function parseRssItems(xml: string, source: string): NewsItem[] {
  const items: NewsItem[] = [];
  const itemRegex = /<item\b[^>]*>([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;
  let idx = 0;
  while ((match = itemRegex.exec(xml)) !== null) {
    const body = match[1];
    const title = extractTag(body, "title");
    const link = extractTag(body, "link");
    const description = extractTag(body, "description");
    const pubDate = extractTag(body, "pubDate") || extractTag(body, "dc:date");
    const imageUrl = extractImage(body);
    const categories = extractAllTags(body, "category");

    if (!title || !link) continue;

    const summary = stripHtml(description).trim();
    const publishedAt = pubDate ? Date.parse(pubDate) : Date.now() - idx * 60_000;
    items.push({
      id: link,
      title: stripHtml(title).trim(),
      summary: truncate(summary, 220),
      source,
      category: detectCategory(categories.join(" ") + " " + title),
      publishedAt: Number.isFinite(publishedAt) ? publishedAt : Date.now(),
      url: link,
      imageUrl: imageUrl || undefined,
      tint: tintFromString(title),
    });
    idx += 1;
  }
  return items;
}

function extractTag(body: string, tag: string): string {
  const re = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = body.match(re);
  if (!m) return "";
  // Strip CDATA wrappers if present.
  return m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
}

function extractAllTags(body: string, tag: string): string[] {
  const re = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi");
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    out.push(m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim());
  }
  return out;
}

/** Try a few common RSS image conventions. */
function extractImage(body: string): string {
  // <media:content url="..."/> or <media:thumbnail url="..."/>
  const media = body.match(/<media:(?:content|thumbnail)\b[^>]*url="([^"]+)"/i);
  if (media) return media[1];
  // <enclosure url="..." type="image/..."/>
  const encl = body.match(/<enclosure\b[^>]*url="([^"]+)"[^>]*type="image/i);
  if (encl) return encl[1];
  // First <img src=...> inside the description CDATA.
  const img = body.match(/<img\b[^>]*src="([^"]+)"/i);
  if (img) return img[1];
  return "";
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, "");
}

/* ─── Mapping helpers ────────────────────────────────────────────────── */

function toNewsItem(n: CryptoCompareItem): NewsItem {
  return {
    id: String(n.id ?? n.guid),
    title: n.title,
    summary: truncate(n.body, 220),
    source: n.source_info?.name ?? n.source ?? "Unknown",
    category: detectCategory(n.categories),
    publishedAt: (n.published_on ?? 0) * 1000,
    url: n.url,
    imageUrl: n.imageurl,
    tint: tintFromString(n.title),
  };
}

function truncate(s: string, max: number): string {
  if (!s) return "";
  if (s.length <= max) return s;
  return s.slice(0, max).trimEnd() + "…";
}

/** Map CryptoCompare's pipe-separated tag string onto our small enum. */
function detectCategory(raw: string): NewsCategory {
  const lower = (raw ?? "").toLowerCase();
  if (lower.includes("btc") || lower.includes("bitcoin")) return "Bitcoin";
  if (lower.includes("eth") || lower.includes("ethereum")) return "Ethereum";
  if (lower.includes("defi")) return "DeFi";
  if (lower.includes("nft")) return "NFT";
  if (lower.includes("layer") || lower.includes("l2") || lower.includes("scaling")) {
    return "Layer 2";
  }
  if (
    lower.includes("regul") ||
    lower.includes("sec") ||
    lower.includes("policy")
  ) {
    return "Regulation";
  }
  return "Markets";
}

/** Deterministic gradient backup if the real image fails to load. */
function tintFromString(s: string): [string, string] {
  const PALETTES: Array<[string, string]> = [
    ["#F7931A", "#FFB347"],
    ["#627EEA", "#8AA3F3"],
    ["#9945FF", "#14F195"],
    ["#1AAB9B", "#5BD9C8"],
    ["#E84142", "#F7A1A1"],
    ["#0052FF", "#4F8CFF"],
    ["#7B61FF", "#B3A3FF"],
    ["#C2A633", "#F0DC82"],
  ];
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return PALETTES[Math.abs(h) % PALETTES.length];
}
