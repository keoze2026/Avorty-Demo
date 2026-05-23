import type { Metadata } from "next";
import { Building2, Plus } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Buyers" };

export default function BuyersPage() {
  return (
    <>
      <PageHeader
        title="Buyers"
        description="Entities receiving calls. Bid amounts, caps, and per-buyer performance."
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4" /> Invite buyer
          </Button>
        }
      />
      <EmptyState
        icon={Building2}
        tone="emerald"
        title="Buyers module arrives in Phase 5"
        description="Buyer directory, bid & cap configuration, and per-buyer performance panels land here next."
      />
    </>
  );
}
