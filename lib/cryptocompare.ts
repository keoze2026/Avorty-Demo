/**
 * CryptoCompare news fetcher.
 *
 * Server-side only — Next.js caches the response for 5 minutes via
 * `revalidate: 300`. On failure we return the static mock seed so the
 * page never renders empty.
 *
 *   GET /data/v2/news/?lang=EN&excludeCategories=Sponsored
 */

import {
  MOCK_CRYPTO_NEWS,
  type NewsCategory,
  type NewsItem,
} from "./mock/news";

const ENDPOINT =
  "https://min-api.cryptocompare.com/data/v2/news/?lang=EN&excludeCategories=Sponsored";

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

/** Pull the latest English-language crypto news. Mock fallback on failure. */
export async function fetchCryptoNews(limit = 24): Promise<NewsItem[]> {
  try {
    const res = await fetch(ENDPOINT, {
      next: { revalidate: 300 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`CryptoCompare returned ${res.status}`);
    const json = (await res.json()) as CryptoCompareResponse;
    const items = json.Data;
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("CryptoCompare returned no articles");
    }
    return items.slice(0, limit).map(toNewsItem);
  } catch (err) {
    console.warn(
      "[cryptocompare] using MOCK_CRYPTO_NEWS fallback:",
      (err as Error).message,
    );
    return MOCK_CRYPTO_NEWS;
  }
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
