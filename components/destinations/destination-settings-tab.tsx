"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";

import { AutoScheduleCard } from "@/components/shared/auto-schedule-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";
import { ROUTES } from "@/lib/constants";
import { useBuyersStore } from "@/lib/store/buyers-store";
import { formatCompact, toE164 } from "@/lib/format";
import type { Destination } from "@/lib/types";

interface DestinationSettingsTabProps {
  destination: Destination;
  onEdit: () => void;
}

export function DestinationSettingsTab({
  destination,
  onEdit,
}: DestinationSettingsTabProps) {
  const { t } = useTranslation();
  const buyer = useBuyersStore((s) => s.buyers.find((b) => b.id === destination.buyerId));

  return (
    <div className="space-y-4">
      <AutoScheduleCard
        target="destination"
        id={destination.id}
        entityLabel="destination"
      />

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
          <div>
            <CardTitle className="text-base">{t("networkUI.destinations.settings.configurationTitle")}</CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("networkUI.destinations.settings.configurationDesc")}
          </p>
        </div>
        <Button size="sm" onClick={onEdit}>
          <Pencil className="h-3.5 w-3.5" /> {t("networkUI.destinations.settings.editSettings")}
        </Button>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          <Row label={t("networkUI.destinations.settings.name")} value={<span>{destination.name}</span>} />
          <Row label={t("networkUI.destinations.settings.tfn")} value={<span className="font-mono">{toE164(destination.tfn)}</span>} />
          <Row
            label={t("networkUI.destinations.settings.buyer")}
            value={
              buyer ? (
                <Link
                  href={`${ROUTES.buyers}/${buyer.id}`}
                  className="transition-colors hover:text-accent"
                >
                  {buyer.name}
                </Link>
              ) : (
                <span className="text-muted-foreground">—</span>
              )
            }
          />
          <Row
            label={t("networkUI.destinations.settings.status")}
            value={
              destination.enabled ? (
                <Badge variant="success">{t("networkUI.destinations.settings.active")}</Badge>
              ) : (
                <Badge variant="outline">{t("networkUI.destinations.settings.disabled")}</Badge>
              )
            }
          />
          <Row
            label={t("networkUI.destinations.settings.concurrencyCap")}
            value={<span className="font-mono">{destination.concurrencyCap}</span>}
          />
          <Row
            label={t("networkUI.destinations.settings.dailyCap")}
            value={
              <span className="font-mono">
                {destination.dailyCap === 0 ? "∞" : formatCompact(destination.dailyCap)}
              </span>
            }
          />
          <Row
            label={t("networkUI.destinations.settings.monthlyCap")}
            value={
              <span className="font-mono">
                {destination.monthlyCap === 0 ? "∞" : formatCompact(destination.monthlyCap)}
              </span>
            }
          />
          <Row
            label={t("networkUI.destinations.settings.destinationId")}
            value={
              <span className="font-mono text-xs text-muted-foreground">{destination.id}</span>
            }
          />
        </dl>
      </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/40 pb-2 last:border-b-0 last:pb-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}
