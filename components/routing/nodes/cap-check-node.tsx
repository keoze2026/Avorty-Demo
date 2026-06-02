"use client";

import { NodeFrame } from "./node-frame";
import { NODE_META } from "../node-meta";
import type { RFNodeProps } from "./types";
import { useTranslation } from "@/hooks/use-translation";

export function CapCheckNode({ data, selected }: RFNodeProps<"capCheck">) {
  const { t } = useTranslation();
  const KIND_LABEL = {
    daily: t("trafficUI.routing.nodes.capCheck.daily"),
    monthly: t("trafficUI.routing.nodes.capCheck.monthly"),
    concurrency: t("trafficUI.routing.nodes.capCheck.concurrency"),
  } as const;
  const meta = NODE_META.capCheck;
  const cfg = data.capCheck;
  if (!cfg) return null;

  return (
    <NodeFrame
      icon={meta.icon}
      title={t("trafficUI.routing.nodes.capCheck.label")}
      tone={meta.tone}
      selected={selected}
      outputs={[
        { id: "pass", yPercent: 0.35, label: t("trafficUI.routing.nodes.capCheck.under"), tone: "emerald" },
        { id: "fail", yPercent: 0.75, label: t("trafficUI.routing.nodes.capCheck.capped"), tone: "rose" },
      ]}
    >
      <div className="space-y-1 text-[11px]">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{KIND_LABEL[cfg.kind]}</span>
          <span className="font-mono font-semibold text-foreground">≤ {cfg.limit}</span>
        </div>
      </div>
    </NodeFrame>
  );
}
