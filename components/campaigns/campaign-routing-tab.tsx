"use client";

import { useState } from "react";
import { GitFork, Plus } from "lucide-react";

import { NewPlanDialog } from "@/components/routing/new-plan-dialog";
import { RoutingPlanCard } from "@/components/routing/routing-plan-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { useRoutingStore } from "@/lib/store/routing-store";

/**
 * Routing tab on the campaign detail page — lists routing plans bound to
 * this campaign and links into the visual editor.
 */
export function CampaignRoutingTab({ campaignId }: { campaignId: string }) {
  const plans = useRoutingStore((s) => s.plans.filter((p) => p.campaignId === campaignId));
  const [open, setOpen] = useState(false);

  if (plans.length === 0) {
    return (
      <>
        <EmptyState
          icon={GitFork}
          tone="amber"
          title="No routing plan yet"
          description="Build a ring tree for this campaign — filters, splits, caps, and buyer nodes."
          actions={
            <Button size="sm" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> New plan
            </Button>
          }
        />
        <NewPlanDialog open={open} onOpenChange={setOpen} defaultCampaignId={campaignId} />
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {plans.length} {plans.length === 1 ? "plan" : "plans"} attached to this campaign
        </p>
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> New plan
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {plans.map((p) => (
          <RoutingPlanCard key={p.id} plan={p} />
        ))}
      </div>
      <NewPlanDialog open={open} onOpenChange={setOpen} defaultCampaignId={campaignId} />
    </>
  );
}
