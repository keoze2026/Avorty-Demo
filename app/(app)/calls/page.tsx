import type { Metadata } from "next";
import { Download, PhoneCall } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Call Logs" };

export default function CallsPage() {
  return (
    <>
      <PageHeader
        title="Call Logs"
        description="Every call your network has handled, with filters and drill-down."
        actions={
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        }
      />
      <EmptyState
        icon={PhoneCall}
        tone="cyan"
        title="Call logs grid arrives in Phase 6"
        description="A virtualized CDR grid with column controls, advanced filters, and a per-call drill-down panel."
      />
    </>
  );
}
