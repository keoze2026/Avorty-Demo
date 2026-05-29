import { PageHeader } from "@/components/shared/page-header";
import { fetchTopTokens } from "@/lib/coingecko";
import { fetchCryptoNews } from "@/lib/cryptocompare";

import { CoinMarketTabs } from "./coin-market-tabs";

/**
 * Coin Market — server component.
 *
 * Pulls real-time token + news data from CoinGecko and CryptoCompare on the
 * server, caches the response for 5 minutes (`revalidate: 300` inside each
 * fetcher), and hands the result to the client tab component. If either API
 * fails, the fetchers fall back to local mock data so the page never breaks.
 */
export default async function CoinMarketPage() {
  const [tokens, news] = await Promise.all([
    fetchTopTokens(250, 300), // 5-min cache for the initial server render
    fetchCryptoNews(24),
  ]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Coin Market"
        description="Live token tape with sparklines plus the latest crypto headlines."
      />
      <CoinMarketTabs tokens={tokens} news={news} />
    </div>
  );
}
