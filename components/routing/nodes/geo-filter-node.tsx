"use client";

import { NodeFrame } from "./node-frame";
import { NODE_META } from "../node-meta";
import type { RFNodeProps } from "./types";
import { useTranslation } from "@/hooks/use-translation";

export function GeoFilterNode({ data, selected }: RFNodeProps<"geoFilter">) {
  const { t } = useTranslation();
  const meta = NODE_META.geoFilter;
  const cfg = data.geoFilter;
  if (!cfg) return null;

  const shown = cfg.states.slice(0, 4);
  const overflow = cfg.states.length - shown.length;

  return (
    <NodeFrame
      icon={meta.icon}
      title={t("trafficUI.routing.nodes.geoFilter.label")}
      tone={meta.tone}
      selected={selected}
      outputs={[
        { id: "pass", yPercent: 0.35, label: t("trafficUI.routing.nodes.geoFilter.match"), tone: "emerald" },
        { id: "fail", yPercent: 0.75, label: t("trafficUI.routing.nodes.geoFilter.skip"), tone: "rose" },
      ]}
    >
      <div className="space-y-1.5">
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          {cfg.mode === "allow" ? t("trafficUI.routing.nodes.geoFilter.allowList") : t("trafficUI.routing.nodes.geoFilter.denyList")}
        </div>
        <div className="flex flex-wrap gap-1">
          {shown.length === 0 && (
            <span className="text-[11px] italic text-muted-foreground">{t("trafficUI.routing.nodes.geoFilter.noStates")}</span>
          )}
          {shown.map((s) => (
            <span
              key={s}
              className="inline-flex h-5 items-center rounded border border-border bg-secondary/60 px-1.5 text-[10px] font-mono"
            >
              {s}
            </span>
          ))}
          {overflow > 0 && (
            <span className="text-[10px] font-mono text-muted-foreground">+{overflow}</span>
          )}
        </div>
      </div>
    </NodeFrame>
  );
}
