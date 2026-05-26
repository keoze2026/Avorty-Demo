"use client";

import { motion } from "framer-motion";
import { Filter } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FunnelStep } from "@/lib/analytics";
import { formatCompact, formatPercent } from "@/lib/format";

export function FunnelCard({ steps }: { steps: FunnelStep[] }) {
  const max = Math.max(...steps.map((s) => s.count), 1);
  const incoming = steps[0]?.count ?? 0;

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Filter className="h-4 w-4 text-accent" />
          Conversion funnel
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {formatCompact(incoming)} incoming → {formatCompact(steps.at(-1)?.count ?? 0)} paid
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {steps.map((s, i) => {
          const widthPct = (s.count / max) * 100;
          const overallRate = incoming > 0 ? (s.count / incoming) * 100 : 0;
          const prev = steps[i - 1]?.count ?? incoming;
          const stepRate = prev > 0 ? (s.count / prev) * 100 : 0;
          return (
            <div key={s.key} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">{s.label}</span>
                <span className="font-mono text-muted-foreground">
                  {formatCompact(s.count)}
                  {i > 0 && <span className="ml-2 text-[10px]">step {formatPercent(stepRate, 0)}</span>}
                </span>
              </div>
              <div className="relative h-8 overflow-hidden rounded-lg border border-border/60 bg-secondary/30">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPct}%` }}
                  transition={{ delay: i * 0.05, duration: 0.5, ease: "easeOut" }}
                  className="absolute inset-y-0 left-0 rounded-lg bg-gradient-to-r from-[color:var(--accent)] to-[color:var(--vortyx-cyan)]"
                  style={{ opacity: 0.18 + (steps.length - i) * 0.18 }}
                />
                <div className="relative flex h-full items-center justify-end pr-3">
                  <span className="font-mono text-[11px] text-foreground">
                    {formatPercent(overallRate, 0)} of incoming
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
