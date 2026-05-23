"use client";

import { Globe2 } from "lucide-react";
import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GEO_DISTRIBUTION } from "@/lib/mock/timeseries";
import { formatCurrency, formatNumber } from "@/lib/format";

export function GeoDistribution() {
  const max = Math.max(...GEO_DISTRIBUTION.map((g) => g.calls), 1);
  const total = GEO_DISTRIBUTION.reduce((s, g) => s + g.calls, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Globe2 className="h-4 w-4 text-accent" />
          Geo distribution
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {formatNumber(total)} calls across top states
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {GEO_DISTRIBUTION.map((g, i) => {
          const pct = (g.calls / max) * 100;
          return (
            <div key={g.state} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className="inline-flex h-5 w-7 items-center justify-center rounded border border-border bg-secondary/60 font-mono text-[10px]">
                    {g.state}
                  </span>
                  <span className="text-muted-foreground">{g.name}</span>
                </span>
                <span className="font-mono">
                  {formatNumber(g.calls)} <span className="text-muted-foreground">·</span>{" "}
                  <span className="text-muted-foreground">{formatCurrency(g.revenue)}</span>
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-secondary/60">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ delay: 0.05 * i, duration: 0.6, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-[color:var(--accent)] to-[color:var(--vortyx-bright)]"
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
