"use client";

import { NodeFrame } from "./node-frame";
import { NODE_META } from "../node-meta";
import type { RFNodeProps } from "./types";
import { useTranslation } from "@/hooks/use-translation";

export function HoursFilterNode({ data, selected }: RFNodeProps<"hoursFilter">) {
  const { t } = useTranslation();
  const DAY_NAMES = [
    t("trafficUI.common.days.sun"),
    t("trafficUI.common.days.mon"),
    t("trafficUI.common.days.tue"),
    t("trafficUI.common.days.wed"),
    t("trafficUI.common.days.thu"),
    t("trafficUI.common.days.fri"),
    t("trafficUI.common.days.sat"),
  ];
  const meta = NODE_META.hoursFilter;
  const cfg = data.hoursFilter;
  if (!cfg) return null;

  const dayChips = cfg.days
    .slice()
    .sort((a, b) => a - b)
    .map((d) => DAY_NAMES[d])
    .join(" · ");

  return (
    <NodeFrame
      icon={meta.icon}
      title={t("trafficUI.routing.nodes.hoursFilter.label")}
      tone={meta.tone}
      selected={selected}
      outputs={[
        { id: "pass", yPercent: 0.35, label: t("trafficUI.routing.nodes.hoursFilter.open"), tone: "emerald" },
        { id: "fail", yPercent: 0.75, label: t("trafficUI.routing.nodes.hoursFilter.closed"), tone: "rose" },
      ]}
    >
      <div className="space-y-1 text-[11px]">
        <div className="font-mono font-semibold text-foreground">
          {cfg.startHour.toString().padStart(2, "0")}:00 – {cfg.endHour.toString().padStart(2, "0")}:00
        </div>
        <div className="truncate text-muted-foreground">{dayChips || t("trafficUI.routing.nodes.hoursFilter.noDays")}</div>
      </div>
    </NodeFrame>
  );
}
