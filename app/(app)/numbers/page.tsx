"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { CreateNumberPoolDialog } from "@/components/numbers/create-number-pool-dialog";
import { PoolsTable, POOL_COLUMNS } from "@/components/numbers/pools-table";
import { ProvisionNumberDialog } from "@/components/numbers/provision-number-dialog";
import {
  TrackNumbersTable,
  TRACK_NUMBERS_COLUMNS,
  deriveCountry,
  deriveName,
  deriveVendor,
} from "@/components/numbers/track-numbers-table";
import { PageHeader } from "@/components/shared/page-header";
import {
  PAGE_SIZE_OPTIONS,
  TableToolbar,
  type ColumnOption,
  type FilterOption,
  type PageSize,
  type SortOption,
} from "@/components/shared/table-toolbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROUTES } from "@/lib/constants";
import { useNumbersStore } from "@/lib/store/numbers-store";
import type { NumberPool, TrackingNumber } from "@/lib/types";

/* ─── Sort definitions ───────────────────────────────────────────────── */

type NumberSortKey =
  | "number-asc"
  | "number-desc"
  | "calls-desc"
  | "calls-asc"
  | "renew-soonest";

const NUMBER_SORT_OPTIONS: SortOption[] = [
  { id: "number-asc", label: "Number (A → Z)" },
  { id: "number-desc", label: "Number (Z → A)" },
  { id: "calls-desc", label: "Calls today (high → low)" },
  { id: "calls-asc", label: "Calls today (low → high)" },
  { id: "renew-soonest", label: "Renew (soonest)" },
];

type PoolSortKey = "name-asc" | "name-desc" | "size-desc" | "active-first";

const POOL_SORT_OPTIONS: SortOption[] = [
  { id: "name-asc", label: "Name (A → Z)" },
  { id: "name-desc", label: "Name (Z → A)" },
  { id: "size-desc", label: "Pool size (high → low)" },
  { id: "active-first", label: "Active first" },
];

/* ─── Default visible columns ────────────────────────────────────────── */

const DEFAULT_NUMBER_COLUMNS = new Set(TRACK_NUMBERS_COLUMNS.map((c) => c.id));
const DEFAULT_POOL_COLUMNS = new Set(POOL_COLUMNS.map((c) => c.id));

/* ─── Page ───────────────────────────────────────────────────────────── */

export default function NumbersPage() {
  const router = useRouter();
  const numbers = useNumbersStore((s) => s.numbers);
  const pools = useNumbersStore((s) => s.pools);
  const addPool = useNumbersStore((s) => s.addPool);

  const [provisionOpen, setProvisionOpen] = React.useState(false);
  const [createPoolOpen, setCreatePoolOpen] = React.useState(false);
  const [tab, setTab] = React.useState<"all" | "pools">("all");

  const onCreatePool = (input: {
    name: string;
    country: string;
    closedBrowserDelaySec: number;
    idleTimeSec: number;
    autoBuy: boolean;
  }) => {
    const created = addPool({
      name: input.name,
      // We don't pick a campaign at create-time — that happens on the detail page.
      campaignId: "",
      campaignName: "",
      rotationStrategy: "round-robin",
      numberCount: 0,
      callsToday: 0,
      active: true,
      country: input.country,
      closedBrowserDelaySec: input.closedBrowserDelaySec,
      idleTimeSec: input.idleTimeSec,
      autoBuy: input.autoBuy,
      phoneNumberFormat: "E164",
      attachedNumberIds: [],
      vendorEnabled: false,
      trafficSourcesEnabled: false,
      trafficSources: [],
    });
    toast.success(`Created "${input.name}"`);
    router.push(`${ROUTES.numbers}/pools/${created.id}`);
  };

  /* ── All Numbers tab state ── */
  const [allQuery, setAllQuery] = React.useState("");
  const [allPageSize, setAllPageSize] = React.useState<PageSize>(PAGE_SIZE_OPTIONS[1]);
  const [allSortKey, setAllSortKey] = React.useState<NumberSortKey>("number-asc");
  const [allTypeFilter, setAllTypeFilter] = React.useState<Set<string>>(new Set());
  const [allColumns, setAllColumns] = React.useState<Set<string>>(DEFAULT_NUMBER_COLUMNS);
  const [allSelected, setAllSelected] = React.useState<Set<string>>(new Set());

  const allFilterOptions = React.useMemo<FilterOption[]>(
    () => [
      { id: "local", label: "Local" },
      { id: "tollfree", label: "Toll-free" },
      { id: "international", label: "International" },
    ],
    [],
  );
  const allColumnOptions = React.useMemo<ColumnOption[]>(
    () => TRACK_NUMBERS_COLUMNS.map((c) => ({ ...c })),
    [],
  );

  const allRows = useFilteredNumbers(numbers, {
    query: allQuery,
    sortKey: allSortKey,
    typeFilter: allTypeFilter,
  });
  const allVisible = allRows.slice(0, allPageSize);

  /* ── Pools tab state ── */
  const [poolsQuery, setPoolsQuery] = React.useState("");
  const [poolsPageSize, setPoolsPageSize] = React.useState<PageSize>(PAGE_SIZE_OPTIONS[1]);
  const [poolsSortKey, setPoolsSortKey] = React.useState<PoolSortKey>("name-asc");
  const [poolsActiveFilter, setPoolsActiveFilter] = React.useState<Set<string>>(new Set());
  const [poolsColumns, setPoolsColumns] = React.useState<Set<string>>(DEFAULT_POOL_COLUMNS);
  const [poolsSelected, setPoolsSelected] = React.useState<Set<string>>(new Set());

  const poolsFilterOptions = React.useMemo<FilterOption[]>(
    () => [
      { id: "active", label: "Active" },
      { id: "paused", label: "Paused" },
    ],
    [],
  );
  const poolsColumnOptions = React.useMemo<ColumnOption[]>(
    () => POOL_COLUMNS.map((c) => ({ ...c })),
    [],
  );

  const poolsRows = useFilteredPools(pools, {
    query: poolsQuery,
    sortKey: poolsSortKey,
    activeFilter: poolsActiveFilter,
  });
  const poolsVisible = poolsRows.slice(0, poolsPageSize);

  /* ── Selection helpers (per tab) ── */
  const makeToggleAll =
    (visible: Array<{ id: string }>, current: Set<string>, set: (s: Set<string>) => void) =>
    () => {
      const allChecked = visible.length > 0 && visible.every((x) => current.has(x.id));
      const next = new Set(current);
      if (allChecked) visible.forEach((x) => next.delete(x.id));
      else visible.forEach((x) => next.add(x.id));
      set(next);
    };
  const makeToggle =
    (current: Set<string>, set: (s: Set<string>) => void) =>
    (id: string) => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      set(next);
    };

  const guardActions =
    (defaults: Set<string>) =>
    (next: Set<string>): Set<string> => {
      const guarded = new Set(next);
      guarded.add("actions");
      // Ensure we don't end up with an empty list — restore defaults if everything was hidden.
      if (guarded.size === 1) defaults.forEach((d) => guarded.add(d));
      return guarded;
    };

  return (
    <>
      <PageHeader
        title="Phone Numbers"
        description="Tracking numbers and number pools, organized by campaign."
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="gap-4">
        <TabsList>
          <TabsTrigger value="all">Tracking numbers</TabsTrigger>
          <TabsTrigger value="pools">Number pools</TabsTrigger>
        </TabsList>

        {/* ─── All numbers ─── */}
        <TabsContent value="all" className="space-y-4">
          <TableToolbar
            query={allQuery}
            onQuery={setAllQuery}
            pageSize={allPageSize}
            onPageSize={setAllPageSize}
            ctaLabel="Create"
            onCta={() => setProvisionOpen(true)}
            sort={{
              options: NUMBER_SORT_OPTIONS,
              value: allSortKey,
              onChange: (id) => setAllSortKey(id as NumberSortKey),
            }}
            filter={{
              label: "Filter by type",
              options: allFilterOptions,
              value: allTypeFilter,
              onChange: setAllTypeFilter,
            }}
            columns={{
              options: allColumnOptions,
              value: allColumns,
              onChange: (next) => setAllColumns(guardActions(DEFAULT_NUMBER_COLUMNS)(next)),
            }}
          />
          <TrackNumbersTable
            numbers={allVisible}
            visibleColumns={allColumns}
            selected={allSelected}
            onToggle={makeToggle(allSelected, setAllSelected)}
            onToggleAll={makeToggleAll(allVisible, allSelected, setAllSelected)}
          />
        </TabsContent>

        {/* ─── Pools ─── */}
        <TabsContent value="pools" className="space-y-4">
          <TableToolbar
            query={poolsQuery}
            onQuery={setPoolsQuery}
            pageSize={poolsPageSize}
            onPageSize={setPoolsPageSize}
            ctaLabel="Create"
            onCta={() => setCreatePoolOpen(true)}
            sort={{
              options: POOL_SORT_OPTIONS,
              value: poolsSortKey,
              onChange: (id) => setPoolsSortKey(id as PoolSortKey),
            }}
            filter={{
              label: "Filter by status",
              options: poolsFilterOptions,
              value: poolsActiveFilter,
              onChange: setPoolsActiveFilter,
            }}
            columns={{
              options: poolsColumnOptions,
              value: poolsColumns,
              onChange: (next) => setPoolsColumns(guardActions(DEFAULT_POOL_COLUMNS)(next)),
            }}
          />
          <PoolsTable
            pools={poolsVisible}
            visibleColumns={poolsColumns}
            selected={poolsSelected}
            onToggle={makeToggle(poolsSelected, setPoolsSelected)}
            onToggleAll={makeToggleAll(poolsVisible, poolsSelected, setPoolsSelected)}
          />
        </TabsContent>

      </Tabs>

      <ProvisionNumberDialog open={provisionOpen} onOpenChange={setProvisionOpen} />

      <CreateNumberPoolDialog
        open={createPoolOpen}
        onOpenChange={setCreatePoolOpen}
        onCreate={onCreatePool}
      />
    </>
  );
}

/* ─── Filtering / sorting hooks ──────────────────────────────────────── */

function useFilteredNumbers(
  numbers: TrackingNumber[],
  args: { query: string; sortKey: NumberSortKey; typeFilter: Set<string> },
): TrackingNumber[] {
  return React.useMemo(() => {
    let items = numbers;
    const q = args.query.trim().toLowerCase();
    if (q) {
      items = items.filter((n) => {
        const haystack = `${n.number} ${deriveName(n)} ${deriveCountry(n)} ${deriveVendor(n)} ${n.campaignName ?? ""} ${n.state ?? ""}`;
        return haystack.toLowerCase().includes(q);
      });
    }
    if (args.typeFilter.size > 0) {
      items = items.filter((n) => args.typeFilter.has(n.type));
    }
    const sorted = [...items];
    sorted.sort((a, b) => {
      switch (args.sortKey) {
        case "number-asc":
          return a.number.localeCompare(b.number);
        case "number-desc":
          return b.number.localeCompare(a.number);
        case "calls-desc":
          return b.callsToday - a.callsToday;
        case "calls-asc":
          return a.callsToday - b.callsToday;
        case "renew-soonest":
          return a.id.localeCompare(b.id); // deterministic — renew dates derive from id
      }
    });
    return sorted;
  }, [numbers, args.query, args.sortKey, args.typeFilter]);
}

function useFilteredPools(
  pools: NumberPool[],
  args: { query: string; sortKey: PoolSortKey; activeFilter: Set<string> },
): NumberPool[] {
  return React.useMemo(() => {
    let items = pools;
    const q = args.query.trim().toLowerCase();
    if (q) {
      items = items.filter((p) =>
        `${p.name} ${p.campaignName}`.toLowerCase().includes(q),
      );
    }
    if (args.activeFilter.size > 0) {
      const wantActive = args.activeFilter.has("active");
      const wantPaused = args.activeFilter.has("paused");
      items = items.filter((p) => (p.active ? wantActive : wantPaused));
    }
    const sorted = [...items];
    sorted.sort((a, b) => {
      switch (args.sortKey) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "size-desc":
          return b.numberCount - a.numberCount;
        case "active-first":
          return Number(b.active) - Number(a.active) || a.name.localeCompare(b.name);
      }
    });
    return sorted;
  }, [pools, args.query, args.sortKey, args.activeFilter]);
}

