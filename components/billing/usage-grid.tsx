"use client";

/**
 * Usage this cycle — calls / tracking-numbers / publishers / integrations
 * counts. Calls used + plan cap come from the dashboard KPIs (real) and
 * /api/billing/account.plan; the rest are derived from the live entity
 * stores. The MOCK_USAGE seed is used only as a label/cap fallback when
 * the backend doesn't ship plan caps for a metric.
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Building2, Gauge, Hash, Plug, type LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { billingService } from "@/lib/api/services/billing.service";
import { useCallsStore } from "@/lib/store/calls-store";
import { useNumbersStore } from "@/lib/store/numbers-store";
import { usePublishersStore } from "@/lib/store/publishers-store";
import { MOCK_USAGE } from "@/lib/mock/billing";
import { formatCompact } from "@/lib/format";
import { useTranslation } from "@/hooks/use-translation";

const ICONS: Record<string, LucideIcon> = {
  calls: Gauge,
  numbers: Hash,
  publishers: Building2,
  integrations: Plug,
};

interface UsageMetric {
  key: string;
  label: string;
  used: number;
  /** Cap from the plan; 0 means "unlimited". */
  included: number;
}

export function UsageGrid() {
  const { t } = useTranslation();
  const kpis = useCallsStore((s) => s.kpis);
  const numbers = useNumbersStore((s) => s.numbers);
  const publishers = usePublishersStore((s) => s.publishers);

  // Plan caps — fetched once from the billing account. Falls back to the
  // mock seed values per-metric if the backend doesn't expose plan limits.
  const [planCallsIncluded, setPlanCallsIncluded] = useState<number | null>(null);
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const acc = await billingService.account();
        if (!cancelled) setPlanCallsIncluded(acc.plan?.callsIncluded ?? null);
      } catch {
        // Plan info unavailable — keep the per-metric mock cap as a label.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  type Key = (typeof MOCK_USAGE)[number]["key"];
  const mockByKey = new Map(MOCK_USAGE.map((m) => [m.key, m] as const));
  const fallbackCap = (key: Key) => mockByKey.get(key)?.included ?? 0;
  const fallbackLabel = (key: Key) => mockByKey.get(key)?.label ?? key;

  // Real metrics computed from the live stores. Each falls back to the mock
  // cap only for the *limit* (`included`) — the *used* value is always real.
  const activePublishers = publishers.filter((p) => p.status === "active").length;
  const metrics: UsageMetric[] = [
    {
      key: "calls",
      label: fallbackLabel("calls"),
      used: kpis?.totalCalls ?? 0,
      included: planCallsIncluded ?? fallbackCap("calls"),
    },
    {
      key: "numbers",
      label: fallbackLabel("numbers"),
      used: numbers.length,
      included: fallbackCap("numbers"),
    },
    {
      key: "publishers",
      label: fallbackLabel("publishers"),
      used: activePublishers,
      included: fallbackCap("publishers"),
    },
    {
      key: "integrations",
      label: fallbackLabel("integrations"),
      // Integration count isn't tracked in a single store — keep 0 until a
      // dedicated endpoint exists (`/api/integrations/connected/count`).
      used: 0,
      included: fallbackCap("integrations"),
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t("toolsUI.billing.usage.title")}</CardTitle>
        <p className="text-xs text-muted-foreground">{t("toolsUI.billing.usage.description")}</p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m, i) => {
            const Icon = ICONS[m.key] ?? Gauge;
            const pct =
              m.included > 0
                ? Math.min(100, Math.round((m.used / m.included) * 100))
                : 0;
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
                    {m.included > 0 ? `${pct}%` : "—"}
                  </span>
                </div>
                <div className="mt-3 font-mono text-lg font-semibold">
                  {formatCompact(m.used)}
                  {m.included > 0 && (
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                      / {formatCompact(m.included)}
                    </span>
                  )}
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {(() => {
                    const key = `billing.usageMetrics.${m.key}`;
                    const resolved = t(key);
                    return resolved === key ? m.label : resolved;
                  })()}
                </div>
                {m.included > 0 && (
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
                )}
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
