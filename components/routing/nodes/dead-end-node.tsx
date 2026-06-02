"use client";

import { NodeFrame } from "./node-frame";
import { NODE_META } from "../node-meta";
import type { RFNodeProps } from "./types";
import { useTranslation } from "@/hooks/use-translation";

export function DeadEndNode({ data, selected }: RFNodeProps<"deadEnd">) {
  const { t } = useTranslation();
  const meta = NODE_META.deadEnd;
  const cfg = data.deadEnd;
  if (!cfg) return null;

  return (
    <NodeFrame icon={meta.icon} title={t("trafficUI.routing.nodes.deadEnd.label")} tone={meta.tone} selected={selected} outputs={[]}>
      <div className="text-[11px] italic text-muted-foreground line-clamp-2">"{cfg.reason}"</div>
    </NodeFrame>
  );
}
