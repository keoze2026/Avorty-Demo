"use client";

import { NodeFrame } from "./node-frame";
import { NODE_META } from "../node-meta";
import type { RFNodeProps } from "./types";
import { useTranslation } from "@/hooks/use-translation";

export function WeightSplitNode({ data, selected }: RFNodeProps<"weightSplit">) {
  const { t } = useTranslation();
  const meta = NODE_META.weightSplit;
  const cfg = data.weightSplit;
  if (!cfg) return null;

  const a = Math.max(0, Math.min(100, cfg.weightA));
  const b = 100 - a;

  return (
    <NodeFrame
      icon={meta.icon}
      title={t("trafficUI.routing.nodes.weightSplit.label")}
      tone={meta.tone}
      selected={selected}
      outputs={[
        { id: "a", yPercent: 0.35, label: cfg.labelA ?? "A", tone: "cyan" },
        { id: "b", yPercent: 0.75, label: cfg.labelB ?? "B", tone: "violet" },
      ]}
    >
      <div className="space-y-2">
        <div className="flex justify-between text-[11px] font-mono">
          <span className="text-accent">{a}%</span>
          <span className="text-[oklch(0.55_0.2_290)] dark:text-[oklch(0.72_0.2_290)]">{b}%</span>
        </div>
        <div className="flex h-2 overflow-hidden rounded-full bg-secondary/60">
          <div className="bg-accent transition-all" style={{ width: `${a}%` }} />
          <div className="bg-[oklch(0.6_0.2_290)] transition-all" style={{ width: `${b}%` }} />
        </div>
      </div>
    </NodeFrame>
  );
}
