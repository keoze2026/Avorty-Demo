"use client";

import { NodeFrame } from "./node-frame";
import { NODE_META } from "../node-meta";
import type { RFNodeProps } from "./types";

const OP_LABEL = {
  equals: "=",
  contains: "⊇",
  "starts-with": "starts",
} as const;

export function TagFilterNode({ data, selected }: RFNodeProps<"tagFilter">) {
  const meta = NODE_META.tagFilter;
  const cfg = data.tagFilter;
  if (!cfg) return null;

  return (
    <NodeFrame
      icon={meta.icon}
      title={meta.label}
      tone={meta.tone}
      selected={selected}
      outputs={[
        { id: "pass", yPercent: 0.35, label: "Match", tone: "emerald" },
        { id: "fail", yPercent: 0.75, label: "Miss", tone: "rose" },
      ]}
    >
      <div className="space-y-1 text-[11px]">
        <div className="font-mono">
          <span className="text-muted-foreground">{cfg.tag}</span>
          <span className="mx-1 text-accent">{OP_LABEL[cfg.operator]}</span>
          <span className="text-foreground">"{cfg.value}"</span>
        </div>
      </div>
    </NodeFrame>
  );
}
