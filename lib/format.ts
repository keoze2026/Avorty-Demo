/**
 * Display formatters. All deterministic — fine for SSR.
 */

const NF = new Intl.NumberFormat("en-US");
const CF = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const CF_PRECISE = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatNumber(n: number) {
  return NF.format(n);
}

/** "1234" → "1.2K", "1234567" → "1.2M" */
export function formatCompact(n: number) {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function formatCurrency(n: number, precise = false) {
  return precise ? CF_PRECISE.format(n) : CF.format(n);
}

export function formatPercent(n: number, fractionDigits = 1) {
  return `${n.toFixed(fractionDigits)}%`;
}

/** Seconds → "3m 24s" or "47s" */
export function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s === 0 ? `${m}m` : `${m}m ${s}s`;
}

/** Pad seconds → "MM:SS" timer style */
export function formatTimer(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

const RELATIVE_THRESHOLDS: Array<[number, string]> = [
  [60, "s"],
  [3600, "m"],
  [86400, "h"],
];

/** Timestamp (ms) → "2m ago", "5h ago" — small + monospace-safe. */
export function formatRelativeTime(timestamp: number, now = Date.now()) {
  const diff = Math.max(0, Math.floor((now - timestamp) / 1000));
  if (diff < 10) return "just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// Reference to avoid unused-import warning if a consumer only takes the array.
void RELATIVE_THRESHOLDS;
