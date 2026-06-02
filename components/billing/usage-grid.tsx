"use client";

import { motion } from "framer-motion";
import { Building2, Gauge, Hash, Plug, type LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_USAGE } from "@/lib/mock/billing";
import { formatCompact } from "@/lib/format";
import { useTranslation } from "@/hooks/use-translation";

const ICONS: Record<string, LucideIcon> = {
  calls: Gauge,
  numbers: Hash,
  publishers: Building2,
  integrations: Plug,
};

export function UsageGrid() {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t("toolsUI.billing.usage.title")}</CardTitle>
        <p className="text-xs text-muted-foreground">{t("toolsUI.billing.usage.description")}</p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {MOCK_USAGE.map((m, i) => {
            const Icon = ICONS[m.key] ?? Gauge;
            const pct = Math.min(100, Math.round((m.used / m.included) * 100));
            const danger = pct > 85;
            return (
              <motion.div
                key={m.key}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.25 }}
                className="rounded-lg border border-border bg-secondary/30 p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-accent/10 text-accent">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className={`text-[10px] font-mono ${danger ? "text-[color:var(--warning)]" : "text-muted-foreground"}`}>
                    {pct}%
                  </span>
                </div>
                <div className="mt-3 font-mono text-lg font-semibold">
                  {formatCompact(m.used)}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    / {formatCompact(m.included)}
                  </span>
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {(() => {
                    const key = `billing.usageMetrics.${m.key}`;
                    const resolved = t(key);
                    return resolved === key ? m.label : resolved;
                  })()}
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary/60">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      danger
                        ? "bg-gradient-to-r from-[color:var(--warning)] to-[color:var(--destructive)]"
                        : "bg-gradient-to-r from-[color:var(--accent)] to-[color:var(--vortyx-cyan)]"
                    }`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
