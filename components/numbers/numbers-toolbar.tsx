"use client";

import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { NumberStatus, NumberType } from "@/lib/types";

interface Props {
  query: string;
  onQuery: (q: string) => void;
  type: "all" | NumberType;
  onType: (t: Props["type"]) => void;
  status: "all" | NumberStatus;
  onStatus: (s: Props["status"]) => void;
  /** Right-side label (e.g. "8 of 36") */
  countLabel?: string;
}

export function NumbersToolbar({ query, onQuery, type, onType, status, onStatus, countLabel }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search numbers, campaigns, cities…"
          className="h-9 w-72 pl-8"
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

      <Select value={type} onValueChange={(v) => onType(v as Props["type"])}>
        <SelectTrigger size="sm" className="h-9 w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          <SelectItem value="local">Local</SelectItem>
          <SelectItem value="tollfree">Toll-free</SelectItem>
          <SelectItem value="international">International</SelectItem>
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={(v) => onStatus(v as Props["status"])}>
        <SelectTrigger size="sm" className="h-9 w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="paused">Paused</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="expired">Expired</SelectItem>
        </SelectContent>
      </Select>

      {countLabel && (
        <span className="ml-auto text-[11px] font-mono text-muted-foreground">{countLabel}</span>
      )}
    </div>
  );
}
