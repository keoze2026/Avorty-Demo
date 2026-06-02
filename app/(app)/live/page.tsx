"use client";

import { useState } from "react";

import { LiveControls } from "@/components/live/live-controls";
import { LiveRadar } from "@/components/live/live-radar";
import { LiveStreamPanel } from "@/components/live/live-stream-panel";
import { RoutingPath } from "@/components/live/routing-path";
import { SessionMeter } from "@/components/live/session-meter";
import { LiveBadge } from "@/components/shared/live-badge";
import { PageHeader } from "@/components/shared/page-header";
import { useMockSocket } from "@/hooks/use-mock-socket";
import { useTranslation } from "@/hooks/use-translation";

export default function LivePage() {
  const { t } = useTranslation();
  const [paused, setPaused] = useState(false);
  const { inFlight, history, totals } = useMockSocket({ paused, intervalMs: 2400 });

  // Featured = longest-running in-flight call, falls back to most recent settled.
  const featured =
    inFlight.length > 0
      ? [...inFlight].sort((a, b) => a.startedAt - b.startedAt)[0]
      : history[0] ?? null;

  return (
    <>
      <PageHeader
        title={t("page.live.title")}
        description={t("page.live.description")}
        actions={
          <>
            <LiveBadge label={paused ? t("liveUI.badge.paused") : t("liveUI.badge.streaming")} />
            <LiveControls paused={paused} onTogglePause={() => setPaused((p) => !p)} />
          </>
        }
      />

      <LiveRadar inFlight={inFlight} featured={featured} totals={totals} />

      {/* Bento — 12 col */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <LiveStreamPanel inFlight={inFlight} history={history} />
        </div>
        <div className="space-y-4 lg:col-span-4">
          <RoutingPath call={featured} />
          <SessionMeter totals={totals} inFlightCount={inFlight.length} />
        </div>
      </div>
    </>
  );
}
