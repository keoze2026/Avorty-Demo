/**
 * Sample routing plans — gives every demo campaign a pre-built graph
 * so the editor has something to load right out of the gate.
 */

import { MOCK_CAMPAIGNS } from "./campaigns";
import { MOCK_BUYERS } from "./buyers";
import type { RoutingEdge, RoutingNode, RoutingPlan } from "@/lib/types";

function inbound(id: string, x: number, y: number, campaignId?: string): RoutingNode {
  return {
    id,
    type: "inbound",
    position: { x, y },
    data: { kind: "inbound", label: "Inbound", inbound: { campaignId } },
  };
}
function hoursFilter(
  id: string,
  x: number,
  y: number,
  cfg = { days: [1, 2, 3, 4, 5] as Array<0 | 1 | 2 | 3 | 4 | 5 | 6>, startHour: 8, endHour: 20 },
): RoutingNode {
  return { id, type: "hoursFilter", position: { x, y }, data: { kind: "hoursFilter", hoursFilter: cfg } };
}
function geoFilter(id: string, x: number, y: number, states: string[]): RoutingNode {
  return {
    id,
    type: "geoFilter",
    position: { x, y },
    data: { kind: "geoFilter", geoFilter: { mode: "allow", states } },
  };
}
function priority(id: string, x: number, y: number): RoutingNode {
  return {
    id,
    type: "priority",
    position: { x, y },
    data: {
      kind: "priority",
      priority: { primaryLabel: "Primary buyer", fallbackLabel: "Fallback" },
    },
  };
}
function capCheck(id: string, x: number, y: number, kind: "daily" | "concurrency", limit: number): RoutingNode {
  return {
    id,
    type: "capCheck",
    position: { x, y },
    data: { kind: "capCheck", capCheck: { kind, limit } },
  };
}
function buyer(id: string, x: number, y: number, buyerIdx: number): RoutingNode {
  const b = MOCK_BUYERS[buyerIdx % MOCK_BUYERS.length];
  return {
    id,
    type: "buyer",
    position: { x, y },
    data: {
      kind: "buyer",
      buyer: { buyerId: b.id, buyerName: b.name, bidOverride: undefined },
    },
  };
}
function deadEnd(id: string, x: number, y: number, reason: string): RoutingNode {
  return { id, type: "deadEnd", position: { x, y }, data: { kind: "deadEnd", deadEnd: { reason } } };
}

function edge(id: string, source: string, target: string, sourceHandle?: string, label?: string): RoutingEdge {
  return { id, source, target, sourceHandle, targetHandle: "in", label };
}

/** A complete plan for the Health Insurance campaign — exhibits filter, fork, and terminals. */
function healthPlan(): RoutingPlan {
  const campaign = MOCK_CAMPAIGNS[0];
  const nodes: RoutingNode[] = [
    inbound("n_inbound", 40, 220, campaign.id),
    hoursFilter("n_hours", 280, 220),
    geoFilter("n_geo", 540, 140, ["TX", "CA", "FL", "NY", "IL", "GA"]),
    capCheck("n_cap", 800, 140, "daily", 400),
    priority("n_priority", 1060, 140),
    buyer("n_buyer_a", 1320, 60, 0),
    buyer("n_buyer_b", 1320, 220, 4),
    deadEnd("n_dead_geo", 540, 360, "Outside service area"),
    deadEnd("n_dead_hours", 280, 420, "Outside business hours"),
    deadEnd("n_dead_cap", 800, 320, "Daily cap reached"),
  ];
  const edges: RoutingEdge[] = [
    edge("e1", "n_inbound", "n_hours", "out"),
    edge("e2", "n_hours", "n_geo", "pass", "Open"),
    edge("e3", "n_hours", "n_dead_hours", "fail", "Closed"),
    edge("e4", "n_geo", "n_cap", "pass", "Match"),
    edge("e5", "n_geo", "n_dead_geo", "fail", "No match"),
    edge("e6", "n_cap", "n_priority", "pass", "Under cap"),
    edge("e7", "n_cap", "n_dead_cap", "fail", "Capped"),
    edge("e8", "n_priority", "n_buyer_a", "primary", "Primary"),
    edge("e9", "n_priority", "n_buyer_b", "fallback", "Fallback"),
  ];
  return {
    id: "plan_health_001",
    name: "Health Tier 1 — Production",
    description: "Production routing for Health Insurance Tier-1 traffic.",
    campaignId: campaign.id,
    campaignName: campaign.name,
    status: "published",
    nodes,
    edges,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 12,
    updatedAt: Date.now() - 1000 * 60 * 60 * 5,
  };
}

/** Smaller plan for solar — single buyer path with one filter. */
function solarPlan(): RoutingPlan {
  const campaign = MOCK_CAMPAIGNS[1];
  const nodes: RoutingNode[] = [
    inbound("n_inbound", 40, 180, campaign.id),
    hoursFilter("n_hours", 300, 180),
    buyer("n_buyer", 560, 100, 1),
    deadEnd("n_dead", 560, 280, "Outside business hours"),
  ];
  const edges: RoutingEdge[] = [
    edge("e1", "n_inbound", "n_hours", "out"),
    edge("e2", "n_hours", "n_buyer", "pass"),
    edge("e3", "n_hours", "n_dead", "fail"),
  ];
  return {
    id: "plan_solar_001",
    name: "Solar — Standard",
    description: "Single-buyer routing for the Solar Leads campaign.",
    campaignId: campaign.id,
    campaignName: campaign.name,
    status: "published",
    nodes,
    edges,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24,
  };
}

/** Empty draft to show the "new plan" experience. */
function legalDraft(): RoutingPlan {
  const campaign = MOCK_CAMPAIGNS[3];
  return {
    id: "plan_legal_draft",
    name: "Legal Intake — Draft",
    description: "Drafted routing for the Legal Mass Tort intake.",
    campaignId: campaign.id,
    campaignName: campaign.name,
    status: "draft",
    nodes: [inbound("n_inbound", 60, 180, campaign.id)],
    edges: [],
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
    updatedAt: Date.now() - 1000 * 60 * 60 * 2,
  };
}

export const MOCK_PLANS: RoutingPlan[] = [healthPlan(), solarPlan(), legalDraft()];
