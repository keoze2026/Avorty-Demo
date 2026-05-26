"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { CatalogGrid } from "@/components/integrations/catalog-grid";
import { ConnectedGrid } from "@/components/integrations/connected-grid";
import { WebhooksSection } from "@/components/integrations/webhooks-section";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_INTEGRATIONS } from "@/lib/mock/integrations";
import { formatCompact } from "@/lib/format";
import type { IntegrationApp } from "@/lib/types";

export default function IntegrationsPage() {
  const [apps, setApps] = useState<IntegrationApp[]>(MOCK_INTEGRATIONS);

  const connected = useMemo(() => apps.filter((a) => a.connected), [apps]);
  const available = useMemo(() => apps.filter((a) => !a.connected), [apps]);

  const onConnect = (id: string) => {
    setApps((all) =>
      all.map((a) => (a.id === id ? { ...a, connected: true, connectedAt: Date.now() } : a)),
    );
    const app = apps.find((a) => a.id === id);
    if (app) toast.success(`Connected ${app.name}`, { description: "Live within 30s." });
  };
  const onDisconnect = (id: string) => {
    setApps((all) =>
      all.map((a) => (a.id === id ? { ...a, connected: false, connectedAt: undefined } : a)),
    );
    const app = apps.find((a) => a.id === id);
    if (app) toast.success(`Disconnected ${app.name}`);
  };

  return (
    <>
      <PageHeader
        title="Integrations"
        description="Connect the tools you already use — and reach every Vortyx event from anywhere."
      />

      {/* Floor stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Connected apps" value={formatCompact(connected.length)} accent="text-accent" />
        <Stat label="Available" value={formatCompact(available.length)} accent="text-muted-foreground" />
        <Stat label="Webhooks" value="3" accent="text-accent" />
        <Stat label="24h delivery rate" value="98.7%" accent="text-[color:var(--success)]" />
      </div>

      {/* Connected */}
      <section className="space-y-3">
        <header>
          <h3 className="font-sans text-base font-semibold">Connected</h3>
          <p className="text-[11px] text-muted-foreground">Running in your workspace right now</p>
        </header>
        <ConnectedGrid apps={connected} onDisconnect={onDisconnect} />
      </section>

      {/* Catalog */}
      <CatalogGrid apps={available} onConnect={onConnect} />

      {/* Webhooks */}
      <WebhooksSection />
    </>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className={`font-mono text-2xl font-semibold ${accent}`}>{value}</div>
        <div className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}
