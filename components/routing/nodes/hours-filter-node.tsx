"use client";

import { NodeFrame } from "./node-frame";
import { NODE_META } from "../node-meta";
import type { RFNodeProps } from "./types";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function HoursFilterNode({ data, selected }: RFNodeProps<"hoursFilter">) {
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
      title={meta.label}
      tone={meta.tone}
      selected={selected}
      outputs={[
        { id: "pass", yPercent: 0.35, label: "Open", tone: "emerald" },
        { id: "fail", yPercent: 0.75, label: "Closed", tone: "rose" },
      ]}
    >
      <div className="space-y-1 text-[11px]">
        <div className="font-mono font-semibold text-foreground">
          {cfg.startHour.toString().padStart(2, "0")}:00 – {cfg.endHour.toString().padStart(2, "0")}:00
        </div>
        <div className="truncate text-muted-foreground">{dayChips || "No days"}</div>
      </div>
    </NodeFrame>
  );
}
