"use client";

import * as React from "react";

import { Card } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";

/**
 * Client-only label helpers for the server-rendered Coin detail page.
 * The detail page itself fetches data on the server; these little
 * client islands look up translation keys so the labels follow the
 * active locale.
 */

export function CoinDetailLabels({ which, params }: { which: string; params?: Record<string, string> }) {
  const { t } = useTranslation();
  let s = t(`toolsUI.news.coinDetail.${which}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      s = s.replace(`{${k}}`, v);
    }
  }
  return <>{s}</>;
}

export function CoinDetailStat({
  labelKey,
  value,
  foot,
}: {
  labelKey: string;
  value: string;
  foot?: React.ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <Card className="p-4">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {t(`toolsUI.news.coinDetail.${labelKey}`)}
      </div>
      <div className="mt-1.5 text-lg font-semibold tabular-nums">{value}</div>
      {foot && <div className="mt-1">{foot}</div>}
    </Card>
  );
}
