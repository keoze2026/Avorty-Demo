"use client";

import { AnimatePresence } from "framer-motion";
import { Inbox } from "lucide-react";

import { LiveCallCard } from "./live-call-card";
import { useTranslation } from "@/hooks/use-translation";
import type { Call } from "@/lib/types";

interface LiveStreamFeedProps {
  inFlight: Call[];
  history: Call[];
}

export function LiveStreamFeed({ inFlight, history }: LiveStreamFeedProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      {/* In-flight */}
      <section>
        <header className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            {t("liveUI.stream.inFlightCount").replace("{n}", String(inFlight.length))}
          </h3>
        </header>
        <div className="relative min-h-[160px]">
          {inFlight.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 py-10 text-center text-muted-foreground">
              <Inbox className="h-5 w-5" />
              <p className="text-xs">{t("liveUI.stream.waiting")}</p>
            </div>
          )}
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {inFlight.map((c) => (
                <LiveCallCard key={c.id} call={c} isLive />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* History */}
      {history.length > 0 && (
        <section>
          <header className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              {t("liveUI.stream.recentlySettled")}
            </h3>
          </header>
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {history.slice(0, 8).map((c) => (
                <LiveCallCard key={c.id} call={c} isLive={false} />
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}
    </div>
  );
}
