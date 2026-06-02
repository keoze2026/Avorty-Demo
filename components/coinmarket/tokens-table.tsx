"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ChevronsUpDown, Star } from "lucide-react";

import { Sparkline } from "./sparkline";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/shared/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber, formatPercent } from "@/lib/format";
import {
  formatCompactCurrency,
  formatSupply,
  formatTokenPrice,
  type TokenEntry,
} from "@/lib/mock/tokens";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

type SortKey =
  | "rank"
  | "price"
  | "change1h"
  | "change24h"
  | "change7d"
  | "marketCap"
  | "volume24h"
  | "circulatingSupply";

type SortDir = "asc" | "desc";

interface ColumnDef {
  id: SortKey;
  label: string;
  /** When true, column right-aligns its values (numbers / currency). */
  numeric?: boolean;
}

const COLUMNS: ColumnDef[] = [
  { id: "price", label: "Price", numeric: true },
  { id: "change1h", label: "1h %", numeric: true },
  { id: "change24h", label: "24h %", numeric: true },
  { id: "change7d", label: "7d %", numeric: true },
  { id: "marketCap", label: "Market Cap", numeric: true },
  { id: "volume24h", label: "Volume (24h)", numeric: true },
  { id: "circulatingSupply", label: "Circulating Supply", numeric: true },
];

const COLUMN_LABEL_KEYS: Record<SortKey, string> = {
  rank: "toolsUI.news.tokens.columns.rank",
  price: "toolsUI.news.tokens.columns.price",
  change1h: "toolsUI.news.tokens.columns.change1h",
  change24h: "toolsUI.news.tokens.columns.change24h",
  change7d: "toolsUI.news.tokens.columns.change7d",
  marketCap: "toolsUI.news.tokens.columns.marketCap",
  volume24h: "toolsUI.news.tokens.columns.volume24h",
  circulatingSupply: "toolsUI.news.tokens.columns.circulatingSupply",
};

interface Props {
  tokens: TokenEntry[];
  pageSize?: number;
  /** Rough/exact upper bound used by the Pagination control. Falls back to
   *  `tokens.length` when undefined. */
  estimatedTotal?: number;
  /** True while the parent is fetching the next block. Surfaces a tiny
   *  loading row at the bottom of the table. */
  loading?: boolean;
  /** Fires whenever the table's current page changes — lets the parent
   *  decide if it needs to fetch more tokens upstream. */
  onPageChange?: (page: number, pageSize: number) => void;
}

export function TokensTable({
  tokens,
  pageSize = 100,
  estimatedTotal,
  loading = false,
  onPageChange,
}: Props) {
  const { t } = useTranslation();
  const [query, setQuery] = React.useState("");
  const [sortKey, setSortKey] = React.useState<SortKey>("rank");
  const [sortDir, setSortDir] = React.useState<SortDir>("asc");
  const [page, setPage] = React.useState(0);
  const [favorites, setFavorites] = React.useState<Set<string>>(new Set());

  // Fire onPageChange whenever the page changes so the parent can fetch
  // more tokens on demand.
  React.useEffect(() => {
    onPageChange?.(page, pageSize);
  }, [page, pageSize, onPageChange]);

  const toggleFav = (sym: string) => {
    setFavorites((curr) => {
      const next = new Set(curr);
      next.has(sym) ? next.delete(sym) : next.add(sym);
      return next;
    });
  };

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tokens;
    return tokens.filter((t) =>
      `${t.name} ${t.symbol}`.toLowerCase().includes(q),
    );
  }, [tokens, query]);

  const sorted = React.useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const diff = av - bv;
      return sortDir === "asc" ? diff : -diff;
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  // Reset to page 0 when filters / sort change.
  React.useEffect(() => {
    setPage(0);
  }, [query, sortKey, sortDir]);

  const start = page * pageSize;
  const visible = sorted.slice(start, start + pageSize);

  const requestSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      // Numeric columns default to "high → low" because that's what operators expect.
      setSortDir(key === "rank" ? "asc" : "desc");
    }
  };

  return (
    <section>
      <header className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-foreground">{t("toolsUI.news.tokens.title")}</h2>
          <p className="text-xs text-muted-foreground">
            {t("toolsUI.news.tokens.countSummary")
              .replace("{count}", formatNumber(filtered.length))
              .replace(
                "{sort}",
                t(COLUMN_LABEL_KEYS[sortKey] ?? "toolsUI.news.tokens.columns.rank").toLowerCase(),
              )}
          </p>
        </div>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("toolsUI.news.tokens.searchPlaceholder")}
          className="h-9 w-64 text-xs"
        />
      </header>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <Table className="min-w-[1280px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-3 w-8 text-left"></TableHead>
                <TableHead className="w-12 text-left">
                  <SortHeader
                    label={t("toolsUI.news.tokens.columns.rank")}
                    active={sortKey === "rank"}
                    dir={sortDir}
                    onClick={() => requestSort("rank")}
                  />
                </TableHead>
                <TableHead className="text-left">{t("toolsUI.news.tokens.columns.name")}</TableHead>
                {COLUMNS.map((col) => (
                  <TableHead key={col.id} className="text-right">
                    <SortHeader
                      label={t(COLUMN_LABEL_KEYS[col.id])}
                      active={sortKey === col.id}
                      dir={sortDir}
                      onClick={() => requestSort(col.id)}
                    />
                  </TableHead>
                ))}
                <TableHead className="pr-4 text-right">{t("toolsUI.news.tokens.columns.last7Days")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={4 + COLUMNS.length}
                    className="py-10 text-center text-xs text-muted-foreground"
                  >
                    {t("toolsUI.news.tokens.empty")}
                  </TableCell>
                </TableRow>
              ) : (
                visible.map((tk) => (
                  <TokenRow
                    key={tk.symbol}
                    token={tk}
                    favorite={favorites.has(tk.symbol)}
                    onToggleFav={() => toggleFav(tk.symbol)}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Pagination
        page={page}
        pageSize={pageSize}
        total={estimatedTotal ?? sorted.length}
        onPage={setPage}
      />

      {loading && (
        <div className="text-center text-[11px] text-muted-foreground">
          {t("toolsUI.news.tokens.loadingMore")}
        </div>
      )}
    </section>
  );
}

/* ─── Row ───────────────────────────────────────────────────────────── */

const POSITIVE = "text-[oklch(0.5_0.18_155)] dark:text-[oklch(0.78_0.18_155)]";
const NEGATIVE = "text-destructive";

function TokenRow({
  token,
  favorite,
  onToggleFav,
}: {
  token: TokenEntry;
  favorite: boolean;
  onToggleFav: () => void;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  // Use the 7-day move to color both the change pills and the sparkline.
  const sparkColor =
    token.change7d >= 0 ? "oklch(0.65 0.18 155)" : "oklch(0.6 0.18 25)";

  // Flash the price cell green/red briefly when the price changes between polls.
  const prevPriceRef = React.useRef(token.price);
  const [flash, setFlash] = React.useState<"up" | "down" | null>(null);
  React.useEffect(() => {
    if (prevPriceRef.current === token.price) return;
    const direction = token.price > prevPriceRef.current ? "up" : "down";
    prevPriceRef.current = token.price;
    setFlash(direction);
    const id = window.setTimeout(() => setFlash(null), 700);
    return () => window.clearTimeout(id);
  }, [token.price]);

  // Whole row navigates to the detail page; the favorite button stops
  // propagation so clicking the star doesn't trigger navigation.
  const href = `/news/crypto/${token.symbol.toLowerCase()}`;
  const onRowClick = () => router.push(href);

  return (
    <TableRow className="cursor-pointer" onClick={onRowClick}>
      <TableCell className="pl-3 text-left" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onToggleFav}
          aria-label={favorite ? t("toolsUI.news.tokens.unstarAria") : t("toolsUI.news.tokens.starAria")}
          className={cn(
            "inline-flex h-6 w-6 items-center justify-center rounded transition-colors",
            favorite
              ? "text-[color:var(--warning)]"
              : "text-muted-foreground/50 hover:text-muted-foreground",
          )}
        >
          <Star
            className={cn("h-3.5 w-3.5", favorite && "fill-current")}
          />
        </button>
      </TableCell>
      <TableCell className="text-left font-mono text-xs text-muted-foreground tabular-nums">
        {token.rank}
      </TableCell>
      <TableCell className="text-left">
        <div className="flex items-center gap-2.5 transition-colors group-hover:text-accent">
          {token.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={token.logoUrl}
              alt={`${token.symbol} logo`}
              width={28}
              height={28}
              loading="lazy"
              className="h-7 w-7 shrink-0 rounded-full bg-secondary/30"
            />
          ) : (
            <span
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-background shadow"
              style={{
                background: `linear-gradient(135deg, ${token.tint[0]}, ${token.tint[1]})`,
              }}
            >
              {token.symbol.slice(0, 3)}
            </span>
          )}
          <span className="leading-tight">
            <span className="block text-sm font-medium text-foreground transition-colors hover:text-accent">
              {token.name}
            </span>
            <span className="block text-[11px] text-muted-foreground">
              {token.symbol}
            </span>
          </span>
        </div>
      </TableCell>
      <TableCell
        className={cn(
          // CMC-style: the number itself goes bright green / red briefly
          // when a poll delivers a new price, then fades back to default.
          "text-right tabular-nums font-medium transition-colors duration-700",
          flash === "up" && "text-[oklch(0.78_0.18_155)]",
          flash === "down" && "text-destructive",
        )}
      >
        {formatTokenPrice(token.price)}
      </TableCell>
      <ChangeCell value={token.change1h} />
      <ChangeCell value={token.change24h} />
      <ChangeCell value={token.change7d} />
      <TableCell className="text-right tabular-nums">
        {formatCompactCurrency(token.marketCap)}
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {formatCompactCurrency(token.volume24h)}
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {formatSupply(token.circulatingSupply, token.symbol)}
      </TableCell>
      <TableCell className="pr-4">
        <div className="flex justify-end">
          <Sparkline data={token.sparkline} color={sparkColor} />
        </div>
      </TableCell>
    </TableRow>
  );
}

function ChangeCell({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <TableCell
      className={cn(
        "text-right tabular-nums",
        positive ? POSITIVE : NEGATIVE,
      )}
    >
      <span className="inline-flex items-center gap-0.5">
        {positive ? (
          <ArrowUp className="h-3 w-3" />
        ) : (
          <ArrowDown className="h-3 w-3" />
        )}
        {formatPercent(Math.abs(value), 2)}
      </span>
    </TableCell>
  );
}

/* ─── Sort header ───────────────────────────────────────────────────── */

function SortHeader({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 transition-colors",
        active ? "text-foreground" : "hover:text-foreground",
      )}
    >
      {label}
      {active ? (
        dir === "asc" ? (
          <ArrowUp className="h-3 w-3" />
        ) : (
          <ArrowDown className="h-3 w-3" />
        )
      ) : (
        <ChevronsUpDown className="h-3 w-3 opacity-50" />
      )}
    </button>
  );
}
