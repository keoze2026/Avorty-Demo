import type { Metadata } from "next";
import { BarChart3, Plus } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Reports" };

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Reports"
        description="Interactive analytics with cross-filtering and drill-down."
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4" /> New report
          </Button>
        }
      />
      <EmptyState
        icon={BarChart3}
        tone="emerald"
        title="Reports module arrives in Phase 6"
        description="Interactive dashboards, cross-filter visualizations, and a saved-report library land here next."
      />
    </>
  );
}
