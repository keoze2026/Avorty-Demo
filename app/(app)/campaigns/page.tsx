"use client";

import { useState } from "react";
import { Megaphone, Plus } from "lucide-react";
import { toast } from "sonner";

import { CampaignBuilder } from "@/components/campaigns/campaign-builder";
import { CampaignsTable } from "@/components/campaigns/campaigns-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { useCampaignsStore } from "@/lib/store/campaigns-store";

export default function CampaignsPage() {
  const campaigns = useCampaignsStore((s) => s.campaigns);
  const setStatus = useCampaignsStore((s) => s.setStatus);
  const remove = useCampaignsStore((s) => s.remove);

  const [open, setOpen] = useState(false);

  const onToggle = (id: string) => {
    const c = campaigns.find((x) => x.id === id);
    if (!c) return;
    const next = c.status === "active" ? "paused" : "active";
    setStatus(id, next);
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
        <CampaignsTable
          campaigns={campaigns}
          onToggle={onToggle}
          onArchive={onArchive}
        />
      )}

      <CampaignBuilder open={open} onOpenChange={setOpen} />
    </>
  );
}
