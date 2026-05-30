import { NextResponse, type NextRequest } from "next/server";

import { fetchTopTokens } from "@/lib/coingecko";

/**
 * GET /api/tokens?page=N&perPage=M
 *
 * Polled by the Coin Market client every few seconds for block 1, and called
 * on demand when the user paginates past tokens we haven't fetched yet. The
 * inner CoinGecko fetch uses a short `revalidate` keyed on URL+page, so each
 * (page, perPage) combo costs at most one upstream call per window regardless
 * of visitor count — keeping us under CoinGecko's free-tier rate limit while
 * still feeling live in the UI.
 */
export const dynamic = "force-dynamic";

/** Upstream cache window (seconds). Short = fresher numbers in the UI. */
const UPSTREAM_REVALIDATE_SEC = 8;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const perPage = Math.max(
    1,
    Math.min(250, parseInt(searchParams.get("perPage") ?? "250", 10) || 250),
  );

  const result = await fetchTopTokens(perPage, UPSTREAM_REVALIDATE_SEC, page);
  const res = NextResponse.json(result);
  // Tell intermediaries (browser, CDN) not to cache — the only caching we want
  // is the upstream Next.js fetch cache. Every browser request reaches us and
  // gets the freshest value the cache has.
  res.headers.set("Cache-Control", "no-store, must-revalidate");
  return res;
}
