"use client";

import { useMemo, useState } from "react";
import { Plus, Users } from "lucide-react";
import { toast } from "sonner";

import { EditPublisherDialog } from "@/components/publishers/edit-publisher-dialog";
import { InvitePublisherDialog } from "@/components/publishers/invite-publisher-dialog";
import { PublishersTable } from "@/components/publishers/publishers-table";
import { PublishersToolbar, type PublisherStatusFilter } from "@/components/publishers/publishers-toolbar";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCompact, formatCurrency } from "@/lib/format";
import { usePublishersStore } from "@/lib/store/publishers-store";

type SortKey = "revenue" | "calls" | "conv" | "recent";

export default function PublishersPage() {
  const publishers = usePublishersStore((s) => s.publishers);
  const setStatus = usePublishersStore((s) => s.setStatus);
  const remove = usePublishersStore((s) => s.remove);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatusFilter] = useState<PublisherStatusFilter>("all");
  const [sort, setSort] = useState<SortKey>("revenue");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = publishers.filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      if (
        q &&
        !`${p.name} ${p.organization} ${p.contactName ?? ""} ${p.email ?? ""}`.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
    return [...list].sort((a, b) => {
      if (sort === "revenue") return b.revenueToday - a.revenueToday;
      if (sort === "calls") return b.callsToday - a.callsToday;
      if (sort === "conv") return b.conversionRate - a.conversionRate;
      return b.createdAt - a.createdAt;
    });
  }, [publishers, query, status, sort]);

  const stats = useMemo(() => {
    const active = publishers.filter((p) => p.status === "active").length;
    const revenue = publishers.reduce((s, p) => s + p.revenueToday, 0);
    const calls = publishers.reduce((s, p) => s + p.callsToday, 0);
    const pending = publishers.reduce((s, p) => s + p.pendingPayout, 0);
    return { total: publishers.length, active, revenue, calls, pending };
  }, [publishers]);

  const onToggle = (id: string) => {
    const p = publishers.find((x) => x.id === id);
    if (!p) return;
    const next = p.status === "active" ? "paused" : "active";
    setStatus(id, next);
    toast.success(next === "active" ? `${p.name} activated` : `${p.name} paused`);
  };

  const onArchive = (id: string) => {
    const p = publishers.find((x) => x.id === id);
    if (!p) return;
    remove(id);
    toast.success(`${p.name} removed`);
  };

  return (
    <>
      <PageHeader
        title="Publishers"
        description="Traffic sources sending calls into your network — their payouts, conversion, and assigned numbers."
        actions={
          <Button size="sm" onClick={() => setInviteOpen(true)}>
            <Plus className="h-4 w-4" /> Invite publisher
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total publishers", value: formatCompact(stats.total) },
          { label: "Active", value: formatCompact(stats.active) },
          { label: "Revenue today", value: formatCurrency(stats.revenue) },
          { label: "Pending payouts", value: formatCurrency(stats.pending) },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="text-2xl font-bold tabular-nums tracking-tight">{s.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <PublishersToolbar
        query={query}
        onQuery={setQuery}
        status={status}
        onStatus={setStatusFilter}
        sort={sort}
        onSort={setSort}
        count={filtered.length}
        total={publishers.length}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          tone="violet"
          title="No publishers match"
          description="Try clearing the search box or relaxing your status filter."
        />
      ) : (
        <PublishersTable
          publishers={filtered}
          onToggle={onToggle}
          onArchive={onArchive}
          onEdit={setEditId}
        />
      )}

      <InvitePublisherDialog open={inviteOpen} onOpenChange={setInviteOpen} />
      <EditPublisherDialog
        publisherId={editId}
        onOpenChange={(open) => !open && setEditId(null)}
      />
    </>
  );
}
