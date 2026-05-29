/**
 * CoinGecko data fetcher.
 *
 * Server-side only — uses Next.js `fetch(..., { next: { revalidate: 300 } })`
 * so one upstream call covers every visitor for the next 5 minutes. If the
 * API errors, rate-limits, or times out we fall back to the static mock seed
 * so the page never breaks.
 *
 *   GET /api/v3/coins/markets?vs_currency=usd
 *      &order=market_cap_desc
 *      &per_page=50
 *      &page=1
 *      &sparkline=true
 *      &price_change_percentage=1h,24h,7d
 */

import { MOCK_TOKENS, type TokenEntry } from "./mock/tokens";

const ENDPOINT = "https://api.coingecko.com/api/v3/coins/markets";

interface CoinGeckoMarket {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  circulating_supply: number;
  price_change_percentage_1h_in_currency?: number;
  price_change_percentage_24h_in_currency?: number;
  price_change_percentage_7d_in_currency?: number;
  sparkline_in_7d?: { price: number[] };
}

/**
 * Re-fetch the top-N tokens. Returns mock data as a fallback.
 *
 * `revalidateSec` controls Next.js's fetch cache window. The initial server
 * render passes a relaxed 300s; the /api/tokens polling endpoint passes 20s
 * so client polls share a single upstream call every 20 seconds regardless
 * of how many visitors are connected.
 */
export async function fetchTopTokens(
  perPage = 250,
  revalidateSec = 300,
  page = 1,
): Promise<TokenEntry[]> {
  const url =
    `${ENDPOINT}?vs_currency=usd&order=market_cap_desc&per_page=${perPage}` +
    `&page=${page}&sparkline=true&price_change_percentage=1h,24h,7d`;
  try {
    const res = await fetch(url, {
      next: { revalidate: revalidateSec },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`CoinGecko returned ${res.status}`);
    const raw = (await res.json()) as CoinGeckoMarket[];
    if (!Array.isArray(raw) || raw.length === 0) {
      throw new Error("CoinGecko returned an empty payload");
    }
    return raw.map(toTokenEntry);
  } catch (err) {
    console.warn(
      "[coingecko] using MOCK_TOKENS fallback:",
      (err as Error).message,
    );
    // Only return the mock seed for the first page — pagination calls that
    // fail upstream return empty so the UI stops asking for more.
    return page === 1 ? MOCK_TOKENS : [];
  }
}

/** Map one CoinGecko market record onto our `TokenEntry` shape. */
function toTokenEntry(m: CoinGeckoMarket): TokenEntry {
  const sparkSource = m.sparkline_in_7d?.price ?? [];
  // CoinGecko returns ~168 hourly points — downsample to keep our SVG light.
  const sparkline = downsample(sparkSource, 25);

  return {
    rank: m.market_cap_rank ?? 0,
    symbol: m.symbol.toUpperCase(),
    name: m.name,
    logoUrl: m.image,
    // Fallback tint stays in case the image fails to load — keeps the row
    // visually balanced.
    tint: ["#5266E0", "#818CF8"],
    price: m.current_price ?? 0,
    change1h: m.price_change_percentage_1h_in_currency ?? 0,
    change24h: m.price_change_percentage_24h_in_currency ?? 0,
    change7d: m.price_change_percentage_7d_in_currency ?? 0,
    marketCap: m.market_cap ?? 0,
    volume24h: m.total_volume ?? 0,
    circulatingSupply: m.circulating_supply ?? 0,
    sparkline:
      sparkline.length >= 2
        ? sparkline
        : [m.current_price ?? 0, m.current_price ?? 0],
  };
}

function downsample(arr: number[], target: number): number[] {
  if (arr.length <= target) return arr;
  const step = arr.length / target;
  const out: number[] = [];
  for (let i = 0; i < target; i++) out.push(arr[Math.floor(i * step)]);
  return out;
}
