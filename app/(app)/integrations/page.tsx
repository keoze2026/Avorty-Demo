"use client";

import { useState } from "react";

import { IntegrationsBoard } from "@/components/integrations/integrations-board";
import { WebhooksSection } from "@/components/integrations/webhooks-section";
import { PageHeader } from "@/components/shared/page-header";
import { useTranslation } from "@/hooks/use-translation";
import { MOCK_INTEGRATIONS } from "@/lib/mock/integrations";
import type { IntegrationApp } from "@/lib/types";

export default function IntegrationsPage() {
  const { t } = useTranslation();
  const [apps, setApps] = useState<IntegrationApp[]>(MOCK_INTEGRATIONS);

  const onConnect = (ids: string[]) => {
    const now = Date.now();
    const idSet = new Set(ids);
    setApps((all) =>
      all.map((a) =>
        idSet.has(a.id) ? { ...a, connected: true, connectedAt: now } : a,
      ),
    );
  };

  const onDisconnect = (ids: string[]) => {
    const idSet = new Set(ids);
    setApps((all) =>
      all.map((a) =>
        idSet.has(a.id)
          ? { ...a, connected: false, connectedAt: undefined }
          : a,
      ),
    );
  };

  return (
    <>
      <PageHeader
        title={t("toolsUI.integrations.pageTitle")}
        description={t("toolsUI.integrations.pageDescription")}
      />

      <IntegrationsBoard apps={apps} onConnect={onConnect} onDisconnect={onDisconnect} />

      <WebhooksSection />
    </>
  );
}
