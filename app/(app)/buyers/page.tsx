"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Building2, Plus } from "lucide-react";
import { toast } from "sonner";

import { BuyerCard } from "@/components/buyers/buyer-card";
import { BuyersTable } from "@/components/buyers/buyers-table";
import { BuyersToolbar, type BuyerStatusFilter } from "@/components/buyers/buyers-toolbar";
import { InviteBuyerDialog } from "@/components/buyers/invite-buyer-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type ViewMode } from "@/components/shared/view-toggle";
import { formatCompact, formatCurrency } from "@/lib/format";
import { useBuyersStore } from "@/lib/store/buyers-store";

type SortKey = "spend" | "calls" | "bid" | "recent";

export default function BuyersPage() {
  const buyers = useBuyersStore((s) => s.buyers);
  const setStatus = useBuyersStore((s) => s.setStatus);
  const remove = useBuyersStore((s) => s.remove);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatusFilter] = useState<BuyerStatusFilter>("all");
  const [sort, setSort] = useState<SortKey>("spend");
  const [view, setView] = useState<ViewMode>("grid");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = buyers.filter((b) => {
      if (status !== "all" && b.status !== status) return false;
      if (
        q &&
        !`${b.name} ${b.organization} ${b.contactName ?? ""} ${b.email ?? ""}`.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
    return [...list].sort((a, b) => {
      if (sort === "spend") return b.spendToday - a.spendToday;
      if (sort === "calls") return b.callsToday - a.callsToday;
      if (sort === "bid") return b.bidAmount - a.bidAmount;
      return b.createdAt - a.createdAt;
    });
  }, [buyers, query, status, sort]);

  const stats = useMemo(() => {
    const active = buyers.filter((b) => b.status === "active").length;
    const capped = buyers.filter((b) => b.status === "capped").length;
    const spend = buyers.reduce((s, b) => s + b.spendToday, 0);
    const calls = buyers.reduce((s, b) => s + b.callsToday, 0);
    return { total: buyers.length, active, capped, spend, calls };
  }, [buyers]);

  const onToggle = (id: string) => {
    const b = buyers.find((x) => x.id === id);
    if (!b) return;
    const next = b.status === "active" ? "paused" : "active";
    setStatus(id, next);
    toast.success(next === "active" ? `${b.name} activated` : `${b.name} paused`);
  };

  const onArchive = (id: string) => {
    const b = buyers.find((x) => x.id === id);
    if (!b) return;
    remove(id);
    toast.success(`${b.name} removed`);
  };

  return (
    <>
      <PageHeader
        title="Buyers"
        description="Every buyer in your network — their bids, caps, and performance."
        actions={
          <Button size="sm" onClick={() => setInviteOpen(true)}>
            <Plus className="h-4 w-4" /> Invite buyer
          </Button>
        }
      />

      {/* Inventory summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total buyers", value: formatCompact(stats.total) },
          { label: "Active", value: formatCompact(stats.active) },
          { label: "Capped today", value: formatCompact(stats.capped) },
          { label: "Spend today", value: formatCurrency(stats.spend) },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="font-mono text-2xl font-semibold">{s.value}</div>
              <div className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                {s.label}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <BuyersToolbar
        query={query}
        onQuery={setQuery}
        status={status}
        onStatus={setStatusFilter}
        sort={sort}
        onSort={setSort}
        view={view}
        onView={setView}
        count={filtered.length}
        total={buyers.length}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          tone="emerald"
          title="No buyers match"
          description="Try clearing the search box or relaxing your status filter."
        />
      ) : view === "grid" ? (
        <motion.div
          initial="initial"
          animate="animate"
          variants={{ animate: { transition: { staggerChildren: 0.04 } } }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((b) => (
            <motion.div
              key={b.id}
              variants={{
                initial: { opacity: 0, y: 8 },
                animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
              }}
            >
              <BuyerCard buyer={b} onToggle={onToggle} onArchive={onArchive} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <BuyersTable buyers={filtered} onToggle={onToggle} onArchive={onArchive} />
      )}

      <InviteBuyerDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </>
  );
}
