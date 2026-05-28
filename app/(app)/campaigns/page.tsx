"use client";

import { useMemo, useState } from "react";
import { Megaphone, Plus } from "lucide-react";
import { toast } from "sonner";

import { CampaignBuilder } from "@/components/campaigns/campaign-builder";
import { CampaignsTable } from "@/components/campaigns/campaigns-table";
import {
  ALL_CAMPAIGN_COLUMNS,
  CampaignsToolbar,
  type CampaignColumnKey,
  type CampaignSortKey,
  type CampaignStatusFilter,
} from "@/components/campaigns/campaigns-toolbar";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { useCampaignsStore } from "@/lib/store/campaigns-store";

export default function CampaignsPage() {
  const campaigns = useCampaignsStore((s) => s.campaigns);
  const setCampaignStatus = useCampaignsStore((s) => s.setStatus);
  const remove = useCampaignsStore((s) => s.remove);

  const [open, setOpen] = useState(false);

  // Toolbar state — lifted from the table so search/sort/filter/columns are
  // all wired through the new toolbar above the card.
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<CampaignSortKey>("recent");
  const [statusFilter, setStatusFilter] = useState<CampaignStatusFilter>("all");
  const [pageSize, setPageSize] = useState(25);
  const [columns, setColumns] =
    useState<Record<CampaignColumnKey, boolean>>(ALL_CAMPAIGN_COLUMNS);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = campaigns;
    if (statusFilter !== "all") {
      list = list.filter((c) => c.status === statusFilter);
    }
    if (q) {
      list = list.filter((c) =>
        `${c.name} ${c.vertical}`.toLowerCase().includes(q),
      );
    }
    return [...list].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "callsToday") return b.callsToday - a.callsToday;
      if (sort === "revenueToday") return b.revenueToday - a.revenueToday;
      return b.createdAt - a.createdAt;
    });
  }, [campaigns, query, statusFilter, sort]);

  const visible = filtered.slice(0, pageSize);

  const onToggle = (id: string) => {
    const c = campaigns.find((x) => x.id === id);
    if (!c) return;
    const next = c.status === "active" ? "paused" : "active";
    setCampaignStatus(id, next);
    toast.success(next === "active" ? `${c.name} activated` : `${c.name} paused`);
  };

  const onArchive = (id: string) => {
    const c = campaigns.find((x) => x.id === id);
    if (!c) return;
    remove(id);
    toast.success(`${c.name} archived`);
  };

  return (
    <>
      <PageHeader
        title="Campaigns"
        description="Manage your pay-per-call campaigns."
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> New campaign
          </Button>
        }
      />

      {campaigns.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          tone="emerald"
          title="No campaigns yet"
          description="Create your first campaign to start routing calls."
          actions={
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> Create campaign
            </Button>
          }
        />
      ) : (
        <>
          <CampaignsToolbar
            query={query}
            onQuery={setQuery}
            sort={sort}
            onSort={setSort}
            status={statusFilter}
            onStatus={setStatusFilter}
            pageSize={pageSize}
            onPageSize={setPageSize}
            columns={columns}
            onColumns={setColumns}
            onRefresh={() => toast.success("Campaigns refreshed")}
          />

          {visible.length === 0 ? (
            <EmptyState
              icon={Megaphone}
              tone="emerald"
              title="No campaigns match"
              description="Try clearing the search or relaxing the status filter."
            />
          ) : (
            <CampaignsTable
              campaigns={visible}
              columns={columns}
              onToggle={onToggle}
              onArchive={onArchive}
            />
          )}
        </>
      )}

      <CampaignBuilder open={open} onOpenChange={setOpen} />
    </>
  );
}
