"use client";

import * as React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useTranslation } from "@/hooks/use-translation";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
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

const CAMPAIGN_NAME_BY_ID = new Map(MOCK_CAMPAIGNS.map((c) => [c.id, c.name]));

/** "18302094480" → "+18302094480"; if scope is prefix we append "*". */
function displayNumber(entry: BlockedNumberEntry): string {
  const base = `+${entry.number}`;
  return entry.scope === "prefix" ? `${base}*` : base;
}

export default function BlockedNumbersPage() {
  const { t } = useTranslation();

  const SORT_OPTIONS: SortOption[] = [
    { id: "number-asc", label: t("toolsUI.suppression.blockedNumbers.sort.numberAsc") },
    { id: "number-desc", label: t("toolsUI.suppression.blockedNumbers.sort.numberDesc") },
    { id: "campaign-asc", label: t("toolsUI.suppression.blockedNumbers.sort.campaignAsc") },
  ];

  const COLUMN_OPTIONS: ColumnOption[] = [
    { id: "number", label: t("toolsUI.suppression.columns.blockedNumber") },
    { id: "campaign", label: t("toolsUI.suppression.columns.campaign") },
    { id: "actions", label: t("toolsUI.suppression.columns.actions"), required: true },
  ];
  const DEFAULT_COLUMNS = new Set(COLUMN_OPTIONS.map((c) => c.id));

  function campaignLabel(entry: BlockedNumberEntry): string {
    if (!entry.campaignId) return t("toolsUI.suppression.allCampaigns");
    return CAMPAIGN_NAME_BY_ID.get(entry.campaignId) ?? entry.campaignId;
  }

  const numbers = useBlockedNumbersStore((s) => s.numbers);
  const addNumber = useBlockedNumbersStore((s) => s.add);
  const updateNumber = useBlockedNumbersStore((s) => s.update);
  const removeNumber = useBlockedNumbersStore((s) => s.remove);

  const [query, setQuery] = React.useState("");
  const [pageSize, setPageSize] = React.useState<PageSize>(PAGE_SIZE_OPTIONS[1]);
  const [page, setPage] = React.useState(0);
  const [sortKey, setSortKey] = React.useState<SortKey>("number-asc");
  const [campaignFilter, setCampaignFilter] = React.useState<Set<string>>(new Set());

  // Reset to page 0 whenever the result set or page size changes.
  React.useEffect(() => {
    setPage(0);
  }, [query, sortKey, campaignFilter, pageSize]);
  const [visibleColumns, setVisibleColumns] = React.useState<Set<string>>(DEFAULT_COLUMNS);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<BlockedNumberEntry | null>(null);
  const [removing, setRemoving] = React.useState<BlockedNumberEntry | null>(null);

  // Campaign filter options — "All Campaigns" pseudo-option + every real campaign.
  const filterOptions = React.useMemo<FilterOption[]>(
    () => [
      { id: ALL_CAMPAIGNS_ID, label: t("toolsUI.suppression.allCampaigns") },
      ...MOCK_CAMPAIGNS.map((c) => ({ id: c.id, label: c.name })),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const onBlock = (input: {
    number: string;
    scope: BlockedNumberEntry["scope"];
    campaignId?: string;
  }) => {
    const created = addNumber(input);
    toast.success(t("toolsUI.suppression.blockedNumbers.toastBlocked").replace("{number}", created.number));
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
    toast.success(t("toolsUI.suppression.blockedNumbers.toastUpdated").replace("{number}", number));
  };

  const confirmRemove = (entry: BlockedNumberEntry) => {
    removeNumber(entry.id);
    setSelected((curr) => {
      const next = new Set(curr);
      next.delete(entry.id);
      return next;
    });
    toast.success(t("toolsUI.suppression.blockedNumbers.toastUnblocked").replace("{number}", displayNumber(entry)));
    setRemoving(null);
  };

  return (
    <>
      <PageHeader title={t("toolsUI.suppression.blockedNumbers.title")} />

      <SuppressionToolbar
        query={query}
        onQuery={setQuery}
        pageSize={pageSize}
        onPageSize={setPageSize}
        ctaLabel={t("toolsUI.suppression.blockedNumbers.createCta")}
        onCta={() => setCreateOpen(true)}
        sort={{
          options: SORT_OPTIONS,
          value: sortKey,
          onChange: (id) => setSortKey(id as SortKey),
        }}
        filter={{
          label: t("toolsUI.suppression.blockedNumbers.filterByCampaign"),
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
                    aria-label={t("toolsUI.suppression.aria.selectAll")}
                  />
                </TableHead>
                {visibleColumns.has("number") && (
                  <TableHead className="text-left">{t("toolsUI.suppression.columns.blockedNumber")}</TableHead>
                )}
                {visibleColumns.has("campaign") && (
                  <TableHead className="text-left">{t("toolsUI.suppression.columns.campaign")}</TableHead>
                )}
                <TableHead className="pr-4">{t("toolsUI.suppression.columns.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={1 + visibleColumns.size}
                    className="py-10 text-center text-xs text-muted-foreground"
                  >
                    {t("toolsUI.suppression.noData")}
                  </TableCell>
                </TableRow>
              ) : (
                visible.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="pl-4 text-left">
                      <Checkbox
                        checked={selected.has(e.id)}
                        onCheckedChange={() => toggle(e.id)}
                        aria-label={t("toolsUI.suppression.aria.selectRow").replace("{label}", displayNumber(e))}
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
                          aria-label={t("toolsUI.suppression.aria.editRow").replace("{label}", displayNumber(e))}
                          onClick={() => setEditing(e)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          aria-label={t("toolsUI.suppression.aria.unblockRow").replace("{label}", displayNumber(e))}
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
              {t("toolsUI.suppression.blockedNumbers.confirmUnblockTitle").replace("{number}", removing ? displayNumber(removing) : "")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("toolsUI.suppression.blockedNumbers.confirmUnblockDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("toolsUI.suppression.removeConfirm.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removing && confirmRemove(removing)}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {t("toolsUI.suppression.blockedNumbers.confirmUnblockAction")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
