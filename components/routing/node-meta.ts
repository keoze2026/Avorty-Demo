/**
 * Catalog of routing node types — used by the palette (drag source),
 * the inspector (form), and the renderer (tone color).
 */

import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Clock,
  Filter,
  Gauge,
  GitFork,
  Globe2,
  PhoneIncoming,
  Tags,
  XOctagon,
} from "lucide-react";

import type { RoutingNodeData, RoutingNodeKind } from "@/lib/types";

export type NodeTone = "cyan" | "amber" | "violet" | "emerald" | "rose";

export interface NodeMeta {
  kind: RoutingNodeKind;
  label: string;
  description: string;
  icon: LucideIcon;
  tone: NodeTone;
  /** Number of inbound and outbound handles — used by the renderer. */
  inputs: number;
  outputs: number;
  /** Default config used when a node of this kind is dropped on the canvas. */
  defaultData: () => RoutingNodeData;
}

export const NODE_META: Record<RoutingNodeKind, NodeMeta> = {
  inbound: {
    kind: "inbound",
    label: "Inbound",
    description: "Where every call enters the plan.",
    icon: PhoneIncoming,
    tone: "cyan",
    inputs: 0,
    outputs: 1,
    defaultData: () => ({ kind: "inbound", inbound: {} }),
  },
  hoursFilter: {
    kind: "hoursFilter",
    label: "Hours filter",
    description: "Pass only during certain hours / days.",
    icon: Clock,
    tone: "amber",
    inputs: 1,
    outputs: 2,
    defaultData: () => ({
      kind: "hoursFilter",
      hoursFilter: { days: [1, 2, 3, 4, 5], startHour: 8, endHour: 20 },
    }),
  },
  geoFilter: {
    kind: "geoFilter",
    label: "Geo filter",
    description: "Pass calls from selected states.",
    icon: Globe2,
    tone: "violet",
    inputs: 1,
    outputs: 2,
    defaultData: () => ({
      kind: "geoFilter",
      geoFilter: { mode: "allow", states: ["TX", "CA"] },
    }),
  },
  tagFilter: {
    kind: "tagFilter",
    label: "Tag filter",
    description: "Match custom call metadata.",
    icon: Tags,
    tone: "violet",
    inputs: 1,
    outputs: 2,
    defaultData: () => ({
      kind: "tagFilter",
      tagFilter: { tag: "source", operator: "equals", value: "facebook" },
    }),
  },
  weightSplit: {
    kind: "weightSplit",
    label: "Weight split",
    description: "Percentage split between two branches.",
    icon: Filter,
    tone: "cyan",
    inputs: 1,
    outputs: 2,
    defaultData: () => ({
      kind: "weightSplit",
      weightSplit: { weightA: 50, labelA: "A", labelB: "B" },
    }),
  },
  priority: {
    kind: "priority",
    label: "Priority",
    description: "Try the primary path first; fall back if no match.",
    icon: GitFork,
    tone: "cyan",
    inputs: 1,
    outputs: 2,
    defaultData: () => ({
      kind: "priority",
      priority: { primaryLabel: "Primary", fallbackLabel: "Fallback" },
    }),
  },
  capCheck: {
    kind: "capCheck",
    label: "Cap check",
    description: "Stop routing once a limit is hit.",
    icon: Gauge,
    tone: "amber",
    inputs: 1,
    outputs: 2,
    defaultData: () => ({
      kind: "capCheck",
      capCheck: { kind: "daily", limit: 200 },
    }),
  },
  buyer: {
    kind: "buyer",
    label: "Buyer",
    description: "Hand the call off to a buyer (terminal).",
    icon: Building2,
    tone: "emerald",
    inputs: 1,
    outputs: 0,
    defaultData: () => ({
      kind: "buyer",
      buyer: { buyerId: "", buyerName: "Pick a buyer" },
    }),
  },
  deadEnd: {
    kind: "deadEnd",
    label: "Dead end",
    description: "Drop the call with a reason.",
    icon: XOctagon,
    tone: "rose",
    inputs: 1,
    outputs: 0,
    defaultData: () => ({
      kind: "deadEnd",
      deadEnd: { reason: "Unmatched" },
    }),
  },
};

/** Order shown in the palette. */
export const PALETTE_ORDER: RoutingNodeKind[] = [
  "inbound",
  "hoursFilter",
  "geoFilter",
  "tagFilter",
  "weightSplit",
  "priority",
  "capCheck",
  "buyer",
  "deadEnd",
];

/** Tone → Tailwind / inline color resolver shared by node UI + palette. */
export const TONE_STYLE: Record<
  NodeTone,
  { icon: string; ring: string; border: string; cssVar: string; chip: string }
> = {
  cyan: {
    icon: "text-accent bg-accent/12",
    ring: "ring-accent/30",
    border: "border-accent/40",
    cssVar: "var(--accent)",
    chip: "bg-accent/10 text-accent border-accent/30",
  },
  emerald: {
    icon: "text-[oklch(0.6_0.18_155)] dark:text-[oklch(0.78_0.18_155)] bg-[oklch(0.6_0.18_155)]/10",
    ring: "ring-[oklch(0.6_0.18_155)]/30",
    border: "border-[oklch(0.6_0.18_155)]/40",
    cssVar: "oklch(0.6 0.18 155)",
    chip:
      "bg-[oklch(0.6_0.18_155)]/10 text-[oklch(0.5_0.18_155)] dark:text-[oklch(0.78_0.18_155)] border-[oklch(0.6_0.18_155)]/30",
  },
  violet: {
    icon: "text-[oklch(0.55_0.2_290)] dark:text-[oklch(0.72_0.2_290)] bg-[oklch(0.55_0.2_290)]/10",
    ring: "ring-[oklch(0.6_0.2_290)]/30",
    border: "border-[oklch(0.6_0.2_290)]/40",
    cssVar: "oklch(0.6 0.2 290)",
    chip:
      "bg-[oklch(0.6_0.2_290)]/10 text-[oklch(0.5_0.2_290)] dark:text-[oklch(0.72_0.2_290)] border-[oklch(0.6_0.2_290)]/30",
  },
  amber: {
    icon: "text-[oklch(0.6_0.16_75)] dark:text-[oklch(0.82_0.16_75)] bg-[oklch(0.6_0.16_75)]/10",
    ring: "ring-[oklch(0.6_0.16_75)]/30",
    border: "border-[oklch(0.6_0.16_75)]/40",
    cssVar: "oklch(0.6 0.16 75)",
    chip:
      "bg-[oklch(0.6_0.16_75)]/10 text-[oklch(0.5_0.16_75)] dark:text-[oklch(0.82_0.16_75)] border-[oklch(0.6_0.16_75)]/30",
  },
  rose: {
    icon: "text-[oklch(0.55_0.2_10)] dark:text-[oklch(0.72_0.2_10)] bg-[oklch(0.55_0.2_10)]/10",
    ring: "ring-[oklch(0.6_0.2_10)]/30",
    border: "border-[oklch(0.6_0.2_10)]/40",
    cssVar: "oklch(0.6 0.2 10)",
    chip:
      "bg-[oklch(0.6_0.2_10)]/10 text-[oklch(0.5_0.2_10)] dark:text-[oklch(0.72_0.2_10)] border-[oklch(0.6_0.2_10)]/30",
  },
};
