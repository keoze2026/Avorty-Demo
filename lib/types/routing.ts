import type { Weekday } from "./campaign";

/** Node kinds the editor supports. The discriminant for config blocks below. */
export type RoutingNodeKind =
  | "inbound"
  | "hoursFilter"
  | "geoFilter"
  | "tagFilter"
  | "weightSplit"
  | "priority"
  | "capCheck"
  | "buyer"
  | "deadEnd";

/** Strongly-typed per-kind config bundles. */
export interface InboundConfig {
  campaignId?: string;
}
export interface HoursFilterConfig {
  days: Weekday[];
  startHour: number;
  endHour: number;
}
export interface GeoFilterConfig {
  mode: "allow" | "deny";
  /** State codes, e.g. ["TX", "CA"] */
  states: string[];
}
export interface TagFilterConfig {
  tag: string;
  operator: "equals" | "contains" | "starts-with";
  value: string;
}
export interface WeightSplitConfig {
  /** Weight % for the "A" branch (0..100). B = 100 - A. */
  weightA: number;
  labelA?: string;
  labelB?: string;
}
export interface PriorityConfig {
  /** Just a description for the primary path; secondary handle is the fallback. */
  primaryLabel: string;
  fallbackLabel: string;
}
export interface CapCheckConfig {
  kind: "daily" | "monthly" | "concurrency";
  limit: number;
}
export interface BuyerConfig {
  buyerId: string;
  buyerName: string;
  bidOverride?: number;
}
export interface DeadEndConfig {
  reason: string;
}

/** Data carried by each ReactFlow node. */
export type RoutingNodeData = {
  kind: RoutingNodeKind;
  label?: string;
  inbound?: InboundConfig;
  hoursFilter?: HoursFilterConfig;
  geoFilter?: GeoFilterConfig;
  tagFilter?: TagFilterConfig;
  weightSplit?: WeightSplitConfig;
  priority?: PriorityConfig;
  capCheck?: CapCheckConfig;
  buyer?: BuyerConfig;
  deadEnd?: DeadEndConfig;
};

export interface RoutingNode {
  id: string;
  type: RoutingNodeKind;
  position: { x: number; y: number };
  data: RoutingNodeData;
}

export interface RoutingEdge {
  id: string;
  source: string;
  target: string;
  /** Output handle id ("out" | "pass" | "fail" | "a" | "b") */
  sourceHandle?: string;
  /** Always "in" for now */
  targetHandle?: string;
  /** Optional rendered label on the edge */
  label?: string;
}

export type RoutingPlanStatus = "draft" | "published" | "archived";

export interface RoutingPlan {
  id: string;
  name: string;
  description?: string;
  campaignId?: string;
  campaignName?: string;
  status: RoutingPlanStatus;
  nodes: RoutingNode[];
  edges: RoutingEdge[];
  createdAt: number;
  updatedAt: number;
}
