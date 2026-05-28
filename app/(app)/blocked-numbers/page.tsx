"use client";

import * as React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { BlockNumberDialog } from "@/components/suppression/block-number-dialog";
import {
  PAGE_SIZE_OPTIONS,
  SuppressionToolbar,
  type ColumnOption,
  type FilterOption,
  type PageSize,
  type SortOption,
} from "@/components/suppression/suppression-toolbar";
import { UpdateNumberDialog } from "@/components/suppression/update-number-dialog";
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
import { MOCK_CAMPAIGNS } from "@/lib/mock/campaigns";
import type { BlockedNumberEntry } from "@/lib/mock/suppression";
import { useBlockedNumbersStore } from "@/lib/store/blocked-numbers-store";

const ALL_CAMPAIGNS_ID = "__all__";

type SortKey = "number-asc" | "number-desc" | "campaign-asc";

const SORT_OPTIONS: SortOption[] = [
  { id: "number-asc", label: "Number (low → high)" },
  { id: "number-desc", label: "Number (high → low)" },
  { id: "campaign-asc", label: "Campaign (A → Z)" },
];

const COLUMN_OPTIONS: ColumnOption[] = [
  { id: "number", label: "Blocked number" },
  { id: "campaign", label: "Campaign" },
  { id: "actions", label: "Actions", required: true },
];
const DEFAULT_COLUMNS = new Set(COLUMN_OPTIONS.map((c) => c.id));

const CAMPAIGN_NAME_BY_ID = new Map(MOCK_CAMPAIGNS.map((c) => [c.id, c.name]));

function campaignLabel(entry: BlockedNumberEntry): string {
  if (!entry.campaignId) return "All Campaigns";
  return CAMPAIGN_NAME_BY_ID.get(entry.campaignId) ?? entry.campaignId;
}

/** "18302094480" → "+18302094480"; if scope is prefix we append "*". */
function displayNumber(entry: BlockedNumberEntry): string {
  const base = `+${entry.number}`;
  return entry.scope === "prefix" ? `${base}*` : base;
}

export default function BlockedNumbersPage() {
  const numbers = useBlockedNumbersStore((s) => s.numbers);
  const addNumber = useBlockedNumbersStore((s) => s.add);
  const updateNumber = useBlockedNumbersStore((s) => s.update);
  const removeNumber = useBlockedNumbersStore((s) => s.remove);

  const [query, setQuery] = React.useState("");
  const [pageSize, setPageSize] = React.useState<PageSize>(PAGE_SIZE_OPTIONS[1]);
  const [sortKey, setSortKey] = React.useState<SortKey>("number-asc");
  const [campaignFilter, setCampaignFilter] = React.useState<Set<string>>(new Set());
  const [visibleColumns, setVisibleColumns] = React.useState<Set<string>>(DEFAULT_COLUMNS);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<BlockedNumberEntry | null>(null);
  const [removing, setRemoving] = React.useState<BlockedNumberEntry | null>(null);

  // Campaign filter options — "All Campaigns" pseudo-option + every real campaign.
  const filterOptions = React.useMemo<FilterOption[]>(
    () => [
      { id: ALL_CAMPAIGNS_ID, label: "All Campaigns" },
      ...MOCK_CAMPAIGNS.map((c) => ({ id: c.id, label: c.name })),
    ],
    [],
  );

  const rows = React.useMemo(() => {
    let items = numbers;
    const q = query.trim().toLowerCase().replace(/\D/g, "");
    if (q) {
      items = items.filter(
        (n) =>
          n.number.includes(q) ||
          campaignLabel(n).toLowerCase().includes(query.trim().toLowerCase()),
      );
    }
    if (campaignFilter.size > 0) {
      items = items.filter((n) => {
        if (campaignFilter.has(ALL_CAMPAIGNS_ID) && !n.campaignId) return true;
        return n.campaignId !== undefined && campaignFilter.has(n.campaignId);
      });
    }
    const sorted = [...items];
    sorted.sort((a, b) => {
      switch (sortKey) {
        case "number-asc":
          return a.number.localeCompare(b.number);
        case "number-desc":
          return b.number.localeCompare(a.number);
        case "campaign-asc":
          return campaignLabel(a).localeCompare(campaignLabel(b));
      }
    });
    return sorted;
  }, [numbers, query, sortKey, campaignFilter]);

  const visible = rows.slice(0, pageSize);
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

  const onBlock = (input: {
    number: string;
    scope: BlockedNumberEntry["scope"];
    campaignId?: string;
  }) => {
    const created = addNumber(input);
    toast.success(`Blocked +${created.number}`);
  };

  const onSaveUpdate = ({
    id,
    number,
    campaignId,
  }: {
    id: string;
    number: string;
    campaignId?: string;
  }) => {
    updateNumber(id, { number, campaignId });
    toast.success(`Updated +${number}`);
  };

  const confirmRemove = (entry: BlockedNumberEntry) => {
    removeNumber(entry.id);
    setSelected((curr) => {
      const next = new Set(curr);
      next.delete(entry.id);
      return next;
    });
    toast.success(`Unblocked ${displayNumber(entry)}`);
    setRemoving(null);
  };

  return (
    <>
      <PageHeader title="Blocked Numbers" />

      <SuppressionToolbar
        query={query}
        onQuery={setQuery}
        pageSize={pageSize}
        onPageSize={setPageSize}
        ctaLabel="Block Number"
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
            const guarded = new Set(next);
            guarded.add("actions");
            setVisibleColumns(guarded);
          },
        }}
      />

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4 w-10 text-left">
                  <Checkbox
                    checked={allChecked}
                    onCheckedChange={toggleAll}
                    aria-label="Select all"
                  />
                </TableHead>
                {visibleColumns.has("number") && (
                  <TableHead className="text-left">Blocked number</TableHead>
                )}
                {visibleColumns.has("campaign") && (
                  <TableHead className="text-left">Campaign</TableHead>
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
                        aria-label={`Select ${displayNumber(e)}`}
                      />
                    </TableCell>
                    {visibleColumns.has("number") && (
                      <TableCell className="text-left font-mono">
                        {displayNumber(e)}
                      </TableCell>
                    )}
                    {visibleColumns.has("campaign") && (
                      <TableCell className="text-left text-muted-foreground">
                        {campaignLabel(e)}
                      </TableCell>
                    )}
                    <TableCell className="pr-4">
                      <div className="inline-flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          aria-label={`Edit ${displayNumber(e)}`}
                          onClick={() => setEditing(e)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          aria-label={`Unblock ${displayNumber(e)}`}
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

      <BlockNumberDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onBlock={onBlock}
      />

      <UpdateNumberDialog
        entry={editing}
        onOpenChange={(o) => {
          if (!o) setEditing(null);
        }}
        onSave={onSaveUpdate}
      />

      <AlertDialog open={removing !== null} onOpenChange={(o) => !o && setRemoving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Unblock {removing ? displayNumber(removing) : ""}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the entry from the blocked list. The number will be allowed
              to call again immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removing && confirmRemove(removing)}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Unblock
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
