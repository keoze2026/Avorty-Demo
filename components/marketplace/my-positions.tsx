"use client";

/**
 * The user's bid history on this trading session — live status per row.
 * leading → outbid → won/lost via the simulation loop.
 */

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Trophy, XCircle, ZapOff } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VERTICAL_PALETTE } from "@/lib/mock/marketplace";
import { useMarketplaceStore } from "@/lib/store/marketplace-store";
import { useTranslation } from "@/hooks/use-translation";
import { formatCurrency } from "@/lib/format";
import type { MyPosition } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_META: Record<
  MyPosition["status"],
  { labelKey: string; icon: typeof Trophy; tone: string }
> = {
  leading: {
    labelKey: "toolsUI.marketplace.myPositions.leading",
    icon: CheckCircle2,
    tone: "border-[color:var(--success)]/40 bg-[color:var(--success)]/10 text-[color:var(--success)]",
  },
  outbid: {
    labelKey: "toolsUI.marketplace.myPositions.outbid",
    icon: ZapOff,
    tone: "border-destructive/40 bg-destructive/10 text-destructive",
  },
  won: {
    labelKey: "toolsUI.marketplace.myPositions.won",
    icon: Trophy,
    tone: "border-[color:var(--success)]/40 bg-[color:var(--success)]/10 text-[color:var(--success)]",
  },
  lost: {
    labelKey: "toolsUI.marketplace.myPositions.lost",
    icon: XCircle,
    tone: "border-border bg-secondary/40 text-muted-foreground",
  },
};

export function MyPositions() {
  const { t } = useTranslation();
  const positions = useMarketplaceStore((s) => s.positions);
  const stats = positionStats(positions);

  return (
    <Card className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, var(--accent) 30%, var(--vortyx-cyan) 70%, transparent)",
          opacity: 0.4,
        }}
      />

      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <span>{t("toolsUI.marketplace.myPositions.title")}</span>
          <span className="font-mono text-xs text-muted-foreground">
            <span className="text-[color:var(--success)]">{stats.wins}</span>
            <span className="text-muted-foreground/60"> / </span>
            <span className="text-foreground">{stats.total}</span>
          </span>
        </CardTitle>
        <p className="text-[11px] text-muted-foreground">
          {t("toolsUI.marketplace.myPositions.description")}
        </p>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {positions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/60 bg-secondary/30 p-6 text-center text-xs text-muted-foreground">
            {t("toolsUI.marketplace.myPositions.empty")}
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {positions.map((p) => {
              const meta = STATUS_META[p.status];
              const Icon = meta.icon;
              const palette = VERTICAL_PALETTE[p.vertical];
              return (
                <motion.div
                  key={p.listingId}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2.5 rounded-lg border border-border bg-card/40 p-2.5 backdrop-blur"
                >
                  <span className={cn("inline-block h-2 w-2 shrink-0 rounded-full", palette.dot)} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-medium">{p.campaignName}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">
                      {p.geo.state} · {p.vertical}
                    </div>
                  </div>
                  <span className="font-mono text-xs">{formatCurrency(p.myBid, true)}</span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider",
                      meta.tone,
                      p.status === "leading" && "animate-vortyx-pulse",
                    )}
                  >
                    <Icon className="h-2.5 w-2.5" />
                    {t(meta.labelKey)}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
}

function positionStats(positions: MyPosition[]) {
  const total = positions.length;
  const wins = positions.filter((p) => p.status === "won" || p.status === "leading").length;
  return { total, wins };
}
