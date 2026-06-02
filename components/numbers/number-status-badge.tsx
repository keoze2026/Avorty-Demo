"use client";

import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/use-translation";
import type { NumberStatus } from "@/lib/types";

const VARIANT: Record<NumberStatus, React.ComponentProps<typeof Badge>["variant"]> = {
  active: "success",
  paused: "warning",
  pending: "outline",
  expired: "secondary",
};

export function NumberStatusBadge({ status }: { status: NumberStatus }) {
  const { t } = useTranslation();
  const LABEL: Record<NumberStatus, string> = {
    active: t("trafficUI.numbers.statusOptions.active"),
    paused: t("trafficUI.numbers.statusOptions.paused"),
    pending: t("trafficUI.numbers.statusOptions.pending"),
    expired: t("trafficUI.numbers.statusOptions.expired"),
  };
  return (
    <Badge variant={VARIANT[status]} className="capitalize">
      {LABEL[status]}
    </Badge>
  );
}
