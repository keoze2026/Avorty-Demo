"use client";

import { useMemo, useState } from "react";
import { GitFork, Plus, Search, X } from "lucide-react";

import { NewPlanDialog } from "@/components/routing/new-plan-dialog";
import { RoutingPlanCard } from "@/components/routing/routing-plan-card";
import { TopologyOverview } from "@/components/routing/topology-overview";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRoutingStore } from "@/lib/store/routing-store";
import type { RoutingPlanStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | RoutingPlanStatus;

const STATUS_OPTIONS: Array<{ id: StatusFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "published", label: "Live" },
  { id: "draft", label: "Draft" },
  { id: "archived", label: "Archived" },
];

export default function RoutingPage() {
  const plans = useRoutingStore((s) => s.plans);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return plans.filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      if (q && !`${p.name} ${p.description ?? ""} ${p.campaignName ?? ""}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [plans, query, status]);

  const filtersOn = query || status !== "all";

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

      <TopologyOverview plans={plans} />

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search plans…"
              className="h-9 w-64 pl-8 font-mono text-xs"
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

          {/* Status pills */}
          <div className="flex gap-0.5 rounded-md border border-border bg-secondary/40 p-0.5">
            {STATUS_OPTIONS.map((s) => {
              const active = s.id === status;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStatus(s.id)}
                  className={cn(
                    "h-7 rounded px-2.5 font-mono text-[10px] uppercase tracking-wider transition-colors",
                    active
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {s.label}
                </button>
              );
            })}
          </div>

          {filtersOn && (
            <Button
              variant="ghost"
              size="sm"
              className="font-mono text-[10px] uppercase tracking-wider"
              onClick={() => {
                setQuery("");
                setStatus("all");
              }}
            >
              clear
            </Button>
          )}

          <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-muted-foreground sm:ml-2">
            {filtered.length} of {plans.length}
          </span>
        </div>
      </div>

      {/* Grid */}
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
