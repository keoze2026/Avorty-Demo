"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Megaphone, Plus } from "lucide-react";
import { toast } from "sonner";

import { CampaignBuilder } from "@/components/campaigns/campaign-builder";
import { CampaignCard } from "@/components/campaigns/campaign-card";
import { CampaignsOverview } from "@/components/campaigns/campaigns-overview";
import { CampaignsTable } from "@/components/campaigns/campaigns-table";
import { CampaignsToolbar, type StatusFilter } from "@/components/campaigns/campaigns-toolbar";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { type ViewMode } from "@/components/shared/view-toggle";
import { Button } from "@/components/ui/button";
import { VERTICALS } from "@/lib/mock/campaigns";
import { useCampaignsStore } from "@/lib/store/campaigns-store";

export default function CampaignsPage() {
  const all = useCampaignsStore((s) => s.campaigns);
  const setStatus = useCampaignsStore((s) => s.setStatus);
  const remove = useCampaignsStore((s) => s.remove);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [vertical, setVertical] = useState("all");
  const [status, setStatusFilter] = useState<StatusFilter>("all");
  const [view, setView] = useState<ViewMode>("grid");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((c) => {
      if (status !== "all" && c.status !== status) return false;
      if (vertical !== "all" && c.vertical !== vertical) return false;
      if (q && !`${c.name} ${c.description ?? ""} ${c.vertical}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [all, query, vertical, status]);

  const onToggle = (id: string) => {
    const c = all.find((x) => x.id === id);
    if (!c) return;
    const next = c.status === "active" ? "paused" : "active";
    setStatus(id, next);
    toast.success(next === "active" ? `${c.name} activated` : `${c.name} paused`);
  };

  const onArchive = (id: string) => {
    const c = all.find((x) => x.id === id);
    if (!c) return;
    remove(id);
    toast.success(`${c.name} archived`);
  };

  return (
    <>
      <PageHeader
        title="Campaigns"
        description="Every pay-per-call campaign, its numbers, and its performance."
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> New campaign
          </Button>
        }
      />

      <CampaignsOverview campaigns={all} />

      <CampaignsToolbar
        query={query}
        onQuery={setQuery}
        vertical={vertical}
        onVertical={setVertical}
        verticals={VERTICALS}
        status={status}
        onStatus={setStatusFilter}
        view={view}
        onView={setView}
        count={filtered.length}
        total={all.length}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          tone="emerald"
          title="No campaigns match your filters"
          description="Try clearing the search box or relaxing your status / vertical filters."
        />
      ) : view === "grid" ? (
        <motion.div
          initial="initial"
          animate="animate"
          variants={{ animate: { transition: { staggerChildren: 0.04 } } }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"
        >
          {filtered.map((c, i) => (
            <motion.div
              key={c.id}
              variants={{
                initial: { opacity: 0, y: 8 },
                animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
              }}
            >
              <CampaignCard campaign={c} onToggle={onToggle} onArchive={onArchive} seed={i + 1} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <CampaignsTable campaigns={filtered} onToggle={onToggle} onArchive={onArchive} />
      )}

      <CampaignBuilder open={open} onOpenChange={setOpen} />
    </>
  );
}
