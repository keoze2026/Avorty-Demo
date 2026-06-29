"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Headphones, Radio } from "lucide-react";

import { LiveControls } from "@/components/live/live-controls";
import { LiveDialerView } from "@/components/live/live-dialer-view";
import { LiveRadar } from "@/components/live/live-radar";
import { LiveStreamPanel } from "@/components/live/live-stream-panel";
import { RoutingPath } from "@/components/live/routing-path";
import { SessionMeter } from "@/components/live/session-meter";
import { LiveBadge } from "@/components/shared/live-badge";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLiveSocket } from "@/hooks/use-live-socket";
import { useTranslation } from "@/hooks/use-translation";

export default function LivePage() {
  const { t, locale } = useTranslation();
  const [paused, setPaused] = useState(false);
  const [tab, setTab] = useState<"calls" | "dialer">("calls");
  const { inFlight, history, totals } = useLiveSocket({ paused });

  // Today's date chip — defer formatting to after mount so SSR and the
  // first client paint don't disagree about the locale string.
  const [todayLabel, setTodayLabel] = useState("");
  useEffect(() => {
    setTodayLabel(
      new Date().toLocaleDateString(locale, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    );
  }, [locale]);

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
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground"
              suppressHydrationWarning
            >
              <CalendarDays className="h-3 w-3 text-accent" />
              {todayLabel || "—"}
            </span>
            <LiveBadge label={paused ? t("liveUI.badge.paused") : t("liveUI.badge.streaming")} />
            {tab === "calls" && (
              <LiveControls paused={paused} onTogglePause={() => setPaused((p) => !p)} />
            )}
          </>
        }
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as "calls" | "dialer")} className="space-y-4">
        <TabsList>
          <TabsTrigger value="calls" className="gap-2">
            <Radio className="h-3.5 w-3.5" /> Calls
          </TabsTrigger>
          <TabsTrigger value="dialer" className="gap-2">
            <Headphones className="h-3.5 w-3.5" /> Dialer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calls" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="dialer">
          <LiveDialerView />
        </TabsContent>
      </Tabs>
    </>
  );
}
