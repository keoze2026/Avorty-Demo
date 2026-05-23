import type { Metadata } from "next";
import { GitFork, Plus } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Routing" };

export default function RoutingPage() {
  return (
    <>
      <PageHeader
        title="Routing"
        description="Build ring trees — conditional, weighted, and capped paths from caller to buyer."
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4" /> New routing plan
          </Button>
        }
      />
      <EmptyState
        icon={GitFork}
        tone="amber"
        title="Visual routing builder arrives in Phase 4"
        description="A node-graph editor (React Flow) with drag-and-drop ring-tree nodes, conditional logic, and live preview."
      />
    </>
  );
}
