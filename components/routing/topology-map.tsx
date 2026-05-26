/**
 * TopologyMap — abstract miniature of a routing plan's node graph.
 *
 * Reads the plan's own node positions and edges, normalizes them into a
 * 0..1 viewBox, then renders an SVG with kind-coded nodes + curved edges.
 * Each card visualizes its real shape, so no two cards look the same.
 */

"use client";

import type { RoutingPlan, RoutingNode } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TopologyMapProps {
  plan: RoutingPlan;
  className?: string;
}

/** Color per node kind — matches the rest of the routing visual vocabulary. */
const KIND_COLOR: Record<RoutingNode["type"], string> = {
  inbound: "var(--accent)",
  hoursFilter: "oklch(0.7 0.16 75)",
  geoFilter: "oklch(0.7 0.16 75)",
  tagFilter: "oklch(0.7 0.16 75)",
  weightSplit: "oklch(0.7 0.2 290)",
  priority: "oklch(0.7 0.2 290)",
  capCheck: "oklch(0.7 0.2 290)",
  buyer: "oklch(0.65 0.18 155)",
  deadEnd: "oklch(0.65 0.04 240)",
};

export function TopologyMap({ plan, className }: TopologyMapProps) {
  const W = 320;
  const H = 130;
  const PAD = 16;

  // Empty / single-node plans
  if (plan.nodes.length === 0) {
    return (
      <div
        className={cn(
          "flex h-[130px] items-center justify-center rounded-lg border border-dashed border-border/60 bg-secondary/20",
          className,
        )}
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          no nodes
        </span>
      </div>
    );
  }

  // Bounds of the stored positions → normalize into (PAD .. W-PAD, PAD .. H-PAD)
  const xs = plan.nodes.map((n) => n.position.x);
  const ys = plan.nodes.map((n) => n.position.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanX = Math.max(1, maxX - minX);
  const spanY = Math.max(1, maxY - minY);

  const project = (x: number, y: number) => ({
    x: PAD + ((x - minX) / spanX) * (W - 2 * PAD),
    y: PAD + ((y - minY) / spanY) * (H - 2 * PAD),
  });

  // If there's only one node, just center it.
  const center = plan.nodes.length === 1;

  const nodePos = new Map(
    plan.nodes.map((n) => {
      const p = center ? { x: W / 2, y: H / 2 } : project(n.position.x, n.position.y);
      return [n.id, p];
    }),
  );

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-border/70 bg-gradient-to-b from-background to-secondary/20",
        className,
      )}
      style={{ aspectRatio: `${W} / ${H}` }}
    >
      {/* Background micro-grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-micro-grid opacity-25"
        style={{
          maskImage:
            "radial-gradient(ellipse 100% 80% at 50% 50%, black 30%, transparent 95%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 100% 80% at 50% 50%, black 30%, transparent 95%)",
        }}
      />

      {/* Soft glow behind the graph */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, color-mix(in oklab, var(--accent) 12%, transparent), transparent 75%)",
        }}
      />

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        <defs>
          <marker
            id={`arrow-${plan.id}`}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
            markerUnits="userSpaceOnUse"
          >
            <path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" opacity="0.55" />
          </marker>
        </defs>

        {/* Edges — drawn first so nodes overlay them */}
        {plan.edges.map((e) => {
          const a = nodePos.get(e.source);
          const b = nodePos.get(e.target);
          if (!a || !b) return null;
          // Cubic curve so adjacent edges fan out cleanly
          const dx = (b.x - a.x) * 0.4;
          const path = `M ${a.x} ${a.y} C ${a.x + dx} ${a.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}`;
          const isFail = e.sourceHandle === "fail";
          return (
            <path
              key={e.id}
              d={path}
              fill="none"
              stroke={
                isFail
                  ? "color-mix(in oklab, var(--destructive) 70%, transparent)"
                  : "color-mix(in oklab, var(--accent) 70%, transparent)"
              }
              strokeWidth={1.3}
              strokeDasharray={isFail ? "3 3" : undefined}
              markerEnd={`url(#arrow-${plan.id})`}
              opacity={0.85}
            />
          );
        })}

        {/* Nodes */}
        {plan.nodes.map((n) => {
          const p = nodePos.get(n.id);
          if (!p) return null;
          const color = KIND_COLOR[n.type];
          const isTerminal = n.type === "buyer" || n.type === "deadEnd";
          const r = n.type === "inbound" ? 5.5 : isTerminal ? 5 : 4;

          return (
            <g key={n.id}>
              {/* Halo */}
              <circle
                cx={p.x}
                cy={p.y}
                r={r + 4}
                fill={color}
                opacity={0.14}
              />
              {/* Body */}
              <circle
                cx={p.x}
                cy={p.y}
                r={r}
                fill={n.type === "deadEnd" ? "var(--card)" : color}
                stroke={color}
                strokeWidth={n.type === "deadEnd" ? 1.5 : 0}
              />
              {/* Inbound center pulse */}
              {n.type === "inbound" && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={r}
                  fill="none"
                  stroke={color}
                  strokeOpacity={0.6}
                  strokeWidth={1}
                >
                  <animate
                    attributeName="r"
                    from={r}
                    to={r + 8}
                    dur="2.4s"
                    begin="0s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="stroke-opacity"
                    from="0.6"
                    to="0"
                    dur="2.4s"
                    begin="0s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </g>
          );
        })}
      </svg>

      {/* Corner crosshairs (HUD overlay) */}
      <Crosshair className="left-1 top-1" />
      <Crosshair className="right-1 top-1" />
      <Crosshair className="left-1 bottom-1" />
      <Crosshair className="right-1 bottom-1" />

      {/* Bottom legend strip */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 border-t border-border/40 bg-card/85 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground backdrop-blur-sm">
        <span className="inline-flex items-center gap-1">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--accent)" }}
          />
          inbound
        </span>
        <span className="inline-flex items-center gap-1">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: "oklch(0.7 0.16 75)" }}
          />
          filter
        </span>
        <span className="inline-flex items-center gap-1">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: "oklch(0.65 0.18 155)" }}
          />
          buyer
        </span>
      </div>
    </div>
  );
}

function Crosshair({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute h-2 w-2",
        "before:absolute before:left-1/2 before:top-0 before:h-full before:w-px before:-translate-x-1/2 before:bg-accent/55",
        "after:absolute after:left-0 after:top-1/2 after:h-px after:w-full after:-translate-y-1/2 after:bg-accent/55",
        className,
      )}
    />
  );
}
