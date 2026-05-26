"use client";

import { useMemo, useState } from "react";
import { GitFork, Plus, Search, X } from "lucide-react";

import { NewPlanDialog } from "@/components/routing/new-plan-dialog";
import { RoutingPlanCard } from "@/components/routing/routing-plan-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRoutingStore } from "@/lib/store/routing-store";
import type { RoutingPlanStatus } from "@/lib/types";

export default function RoutingPage() {
  const plans = useRoutingStore((s) => s.plans);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | RoutingPlanStatus>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return plans.filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      if (q && !`${p.name} ${p.description ?? ""} ${p.campaignName ?? ""}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [plans, query, status]);

  return (
    <>
      <PageHeader
        title="Routing"
        description="Visual ring trees — conditional, weighted, and capped paths from caller to buyer."
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> New plan
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search plans…"
            className="h-9 w-64 pl-8"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger size="sm" className="h-9 w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <span className="ml-auto text-[11px] font-mono text-muted-foreground">
          {filtered.length} of {plans.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={GitFork}
          tone="amber"
          title={plans.length === 0 ? "No routing plans yet" : "No plans match"}
          description={
            plans.length === 0
              ? "Spin up your first plan to define how calls flow from publisher to buyer."
              : "Try relaxing your filters."
          }
          actions={
            plans.length === 0 ? (
              <Button size="sm" onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4" /> New plan
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <RoutingPlanCard key={p.id} plan={p} />
          ))}
        </div>
      )}

      <NewPlanDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
