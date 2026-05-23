"use client";

import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, PauseCircle, Scale, Sparkles, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AI_RECOMMENDATIONS, type Recommendation } from "@/lib/mock/timeseries";
import { cn } from "@/lib/utils";

const KIND_META: Record<
  Recommendation["kind"],
  { icon: LucideIcon; tone: string; ring: string }
> = {
  scale: { icon: TrendingUp, tone: "text-accent", ring: "ring-accent/30" },
  pause: { icon: PauseCircle, tone: "text-[oklch(0.6_0.16_75)] dark:text-[oklch(0.82_0.16_75)]", ring: "ring-[oklch(0.6_0.16_75)]/30" },
  rebalance: { icon: Scale, tone: "text-[oklch(0.55_0.2_290)] dark:text-[oklch(0.72_0.2_290)]", ring: "ring-[oklch(0.6_0.2_290)]/30" },
  alert: { icon: AlertTriangle, tone: "text-destructive", ring: "ring-destructive/30" },
};

export function AiRecommendations() {
  return (
    <Card className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-32 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse 50% 100% at 50% 0%, var(--vortyx-glow), transparent 70%)",
        }}
      />

      <CardHeader className="relative flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-accent/15 text-accent">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <CardTitle className="text-base">AI insights</CardTitle>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          Updated 4m ago
        </span>
      </CardHeader>

      <CardContent className="relative">
        <div className="-mx-2 flex gap-3 overflow-x-auto px-2 pb-2 scrollbar-hide">
          {AI_RECOMMENDATIONS.map((r, i) => {
            const meta = KIND_META[r.kind];
            const Icon = meta.icon;
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.32 }}
                className={cn(
                  "group relative w-72 shrink-0 rounded-lg border border-border bg-card/80 p-4 transition-all",
                  "hover:-translate-y-0.5 hover:shadow-lg hover:ring-2",
                  meta.ring,
                )}
              >
                <div className="flex items-center gap-2">
                  <span className={cn("inline-flex h-7 w-7 items-center justify-center rounded-md bg-secondary/60", meta.tone)}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    {r.kind}
                  </span>
                </div>
                <h3 className="mt-2 text-sm font-semibold leading-snug">{r.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{r.body}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className={cn("font-mono text-[10px]", meta.tone)}>{r.impact}</span>
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
                    Apply <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
