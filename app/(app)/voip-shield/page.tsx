"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Info, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { CreateVoipShieldDialog } from "@/components/suppression/create-voip-shield-dialog";
import {
  PAGE_SIZE_OPTIONS,
  SuppressionToolbar,
  type ColumnOption,
  type FilterOption,
  type PageSize,
  type SortOption,
} from "@/components/suppression/suppression-toolbar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROUTES } from "@/lib/constants";
import { formatNumber } from "@/lib/format";
import { MOCK_CAMPAIGNS } from "@/lib/mock/campaigns";
import type { VoipShieldEntry } from "@/lib/mock/suppression";
import { useVoipShieldStore } from "@/lib/store/voip-shield-store";

type SortKey = "name-asc" | "name-desc" | "size-desc" | "size-asc";

const SORT_OPTIONS: SortOption[] = [
  { id: "name-asc", label: "Name (A → Z)" },
  { id: "name-desc", label: "Name (Z → A)" },
  { id: "size-desc", label: "Size (high → low)" },
  { id: "size-asc", label: "Size (low → high)" },
];

const COLUMN_OPTIONS: ColumnOption[] = [
  { id: "name", label: "Name" },
  { id: "campaign", label: "Campaign" },
  { id: "size", label: "Size" },
  { id: "actions", label: "Actions", required: true },
];
const DEFAULT_COLUMNS = new Set(COLUMN_OPTIONS.map((c) => c.id));

const CAMPAIGN_NAME_BY_ID = new Map(MOCK_CAMPAIGNS.map((c) => [c.id, c.name]));

function campaignLabel(entry: VoipShieldEntry): string {
  if (entry.campaignIds.length === 0) return "All Campaigns";
  if (entry.campaignIds.length === 1) {
    return CAMPAIGN_NAME_BY_ID.get(entry.campaignIds[0]) ?? entry.campaignIds[0];
  }
  const first = CAMPAIGN_NAME_BY_ID.get(entry.campaignIds[0]) ?? entry.campaignIds[0];
  return `${first} +${entry.campaignIds.length - 1}`;
}

export default function VoipShieldPage() {
  const router = useRouter();
  const shields = useVoipShieldStore((s) => s.shields);
  const add = useVoipShieldStore((s) => s.add);
  const remove = useVoipShieldStore((s) => s.remove);

  const [query, setQuery] = React.useState("");
  const [pageSize, setPageSize] = React.useState<PageSize>(PAGE_SIZE_OPTIONS[1]);
  const [page, setPage] = React.useState(0);
  const [sortKey, setSortKey] = React.useState<SortKey>("name-asc");
  const [campaignFilter, setCampaignFilter] = React.useState<Set<string>>(new Set());
  const [visibleColumns, setVisibleColumns] = React.useState<Set<string>>(DEFAULT_COLUMNS);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [createOpen, setCreateOpen] = React.useState(false);
  const [removing, setRemoving] = React.useState<VoipShieldEntry | null>(null);

  React.useEffect(() => {
    setPage(0);
  }, [query, sortKey, campaignFilter, pageSize]);

  // Build the campaign filter option list — "All Campaigns" + every known campaign.
  const filterOptions = React.useMemo<FilterOption[]>(
    () => [
      { id: "__all__", label: "All Campaigns" },
      ...MOCK_CAMPAIGNS.map((c) => ({ id: c.id, label: c.name })),
    ],
    [],
  );

  const rows = React.useMemo(() => {
    let items = shields;
    const q = query.trim().toLowerCase();
    if (q) {
      items = items.filter((e) =>
        `${e.name} ${campaignLabel(e)}`.toLowerCase().includes(q),
      );
    }
    if (campaignFilter.size > 0) {
      items = items.filter((e) => {
        if (campaignFilter.has("__all__") && e.campaignIds.length === 0) return true;
        return e.campaignIds.some((id) => campaignFilter.has(id));
      });
    }
    const sorted = [...items];
    sorted.sort((a, b) => {
      switch (sortKey) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "size-desc":
          return b.blockedCarriers.length - a.blockedCarriers.length;
        case "size-asc":
          return a.blockedCarriers.length - b.blockedCarriers.length;
      }
    });
    return sorted;
  }, [shields, query, sortKey, campaignFilter]);

  const visible = rows.slice(page * pageSize, page * pageSize + pageSize);
  const allChecked = visible.length > 0 && visible.every((e) => selected.has(e.id));

  const toggleAll = () => {
    setSelected((curr) => {
      const next = new Set(curr);
      if (allChecked) visible.forEach((e) => next.delete(e.id));
      else visible.forEach((e) => next.add(e.id));
      return next;
    });
  };

  const toggle = (id: string) => {
    setSelected((curr) => {
      const next = new Set(curr);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const onCreate = (name: string) => {
    const created = add(name);
    toast.success(`Created "${name}"`);
    router.push(`${ROUTES.voipShield}/${created.id}`);
  };

  const confirmRemove = (entry: VoipShieldEntry) => {
    remove(entry.id);
    setSelected((curr) => {
      const next = new Set(curr);
      next.delete(entry.id);
      return next;
    });
    toast.success(`Removed "${entry.name}"`);
    setRemoving(null);
  };

  return (
    <>
      <PageHeader
        title="VoIP Shield"
        description={
          <span className="inline-flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5" />
            The feature is paid, $0.01 per call
          </span>
        }
      />

      <SuppressionToolbar
        query={query}
        onQuery={setQuery}
        pageSize={pageSize}
        onPageSize={setPageSize}
        ctaLabel="Create"
        onCta={() => setCreateOpen(true)}
        sort={{
          options: SORT_OPTIONS,
          value: sortKey,
          onChange: (id) => setSortKey(id as SortKey),
        }}
        filter={{
          label: "Filter by campaign",
          options: filterOptions,
          value: campaignFilter,
          onChange: setCampaignFilter,
        }}
        columns={{
          options: COLUMN_OPTIONS,
          value: visibleColumns,
          onChange: (next) => {
            // The required "actions" column must always stay visible.
            const guarded = new Set(next);
            guarded.add("actions");
            setVisibleColumns(guarded);
          },
        }}
      />

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4 w-10 text-left">
                  <Checkbox
                    checked={allChecked}
                    onCheckedChange={toggleAll}
                    aria-label="Select all"
                  />
                </TableHead>
                {visibleColumns.has("name") && (
                  <TableHead className="text-left">Name</TableHead>
                )}
                {visibleColumns.has("campaign") && (
                  <TableHead className="text-left">Campaign</TableHead>
                )}
                {visibleColumns.has("size") && (
                  <TableHead className="text-left">Size</TableHead>
                )}
                <TableHead className="pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={1 + visibleColumns.size}
                    className="py-10 text-center text-xs text-muted-foreground"
                  >
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                visible.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="pl-4 text-left">
                      <Checkbox
                        checked={selected.has(e.id)}
                        onCheckedChange={() => toggle(e.id)}
                        aria-label={`Select ${e.name}`}
                      />
                    </TableCell>
                    {visibleColumns.has("name") && (
                      <TableCell className="text-left font-medium">{e.name}</TableCell>
                    )}
                    {visibleColumns.has("campaign") && (
                      <TableCell className="text-left text-muted-foreground">
                        {campaignLabel(e)}
                      </TableCell>
                    )}
                    {visibleColumns.has("size") && (
                      <TableCell className="text-left tabular-nums">
                        {formatNumber(e.blockedCarriers.length)}
                      </TableCell>
                    )}
                    <TableCell className="pr-4">
                      <div className="inline-flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          aria-label={`Edit ${e.name}`}
                          onClick={() => router.push(`${ROUTES.voipShield}/${e.id}`)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          aria-label={`Remove ${e.name}`}
                          onClick={() => setRemoving(e)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Pagination
        page={page}
        pageSize={pageSize}
        total={rows.length}
        onPage={setPage}
        onPageSize={(n) => setPageSize(n as PageSize)}
        pageSizeOptions={[...PAGE_SIZE_OPTIONS]}
      />

      <CreateVoipShieldDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={onCreate}
      />

      <AlertDialog open={removing !== null} onOpenChange={(o) => !o && setRemoving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove "{removing?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              The shield and all of its blocked carriers will be deleted. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removing && confirmRemove(removing)}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
