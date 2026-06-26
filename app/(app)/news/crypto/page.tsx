import { fetchTopTokens } from "@/lib/coingecko";
import { fetchCryptoNews } from "@/lib/cryptocompare";

import { CoinMarketHeader, CoinMarketTabs } from "./coin-market-tabs";

/**
 * Coin Market — server component.
 *
 * Pulls real-time token + news data from CoinGecko and CryptoCompare on the
 * server, caches the response for 5 minutes (`revalidate: 300` inside each
 * fetcher), and hands the result to the client tab component. If either API
 * fails, the fetchers fall back to local mock data so the page never breaks.
 *
 * Forced dynamic so the build does not depend on third-party endpoints — a
 * 401 or slow upstream on CoinGecko / CryptoCompare / RSS would otherwise
 * hang `next build` until the 60s static-generation timeout fires. At
 * request time the in-fetch ISR cache (300s) still amortizes the work
 * across every visitor, so this is cheap.
 */
export const dynamic = "force-dynamic";

export default async function CoinMarketPage() {
  const [tokensResult, news] = await Promise.all([
    fetchTopTokens(250, 300), // 5-min cache for the initial server render
    fetchCryptoNews(24),
  ]);

  return (
    <div className="space-y-4">
      <CoinMarketHeader />
      <CoinMarketTabs tokens={tokensResult.tokens} news={news} />
    </div>
  );
}
