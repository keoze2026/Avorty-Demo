"use client";

/**
 * Shared visual frame for every routing node — keeps every kind consistent
 * (icon header, body, handle layout) and theme-aware.
 */

import * as React from "react";
import { Handle, Position } from "@xyflow/react";
import type { LucideIcon } from "lucide-react";

import { TONE_STYLE, type NodeTone } from "../node-meta";
import { cn } from "@/lib/utils";

interface HandleSpec {
  id: string;
  /** Vertical position (0–1) along the right edge */
  yPercent?: number;
  /** Tone color override for the handle (defaults to the node's tone) */
  tone?: NodeTone;
  /** Label rendered next to the handle */
  label?: string;
}

interface NodeFrameProps {
  icon: LucideIcon;
  title: string;
  tone: NodeTone;
  selected?: boolean;
  /** Whether the node has a single input handle on the left */
  hasInput?: boolean;
  /** Output handles on the right — multiple supported */
  outputs?: HandleSpec[];
  children?: React.ReactNode;
}

export function NodeFrame({
  icon: Icon,
  title,
  tone,
  selected,
  hasInput = true,
  outputs = [],
  children,
}: NodeFrameProps) {
  const t = TONE_STYLE[tone];

  return (
    <div
      className={cn(
        "relative min-w-[220px] max-w-[280px] rounded-xl border bg-card shadow-sm transition-all",
        selected ? `${t.border} ring-2 ${t.ring}` : "border-border",
      )}
      style={{ boxShadow: selected ? `0 0 0 1px ${t.cssVar}33, 0 8px 24px ${t.cssVar}22` : undefined }}
    >
      {/* Top tone strip */}
      <div className="h-1 w-full rounded-t-xl" style={{ background: t.cssVar }} />

      {/* Header */}
      <div className="flex items-center gap-2 px-3 pt-2.5">
        <span className={cn("inline-flex h-7 w-7 items-center justify-center rounded-md", t.icon)}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="text-xs font-mono font-medium uppercase tracking-wider text-foreground">
          {title}
        </span>
      </div>

      {/* Body */}
      <div className="px-3 pb-3 pt-2">{children}</div>

      {/* Input handle (left center) */}
      {hasInput && (
        <Handle
          type="target"
          id="in"
          position={Position.Left}
          className="!h-3 !w-3 !rounded-full !border-2 !border-card"
          style={{ background: t.cssVar }}
        />
      )}

      {/* Output handles (right edge, distributed) */}
      {outputs.map((o, i) => {
        const y = o.yPercent ?? (outputs.length === 1 ? 0.5 : i / (outputs.length - 1) * 0.6 + 0.2);
        const handleTone = o.tone ?? tone;
        const handleColor = TONE_STYLE[handleTone].cssVar;
        return (
          <React.Fragment key={o.id}>
            <Handle
              type="source"
              id={o.id}
              position={Position.Right}
              className="!h-3 !w-3 !rounded-full !border-2 !border-card"
              style={{ background: handleColor, top: `${y * 100}%` }}
            />
            {o.label && (
              <span
                className="pointer-events-none absolute -translate-y-1/2 rounded-full border bg-card px-1.5 py-px text-[9px] font-mono uppercase tracking-wider"
                style={{
                  top: `${y * 100}%`,
                  right: -10,
                  transform: `translate(100%, -50%)`,
                  borderColor: handleColor,
                  color: handleColor,
                }}
              >
                {o.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
