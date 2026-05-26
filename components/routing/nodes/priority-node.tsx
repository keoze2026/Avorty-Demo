"use client";

import { NodeFrame } from "./node-frame";
import { NODE_META } from "../node-meta";
import type { RFNodeProps } from "./types";

export function PriorityNode({ data, selected }: RFNodeProps<"priority">) {
  const meta = NODE_META.priority;
  const cfg = data.priority;
  if (!cfg) return null;

  return (
    <NodeFrame
      icon={meta.icon}
      title={meta.label}
      tone={meta.tone}
      selected={selected}
      outputs={[
        { id: "primary", yPercent: 0.35, label: "1st", tone: "emerald" },
        { id: "fallback", yPercent: 0.75, label: "2nd", tone: "amber" },
      ]}
    >
      <div className="space-y-1 text-[11px]">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Primary</span>
          <span className="font-mono text-foreground truncate max-w-[140px]">{cfg.primaryLabel}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Fallback</span>
          <span className="font-mono text-foreground truncate max-w-[140px]">{cfg.fallbackLabel}</span>
        </div>
      </div>
    </NodeFrame>
  );
}
