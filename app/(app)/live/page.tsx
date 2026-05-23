"use client";

import { useState } from "react";

import { LiveCallCard } from "@/components/live/live-call-card";
import { LiveControls } from "@/components/live/live-controls";
import { LiveStatsPanel } from "@/components/live/live-stats-panel";
import { LiveStreamFeed } from "@/components/live/live-stream-feed";
import { RoutingVisualizer } from "@/components/live/routing-visualizer";
import { LiveBadge } from "@/components/shared/live-badge";
import { PageHeader } from "@/components/shared/page-header";
import { useMockSocket } from "@/hooks/use-mock-socket";

// We deliberately avoid `export const metadata` since this is a client page.
// Title is set via the layout/template.

export default function LivePage() {
  const [paused, setPaused] = useState(false);
  const { inFlight, history, totals } = useMockSocket({ paused, intervalMs: 2400 });
  const featured = inFlight[0] ?? history[0] ?? null;

  return (
    <>
      <PageHeader
        title="Live Monitor"
        description="Watch every call as it lands, routes, and settles — in real time."
        actions={
          <>
            <LiveBadge label={paused ? "Paused" : "Streaming"} />
            <LiveControls paused={paused} onTogglePause={() => setPaused((p) => !p)} />
          </>
        }
      />

      {/* Big hero summary tile */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl"
          style={{ background: "var(--vortyx-glow)" }}
        />
        <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Live now</p>
            <p className="mt-1 font-mono text-4xl font-bold tabular-nums">{inFlight.length}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Calls currently ringing or in progress
            </p>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Featured</p>
            <div className="mt-1">
              {featured ? (
                <LiveCallCard call={featured} isLive={inFlight.includes(featured)} />
              ) : (
                <div className="flex h-20 items-center justify-center rounded-xl border border-dashed border-border/60 text-xs text-muted-foreground">
                  Awaiting first call…
                </div>
              )}
            </div>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">This session</p>
            <div className="mt-1 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg border border-border bg-secondary/40 p-2">
                <div className="font-mono text-base font-semibold">{totals.started}</div>
                <div className="text-[10px] text-muted-foreground">started</div>
              </div>
              <div className="rounded-lg border border-border bg-secondary/40 p-2">
                <div className="font-mono text-base font-semibold">{totals.completed}</div>
                <div className="text-[10px] text-muted-foreground">completed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feed + side panel */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LiveStreamFeed inFlight={inFlight} history={history} />
        </div>
        <div className="space-y-4">
          <RoutingVisualizer call={featured} />
          <LiveStatsPanel totals={totals} inFlightCount={inFlight.length} />
        </div>
      </div>
    </>
  );
}
