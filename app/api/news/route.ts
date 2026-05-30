import { NextResponse, type NextRequest } from "next/server";

import { fetchCryptoNews } from "@/lib/cryptocompare";

/**
 * GET /api/news?limit=N
 *
 * Polled by the Coin Market client every ~30s so the Crypto News tab refreshes
 * without a full page reload. The inner CryptoCompare fetch uses a 30s
 * `revalidate` so visitors share one upstream call per window — well within
 * the free-tier rate limit.
 */
export const dynamic = "force-dynamic";

/** Upstream cache window (seconds). Synced with the client poll interval. */
const UPSTREAM_REVALIDATE_SEC = 30;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.max(
    1,
    Math.min(100, parseInt(searchParams.get("limit") ?? "24", 10) || 24),
  );

  const news = await fetchCryptoNews(limit, UPSTREAM_REVALIDATE_SEC);
  const res = NextResponse.json({ news });
  // Browser/CDN should never cache — the only caching we want is the upstream
  // Next.js fetch cache shared across visitors.
  res.headers.set("Cache-Control", "no-store, must-revalidate");
  return res;
}
