"use client";

import { useMemo, useState } from "react";
import { Hash, Plus } from "lucide-react";

import { NumberPoolCard } from "@/components/numbers/number-pool-card";
import { NumbersTable } from "@/components/numbers/numbers-table";
import { NumbersToolbar } from "@/components/numbers/numbers-toolbar";
import { ProvisionNumberDialog } from "@/components/numbers/provision-number-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNumbersStore } from "@/lib/store/numbers-store";
import { formatCompact, formatCurrency } from "@/lib/format";
import type { NumberStatus, NumberType } from "@/lib/types";

export default function NumbersPage() {
  const numbers = useNumbersStore((s) => s.numbers);
  const pools = useNumbersStore((s) => s.pools);

  const [provisionOpen, setProvisionOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | NumberType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | NumberStatus>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return numbers.filter((n) => {
      if (typeFilter !== "all" && n.type !== typeFilter) return false;
      if (statusFilter !== "all" && n.status !== statusFilter) return false;
      if (
        q &&
        !`${n.number} ${n.campaignName ?? ""} ${n.city ?? ""} ${n.state ?? ""}`.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [numbers, query, typeFilter, statusFilter]);

  const stats = useMemo(() => {
    const active = numbers.filter((n) => n.status === "active").length;
    const pending = numbers.filter((n) => n.status === "pending").length;
    const cost = numbers.reduce((s, n) => s + n.monthlyCost, 0);
    return { total: numbers.length, active, pending, cost };
  }, [numbers]);

  return (
    <>
      <PageHeader
        title="Numbers"
        description="Tracking numbers and number pools, organized by campaign."
        actions={
          <Button size="sm" onClick={() => setProvisionOpen(true)}>
            <Plus className="h-4 w-4" /> Provision number
          </Button>
        }
      />

      {/* Tiny inventory summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total inventory", value: formatCompact(stats.total) },
          { label: "Active", value: formatCompact(stats.active) },
          { label: "Pending", value: formatCompact(stats.pending) },
          { label: "Monthly cost", value: formatCurrency(stats.cost, true) },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="text-xl font-semibold tabular-nums tracking-tight">{s.value}</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="all" className="gap-4">
        <TabsList>
          <TabsTrigger value="all">All numbers</TabsTrigger>
          <TabsTrigger value="pools">Pools</TabsTrigger>
          <TabsTrigger value="unassigned">Unassigned</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <NumbersToolbar
            query={query}
            onQuery={setQuery}
            type={typeFilter}
            onType={setTypeFilter}
            status={statusFilter}
            onStatus={setStatusFilter}
            countLabel={`${filtered.length} of ${numbers.length}`}
          />
          {filtered.length === 0 ? (
            <EmptyState
              icon={Hash}
              tone="violet"
              title="No numbers match"
              description="Try clearing your search or relaxing the type / status filters."
            />
          ) : (
            <NumbersTable numbers={filtered} />
          )}
        </TabsContent>

        <TabsContent value="pools" className="space-y-4">
          {pools.length === 0 ? (
            <EmptyState
              icon={Hash}
              tone="cyan"
              title="No pools yet"
              description="Group numbers into pools with rotation rules — useful for high-volume campaigns."
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {pools.map((p) => (
                <NumberPoolCard key={p.id} pool={p} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="unassigned">
          {(() => {
            const orphans = numbers.filter((n) => !n.campaignId);
            if (orphans.length === 0) {
              return (
                <EmptyState
                  icon={Hash}
                  tone="emerald"
                  title="No unassigned numbers"
                  description="Every number is attached to a campaign — nice and tidy."
                />
              );
            }
            return <NumbersTable numbers={orphans} />;
          })()}
        </TabsContent>
      </Tabs>

      <ProvisionNumberDialog open={provisionOpen} onOpenChange={setProvisionOpen} />
    </>
  );
}
