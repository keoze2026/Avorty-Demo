"use client";

import { Download, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DateRange } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const RANGES: Array<{ id: DateRange; label: string }> = [
  { id: "today", label: "Today" },
  { id: "7d", label: "7d" },
  { id: "14d", label: "14d" },
  { id: "30d", label: "30d" },
];

interface Props {
  range: DateRange;
  onRange: (r: DateRange) => void;
  campaignFilter: string;
  onCampaign: (id: string) => void;
  campaigns: Array<{ id: string; name: string }>;
  onRefresh: () => void;
  onExport: () => void;
}

export function ReportsToolbar({
  range,
  onRange,
  campaignFilter,
  onCampaign,
  campaigns,
  onRefresh,
  onExport,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3">
      <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
        Range
      </span>
      <div className="flex gap-1 rounded-md border border-border bg-secondary/40 p-0.5">
        {RANGES.map((r) => {
          const active = r.id === range;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onRange(r.id)}
              className={cn(
                "h-7 rounded px-2.5 text-xs font-mono transition-colors",
                active
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {r.label}
            </button>
          );
        })}
      </div>

      <div className="mx-1 h-5 w-px bg-border" />

      <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
        Campaign
      </span>
      <Select value={campaignFilter} onValueChange={onCampaign}>
        <SelectTrigger size="sm" className="h-8 w-52">
          <SelectValue placeholder="All campaigns" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All campaigns</SelectItem>
          {campaigns.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="ml-auto flex items-center gap-1.5">
        <Button variant="ghost" size="sm" className="h-8 gap-1.5" onClick={onRefresh}>
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={onExport}>
          <Download className="h-3.5 w-3.5" />
          Export
        </Button>
      </div>
    </div>
  );
}
