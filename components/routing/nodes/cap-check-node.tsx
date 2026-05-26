"use client";

import { NodeFrame } from "./node-frame";
import { NODE_META } from "../node-meta";
import type { RFNodeProps } from "./types";

const KIND_LABEL = {
  daily: "Daily cap",
  monthly: "Monthly cap",
  concurrency: "Concurrent calls",
} as const;

export function CapCheckNode({ data, selected }: RFNodeProps<"capCheck">) {
  const meta = NODE_META.capCheck;
  const cfg = data.capCheck;
  if (!cfg) return null;

  return (
    <NodeFrame
      icon={meta.icon}
      title={meta.label}
      tone={meta.tone}
      selected={selected}
      outputs={[
        { id: "pass", yPercent: 0.35, label: "Under", tone: "emerald" },
        { id: "fail", yPercent: 0.75, label: "Capped", tone: "rose" },
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
