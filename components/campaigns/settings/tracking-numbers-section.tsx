"use client";

import { useMemo } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Hash } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { useNumbersStore } from "@/lib/store/numbers-store";
import { formatCurrency, toE164 } from "@/lib/format";

export function TrackingNumbersSection({ campaignId }: { campaignId: string }) {
  const { t } = useTranslation();
  // Stable selector + useMemo to avoid the new-ref-per-render Zustand loop.
  const allNumbers = useNumbersStore((s) => s.numbers);
  const setNumberStatus = useNumbersStore((s) => s.setNumberStatus);
  const numbers = useMemo(
    () => (allNumbers ?? []).filter((n) => n.campaignId === campaignId),
    [allNumbers, campaignId],
  );

  return (
    <section className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-[13px] font-semibold uppercase tracking-wider">{t("trafficUI.campaigns.settings.trackingNumbers.title")}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("trafficUI.campaigns.settings.trackingNumbers.description")}
          </p>
        </div>
        <Button size="sm" onClick={() => toast.info(t("trafficUI.campaigns.settings.trackingNumbers.provisionSoon"))}>
          <Plus className="h-4 w-4" /> {t("trafficUI.campaigns.settings.trackingNumbers.add")}
        </Button>
      </div>

      {numbers.length === 0 ? (
        <EmptyState
          icon={Hash}
          tone="violet"
          title={t("trafficUI.campaigns.settings.trackingNumbers.empty.title")}
          description={t("trafficUI.campaigns.settings.trackingNumbers.empty.description")}
          actions={
            <Button size="sm">
              <Plus className="h-4 w-4" /> {t("trafficUI.campaigns.settings.trackingNumbers.addTracking")}
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6 uppercase tracking-wider text-[11px]">{t("trafficUI.campaigns.settings.trackingNumbers.headers.number")}</TableHead>
                <TableHead className="uppercase tracking-wider text-[11px]">{t("trafficUI.campaigns.settings.trackingNumbers.headers.type")}</TableHead>
                <TableHead className="uppercase tracking-wider text-[11px]">{t("trafficUI.campaigns.settings.trackingNumbers.headers.name")}</TableHead>
                <TableHead className="uppercase tracking-wider text-[11px]">{t("trafficUI.campaigns.settings.trackingNumbers.headers.vendor")}</TableHead>
                <TableHead className="uppercase tracking-wider text-[11px]">{t("trafficUI.campaigns.settings.trackingNumbers.headers.payout")}</TableHead>
                <TableHead className="text-center uppercase tracking-wider text-[11px]">{t("trafficUI.campaigns.settings.trackingNumbers.headers.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {numbers.map((n) => (
                <TableRow key={n.id}>
                  <TableCell className="pl-6 font-mono text-xs whitespace-nowrap">
                    {toE164(n.number)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {n.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{n.label ?? "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {n.vendor ?? "Vortyx"}
                  </TableCell>
                  <TableCell className="font-mono text-xs tabular-nums">
                    {formatCurrency(n.payoutPerCall ?? 0, true)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={n.status === "active"}
                      onCheckedChange={(v) => {
                        setNumberStatus(n.id, v ? "active" : "paused");
                        toast.success(
                          v
                            ? t("trafficUI.campaigns.settings.trackingNumbers.toast.activated").replace("{number}", toE164(n.number))
                            : t("trafficUI.campaigns.settings.trackingNumbers.toast.paused").replace("{number}", toE164(n.number)),
                        );
                      }}
                      aria-label={t("trafficUI.numbers.pools.toggle").replace("{name}", toE164(n.number))}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </section>
  );
}
