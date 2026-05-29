import { NextResponse, type NextRequest } from "next/server";

import { fetchTopTokens } from "@/lib/coingecko";

/**
 * GET /api/tokens?page=N&perPage=M
 *
 * Polled by the Coin Market client every 20s for block 1, and called on
 * demand when the user paginates past tokens we haven't fetched yet. The
 * inner CoinGecko fetch uses a 20s `revalidate` keyed on URL+page, so each
 * (page, perPage) combo costs at most one upstream call every 20 seconds
 * regardless of visitor count.
 */
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const perPage = Math.max(
    1,
    Math.min(250, parseInt(searchParams.get("perPage") ?? "250", 10) || 250),
  );

  const tokens = await fetchTopTokens(perPage, 20, page);
  return NextResponse.json(tokens);
}
