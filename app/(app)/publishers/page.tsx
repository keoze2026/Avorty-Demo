import type { Metadata } from "next";
import { Plus, Users } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Publishers" };

export default function PublishersPage() {
  return (
    <>
      <PageHeader
        title="Publishers"
        description="Traffic sources. Payouts, conversion, and assigned numbers."
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4" /> Invite publisher
          </Button>
        }
      />
      <EmptyState
        icon={Users}
        tone="violet"
        title="Publishers module arrives in Phase 5"
        description="Publisher directory, payout configuration, and per-publisher performance land here next."
      />
    </>
  );
}
