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
import type { CampaignStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export type StatusFilter = "all" | CampaignStatus;

const STATUS_OPTIONS: Array<{ id: StatusFilter; label: string }> = [
  { id: "all", label: "All statuses" },
  { id: "active", label: "Active" },
  { id: "paused", label: "Paused" },
  { id: "draft", label: "Draft" },
  { id: "archived", label: "Archived" },
];

interface CampaignsToolbarProps {
  query: string;
  onQuery: (q: string) => void;
  vertical: string;
  onVertical: (v: string) => void;
  verticals: string[];
  status: StatusFilter;
  onStatus: (s: StatusFilter) => void;
  view: ViewMode;
  onView: (v: ViewMode) => void;
  /** Total matching after filters; for the result count chip. */
  count: number;
  total: number;
}

export function CampaignsToolbar({
  query,
  onQuery,
  vertical,
  onVertical,
  verticals,
  status,
  onStatus,
  view,
  onView,
  count,
  total,
}: CampaignsToolbarProps) {
  const filtered = query || vertical !== "all" || status !== "all";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search campaigns…"
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

        {/* Vertical */}
        <Select value={vertical} onValueChange={onVertical}>
          <SelectTrigger size="sm" className="h-9 w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All verticals</SelectItem>
            {verticals.map((v) => (
              <SelectItem key={v} value={v}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status pills */}
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

        {filtered && (
          <Button variant="ghost" size="sm" onClick={() => { onQuery(""); onVertical("all"); onStatus("all"); }}>
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
