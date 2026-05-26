"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ViewToggle, type ViewMode } from "@/components/shared/view-toggle";
import type { BuyerStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export type BuyerStatusFilter = "all" | BuyerStatus;

const STATUS_OPTIONS: Array<{ id: BuyerStatusFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "paused", label: "Paused" },
  { id: "capped", label: "Capped" },
  { id: "pending", label: "Pending" },
];

interface BuyersToolbarProps {
  query: string;
  onQuery: (q: string) => void;
  status: BuyerStatusFilter;
  onStatus: (s: BuyerStatusFilter) => void;
  sort: "spend" | "calls" | "bid" | "recent";
  onSort: (s: BuyersToolbarProps["sort"]) => void;
  view: ViewMode;
  onView: (v: ViewMode) => void;
  count: number;
  total: number;
}

export function BuyersToolbar({
  query,
  onQuery,
  status,
  onStatus,
  sort,
  onSort,
  view,
  onView,
  count,
  total,
}: BuyersToolbarProps) {
  const filtered = query || status !== "all";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search buyers, contacts, orgs…"
            className="h-9 w-64 pl-8"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex gap-1 rounded-md border border-border bg-secondary/40 p-0.5">
          {STATUS_OPTIONS.map((s) => {
            const active = s.id === status;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onStatus(s.id)}
                className={cn(
                  "h-7 rounded px-2 text-xs font-mono transition-colors",
                  active
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        <Select value={sort} onValueChange={(v) => onSort(v as BuyersToolbarProps["sort"])}>
          <SelectTrigger size="sm" className="h-9 w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="spend">Sort: Spend (today)</SelectItem>
            <SelectItem value="calls">Sort: Calls (today)</SelectItem>
            <SelectItem value="bid">Sort: Bid amount</SelectItem>
            <SelectItem value="recent">Sort: Most recent</SelectItem>
          </SelectContent>
        </Select>

        {filtered && (
          <Button variant="ghost" size="sm" onClick={() => { onQuery(""); onStatus("all"); }}>
            Clear
          </Button>
        )}

        <span className="ml-auto text-[11px] font-mono text-muted-foreground sm:ml-2">
          {count} of {total}
        </span>
      </div>

      <ViewToggle value={view} onChange={onView} />
    </div>
  );
}
