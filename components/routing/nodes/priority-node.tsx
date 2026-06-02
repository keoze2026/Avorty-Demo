"use client";

import { NodeFrame } from "./node-frame";
import { NODE_META } from "../node-meta";
import type { RFNodeProps } from "./types";
import { useTranslation } from "@/hooks/use-translation";

export function PriorityNode({ data, selected }: RFNodeProps<"priority">) {
  const { t } = useTranslation();
  const meta = NODE_META.priority;
  const cfg = data.priority;
  if (!cfg) return null;

  return (
    <NodeFrame
      icon={meta.icon}
      title={t("trafficUI.routing.nodes.priority.label")}
      tone={meta.tone}
      selected={selected}
      outputs={[
        { id: "primary", yPercent: 0.35, label: t("trafficUI.routing.nodes.priority.first"), tone: "emerald" },
        { id: "fallback", yPercent: 0.75, label: t("trafficUI.routing.nodes.priority.second"), tone: "amber" },
      ]}
    >
      <div className="space-y-1 text-[11px]">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{t("trafficUI.routing.nodes.priority.primary")}</span>
          <span className="font-mono text-foreground truncate max-w-[140px]">{cfg.primaryLabel}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{t("trafficUI.routing.nodes.priority.fallback")}</span>
          <span className="font-mono text-foreground truncate max-w-[140px]">{cfg.fallbackLabel}</span>
        </div>
      </div>
    </NodeFrame>
  );
}
