"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { DestinationBuilder } from "@/components/destinations/destination-builder";
import { DestinationsTable } from "@/components/destinations/destinations-table";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/hooks/use-translation";
import { formatCompact } from "@/lib/format";
import { MOCK_BUYERS } from "@/lib/mock/buyers";
import { MOCK_CALLS } from "@/lib/mock/calls";
import { useDestinationsStore } from "@/lib/store/destinations-store";

type StatusFilter = "all" | "active" | "disabled";

export default function DestinationsPage() {
  const { t } = useTranslation();
  const destinations = useDestinationsStore((s) => s.destinations);
  const setEnabled = useDestinationsStore((s) => s.setEnabled);
  const remove = useDestinationsStore((s) => s.remove);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [buyerFilter, setBuyerFilter] = useState<string>("all");
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(0);

  const [builderOpen, setBuilderOpen] = useState(false);
  const [editId, setEditId] = useState<string | undefined>(undefined);

  // Reset to page 0 whenever the result set or page size changes.
  useEffect(() => {
    setPage(0);
  }, [query, statusFilter, buyerFilter, pageSize]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return destinations.filter((d) => {
      if (statusFilter === "active" && !d.enabled) return false;
      if (statusFilter === "disabled" && d.enabled) return false;
      if (buyerFilter !== "all" && d.buyerId !== buyerFilter) return false;
      if (q) {
        const buyer = MOCK_BUYERS.find((b) => b.id === d.buyerId);
        const haystack = `${d.name} ${d.tfn} ${buyer?.name ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [destinations, query, statusFilter, buyerFilter]);

  // Summary stats: live calls per TFN + roll-ups across active destinations.
  const stats = useMemo(() => {
    const live = new Map<string, number>();
    for (const c of MOCK_CALLS) {
      if (c.status === "ringing" || c.status === "in-progress") {
        live.set(c.destinationNumber, (live.get(c.destinationNumber) ?? 0) + 1);
      }
    }

    let activeLive = 0;
    let totalLive = 0;
    let totalCC = 0;
    let activeTFNs = 0;
    for (const d of destinations) {
      if (!d.enabled) continue;
      const liveOnTfn = live.get(d.tfn) ?? 0;
      activeTFNs += 1;
      totalCC += d.concurrencyCap;
      totalLive += liveOnTfn;
      if (liveOnTfn > 0) activeLive += 1;
    }
    return {
      activeLive,
      totalLive,
      totalCC,
      activeTFNs,
      vacantCC: Math.max(0, totalCC - totalLive),
    };
  }, [destinations]);

  const openCreate = () => {
    setEditId(undefined);
    setBuilderOpen(true);
  };

  const openEdit = (id: string) => {
    setEditId(id);
    setBuilderOpen(true);
  };

  const handleToggle = (id: string) => {
    const d = destinations.find((x) => x.id === id);
    if (!d) return;
    setEnabled(id, !d.enabled);
    toast.success(
      d.enabled
        ? t("networkUI.destinations.toast.paused").replace("{name}", d.name)
        : t("networkUI.destinations.toast.enabled").replace("{name}", d.name),
    );
  };

  const handleDelete = (id: string) => {
    const d = destinations.find((x) => x.id === id);
    if (!d) return;
    remove(id);
    toast.success(t("networkUI.destinations.toast.removed").replace("{name}", d.name));
  };

  return (
    <>
      <PageHeader
        title={t("networkUI.destinations.page.title")}
        description={t("networkUI.destinations.page.description")}
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" /> {t("networkUI.destinations.page.newDestination")}
          </Button>
        }
      />

      {/* Filters + inline summary stats card */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("networkUI.destinations.page.searchPlaceholder")}
            className="h-9 w-72 pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger size="sm" className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("networkUI.destinations.page.allStatuses")}</SelectItem>
            <SelectItem value="active">{t("networkUI.destinations.page.active")}</SelectItem>
            <SelectItem value="disabled">{t("networkUI.destinations.page.disabled")}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={buyerFilter} onValueChange={setBuyerFilter}>
          <SelectTrigger size="sm" className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("networkUI.destinations.page.allBuyers")}</SelectItem>
            {MOCK_BUYERS.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Inline summary stats — one bordered card, all 5 stats split by hairlines */}
        <div className="ml-auto inline-flex h-9 items-stretch divide-x divide-border overflow-hidden rounded-md border border-border bg-card">
          {[
            { label: t("networkUI.destinations.page.activeLive"), value: formatCompact(stats.activeLive) },
            { label: t("networkUI.destinations.page.totalLive"), value: formatCompact(stats.totalLive) },
            { label: t("networkUI.destinations.page.totalCC"), value: formatCompact(stats.totalCC) },
            { label: t("networkUI.destinations.page.activeTFNs"), value: formatCompact(stats.activeTFNs) },
            { label: t("networkUI.destinations.page.vacantCC"), value: formatCompact(stats.vacantCC) },
          ].map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-1.5 px-3 text-[11px] text-muted-foreground"
            >
              <span>{s.label}</span>
              <span className="text-sm font-semibold tabular-nums tracking-tight text-foreground">
                {s.value}
              </span>
            </div>
          ))}
        </div>

        <div className="text-xs text-muted-foreground tabular-nums">
          {filtered.length} of {destinations.length}
        </div>
      </div>

      <DestinationsTable
        destinations={filtered.slice(page * pageSize, page * pageSize + pageSize)}
        onToggle={handleToggle}
        onEdit={openEdit}
        onDelete={handleDelete}
      />
      <Pagination
        page={page}
        pageSize={pageSize}
        total={filtered.length}
        onPage={setPage}
        onPageSize={setPageSize}
      />

      <DestinationBuilder
        open={builderOpen}
        onOpenChange={(v) => {
          setBuilderOpen(v);
          if (!v) setEditId(undefined);
        }}
        editId={editId}
      />
    </>
  );
}
