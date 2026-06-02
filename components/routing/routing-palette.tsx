"use client";

/**
 * Drag source for the editor canvas.
 * Each item drags an `application/reactflow` payload of the node kind;
 * the canvas reads it on drop and instantiates a node at that position.
 */

import { motion } from "framer-motion";

import { NODE_META, PALETTE_ORDER, TONE_STYLE } from "./node-meta";
import { useTranslation } from "@/hooks/use-translation";
import type { RoutingNodeKind } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RoutingPaletteProps {
  className?: string;
  /** Hint shown if the editor only allows one Inbound node */
  inboundExists?: boolean;
}

export function RoutingPalette({ className, inboundExists = false }: RoutingPaletteProps) {
  const { t } = useTranslation();
  const onDragStart = (e: React.DragEvent, kind: RoutingNodeKind) => {
    e.dataTransfer.setData("application/reactflow", kind);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className={cn("flex h-full flex-col gap-3 overflow-hidden", className)}>
      <div className="px-1">
        <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("trafficUI.routing.palette.title")}
        </h2>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {t("trafficUI.routing.palette.hint")}
        </p>
      </div>

      <div className="flex-1 space-y-1.5 overflow-auto pr-1">
        {PALETTE_ORDER.map((kind, i) => {
          const meta = NODE_META[kind];
          const tone = TONE_STYLE[meta.tone];
          const Icon = meta.icon;
          const disabled = kind === "inbound" && inboundExists;
          const label = t(`trafficUI.routing.nodes.${kind}.label`);
          const description = t(`trafficUI.routing.nodes.${kind}.description`);
          return (
            <motion.div
              key={kind}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.02 * i, duration: 0.25 }}
            >
              <div
                draggable={!disabled}
                onDragStart={(e) => !disabled && onDragStart(e, kind)}
                role="button"
                tabIndex={disabled ? -1 : 0}
                aria-disabled={disabled}
                aria-label={
                  disabled
                    ? t("trafficUI.routing.palette.alreadyExists").replace("{label}", label)
                    : t("trafficUI.routing.palette.dragAdd").replace("{label}", label)
                }
                className={cn(
                  "group flex cursor-grab items-start gap-2.5 rounded-lg border border-border bg-card p-2.5 text-left transition-all hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                  disabled && "cursor-not-allowed opacity-50 hover:translate-y-0 hover:shadow-none",
                )}
              >
                <span className={cn("inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md", tone.icon)}>
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <div className="text-[12px] font-medium leading-snug">{label}</div>
                  <div className="line-clamp-2 text-[10px] text-muted-foreground">
                    {disabled ? t("trafficUI.routing.palette.alreadyOnCanvas") : description}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </aside>
  );
}
