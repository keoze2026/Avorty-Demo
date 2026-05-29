"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Eye,
  Globe,
  RefreshCw,
} from "lucide-react";
import type { DateRange } from "react-day-picker";

import { ReportsFilterPopover, type ReportFilters } from "@/components/reports/reports-filter-popover";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TIMEZONES as TZ_OPTIONS } from "@/lib/timezones";
import { cn } from "@/lib/utils";

type RefreshOption =
  | "Off"
  | "Auto refresh"
  | "Every 10 s"
  | "Every 30 s"
  | "Every 1 min"
  | "Every 5 min";

const REFRESH_OPTIONS: RefreshOption[] = [
  "Off",
  "Auto refresh",
  "Every 10 s",
  "Every 30 s",
  "Every 1 min",
  "Every 5 min",
];

/** How many seconds before the option fires onRefresh again. 0 = no timer. */
const REFRESH_SECONDS: Record<RefreshOption, number> = {
  Off: 0,
  "Auto refresh": 30, // sensible default for the "smart" auto mode
  "Every 10 s": 10,
  "Every 30 s": 30,
  "Every 1 min": 60,
  "Every 5 min": 300,
};

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
  const [refresh, setRefresh] = useState<RefreshOption>("Auto refresh");

  // Live ticking countdown: seconds remaining until the next auto-refresh fires.
  // 0 whenever the option is "Off" or no interval is active.
  const intervalSec = REFRESH_SECONDS[refresh];
  const [remaining, setRemaining] = useState<number>(intervalSec);
  // Hold the latest onRefresh in a ref so the ticking effect doesn't re-arm
  // every render just because the parent passed a fresh callback.
  const refreshRef = useRef(onRefresh);
  useEffect(() => {
    refreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    if (intervalSec <= 0) {
      setRemaining(0);
      return;
    }
    setRemaining(intervalSec);
    const id = window.setInterval(() => {
      setRemaining((s) => {
        if (s <= 1) {
          // Fire the refresh and rearm.
          refreshRef.current();
          return intervalSec;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [intervalSec]);

  const active = intervalSec > 0;
  const countdownLabel = active ? `${refresh} · ${remaining}s` : refresh;

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

        {/* Date-range picker with preset shortcuts + Cancel/Apply (buffered) */}
        <DateRangePicker
          value={dateRange}
          onChange={onDateRangeChange}
          className={TOOLBAR_BTN_HOVER}
        />

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
              className={cn(
                "gap-2 tabular-nums",
                // When auto-refresh is armed, tint the chip in the portal accent
                // (and the dot below pulses) so the operator sees it ticking.
                active
                  ? "border-accent/50 bg-accent/10 text-accent hover:bg-accent/15 hover:text-accent"
                  : TOOLBAR_BTN_HOVER,
              )}
            >
              {active && (
                <span
                  aria-hidden
                  className="relative inline-flex h-1.5 w-1.5"
                >
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
                </span>
              )}
              {countdownLabel}
              <ChevronDown className={cn("h-3 w-3", active ? "opacity-80" : "opacity-60")} />
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
