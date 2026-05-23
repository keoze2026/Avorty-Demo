import type { Metadata } from "next";
import { Plug, Plus } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Integrations" };

export default function IntegrationsPage() {
  return (
    <>
      <PageHeader
        title="Integrations"
        description="Webhooks, postbacks, and partner integrations."
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4" /> Add webhook
          </Button>
        }
      />
      <EmptyState
        icon={Plug}
        tone="cyan"
        title="Integrations module arrives in Phase 8"
        description="Webhook configuration, postback testing, CRM integrations, and per-event delivery logs."
      />
    </>
  );
}
