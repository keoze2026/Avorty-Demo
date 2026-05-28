"use client";

import { useMemo, useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  Eye,
  Globe,
  RefreshCw,
} from "lucide-react";
import type { DateRange } from "react-day-picker";

import { ReportsFilterPopover, type ReportFilters } from "@/components/reports/reports-filter-popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TIMEZONES as TZ_OPTIONS } from "@/lib/timezones";
import { cn } from "@/lib/utils";

const REFRESH_OPTIONS = [
  "Off",
  "Auto refresh",
  "Every 30 s",
  "Every 1 min",
  "Every 5 min",
] as const;

/**
 * Subtle hover override used on every outline button in the toolbar.
 *
 * shadcn's outline variant default is `hover:bg-accent hover:text-accent-foreground`,
 * which on Vortyx's dark theme flashes the button to bright teal + near-black
 * text — readable in isolation but jarring here, and easy to mistake for
 * disabled. Swap for a muted background that keeps `--foreground` text.
 */
const TOOLBAR_BTN_HOVER =
  "hover:bg-muted hover:text-foreground dark:hover:bg-muted/70";

function formatYMD(d: Date) {
  return `${d.getFullYear()}-${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
}

interface ReportsToolbarProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onRefresh: () => void;
  filters: ReportFilters;
  onFiltersChange: (filters: ReportFilters) => void;
}

export function ReportsToolbar({
  dateRange,
  onDateRangeChange,
  onRefresh,
  filters,
  onFiltersChange,
}: ReportsToolbarProps) {
  // Default to Eastern Time — first entry in the curated list that matches.
  const [tz, setTz] = useState<string>(
    TZ_OPTIONS.find((t) => t.iana === "America/New_York")?.label ??
      TZ_OPTIONS[0].label,
  );
  const [refresh, setRefresh] = useState<(typeof REFRESH_OPTIONS)[number]>(
    "Auto refresh",
  );

  const dateLabel = useMemo(() => {
    if (!dateRange?.from) return "Select date range";
    const from = formatYMD(dateRange.from);
    const to = dateRange.to ? formatYMD(dateRange.to) : from;
    return `${from} — ${to}`;
  }, [dateRange]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className={cn("gap-1.5 px-2.5", TOOLBAR_BTN_HOVER)}
        aria-label="View settings"
      >
        <Eye className="h-4 w-4" />
        <ChevronDown className="h-3 w-3 opacity-60" />
      </Button>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn("gap-2", TOOLBAR_BTN_HOVER)}
            >
              <Globe className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="truncate max-w-[18rem]">{tz}</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-h-80 w-80 overflow-y-auto">
            {TZ_OPTIONS.map((t) => (
              <DropdownMenuItem
                key={t.iana}
                onSelect={() => setTz(t.label)}
                className={cn(tz === t.label && "text-accent")}
              >
                {t.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Real date-range picker — Popover + react-day-picker in range mode */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn("gap-2", TOOLBAR_BTN_HOVER)}
            >
              <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{dateLabel}</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-auto p-0">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={onDateRangeChange}
              numberOfMonths={2}
              defaultMonth={dateRange?.from}
            />
          </PopoverContent>
        </Popover>

        <ReportsFilterPopover filters={filters} onChange={onFiltersChange} />

        <Button
          variant="outline"
          size="icon"
          className={cn("h-9 w-9", TOOLBAR_BTN_HOVER)}
          aria-label="Refresh"
          onClick={onRefresh}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn("gap-2", TOOLBAR_BTN_HOVER)}
            >
              {refresh}
              <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {REFRESH_OPTIONS.map((r) => (
              <DropdownMenuItem
                key={r}
                onSelect={() => setRefresh(r)}
                className={cn(refresh === r && "text-accent")}
              >
                {r}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
