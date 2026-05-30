"use client";

import * as React from "react";

import { useTheme } from "next-themes";

interface Props {
  /** Token symbol, e.g. "BTC". Mapped to "BINANCE:BTCUSDT" for the chart. */
  symbol: string;
  /** Default interval in TradingView's symbol — "15", "60", "240", "D", "W". */
  interval?: string;
  /** Height of the chart container in px. */
  height?: number;
}

/**
 * TradingView advanced-chart iframe.
 *
 * The widget URL has no auth requirement and re-renders the moment the props
 * change. We re-key on `symbol`, `interval`, and `theme` so the iframe
 * remounts when the user navigates or toggles light/dark — TradingView
 * doesn't expose a postMessage API on the free widget to retheme in place.
 */
export function TradingViewChart({ symbol, interval = "60", height = 540 }: Props) {
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "light" ? "light" : "dark";

  // Most major coins trade on Binance against USDT; that's the most reliable
  // mapping for the public widget. The user can change the symbol from inside
  // the TradingView toolbar if they want to look at a different exchange.
  const tvSymbol = `BINANCE:${symbol.toUpperCase()}USDT`;

  const src =
    `https://s.tradingview.com/widgetembed/?` +
    new URLSearchParams({
      frameElementId: `tv-${symbol}`,
      symbol: tvSymbol,
      interval,
      hideideas: "1",
      hidetrading: "1",
      theme,
      style: "1", // candles
      timezone: "Etc/UTC",
      withdateranges: "1",
      hide_side_toolbar: "0",
      allow_symbol_change: "1",
      save_image: "1",
      details: "0",
      hotlist: "0",
      calendar: "0",
      studies_overrides: "{}",
      overrides: "{}",
      enabled_features: "[]",
      disabled_features: "[]",
      locale: "en",
    }).toString();

  return (
    <div
      className="overflow-hidden rounded-xl border border-border bg-card"
      style={{ height }}
    >
      <iframe
        key={`${tvSymbol}-${interval}-${theme}`}
        src={src}
        title={`${symbol} chart`}
        width="100%"
        height="100%"
        frameBorder={0}
        allow="clipboard-write"
        loading="lazy"
        style={{ display: "block" }}
      />
    </div>
  );
}
