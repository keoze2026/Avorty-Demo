"use client";

import { IntegrationsBoard } from "@/components/integrations/integrations-board";
import { WebhooksSection } from "@/components/integrations/webhooks-section";
import { PageHeader } from "@/components/shared/page-header";
import { useTranslation } from "@/hooks/use-translation";
import { useIntegrationsStore } from "@/lib/store/integrations-store";

export default function IntegrationsPage() {
  const { t } = useTranslation();
  const apps = useIntegrationsStore((s) => s.apps);
  const connectMany = useIntegrationsStore((s) => s.connectMany);
  const disconnectMany = useIntegrationsStore((s) => s.disconnectMany);

  return (
    <>
      <PageHeader
        title={t("toolsUI.integrations.pageTitle")}
        description={t("toolsUI.integrations.pageDescription")}
      />

      <IntegrationsBoard
        apps={apps}
        onConnect={(ids) => void connectMany(ids)}
        onDisconnect={(ids) => void disconnectMany(ids)}
      />

      <WebhooksSection />
    </>
  );
}
