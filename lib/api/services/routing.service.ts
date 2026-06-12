/**
 * Routing service — talks to /api/routing/rules/*.
 *
 * Returns frontend-shaped routing rules. Conditions + destinations are
 * embedded children; the spec exposes them as nested arrays plus POST
 * helpers for `add-condition` / `add-destination`.
 */

import { http } from "@/lib/api/http";
import type { Paginated } from "@/lib/api/types";

export type RoutingRuleStatus = "active" | "paused" | "draft";

export interface RoutingCondition {
  id: string;
  /** Free-form key/value bag (operator, field, value, …) — backend stores them
   *  as a JSON blob so the frontend can render whatever editor it wants. */
  conditions: Record<string, unknown>;
}

export interface RoutingDestination {
  id: string;
  /** Backend models destinations as { buyer_id, weight, priority, … }. */
  buyerId?: string;
  buyerName?: string;
  weight?: number;
  priority?: number;
}

export interface RoutingRule {
  id: string;
  name: string;
  ruleType: string;
  priority: number;
  status: RoutingRuleStatus;
  campaignId: string;
  campaignName: string;
  conditions: RoutingCondition[];
  destinations: RoutingDestination[];
}

interface RoutingRuleWire {
  id: string;
  name: string;
  ruleType: string;
  priority: number;
  status: string;
  campaignId: string;
  campaignName: string;
  conditions?: Array<{ id: string; conditions: Record<string, unknown> }>;
  destinations?: Array<{
    id: string;
    buyerId?: string;
    buyerName?: string;
    weight?: number;
    priority?: number;
  }>;
}

function normalizeStatus(raw: string | null | undefined): RoutingRuleStatus {
  const s = (raw ?? "").toLowerCase();
  if (s === "paused" || s === "draft") return s;
  return "active";
}

function wireToRule(w: RoutingRuleWire): RoutingRule {
  return {
    id: w.id,
    name: w.name,
    ruleType: w.ruleType,
    priority: w.priority,
    status: normalizeStatus(w.status),
    campaignId: w.campaignId,
    campaignName: w.campaignName,
    conditions: (w.conditions ?? []).map((c) => ({
      id: c.id,
      conditions: c.conditions,
    })),
    destinations: (w.destinations ?? []).map((d) => ({
      id: d.id,
      buyerId: d.buyerId,
      buyerName: d.buyerName,
      weight: d.weight,
      priority: d.priority,
    })),
  };
}

export const routingService = {
  async listRules(
    query: { page?: number; pageSize?: number; campaignId?: string } = {},
  ): Promise<Paginated<RoutingRule>> {
    const res = await http.get<Paginated<RoutingRuleWire>>("/api/routing/rules", { query });
    return { ...res, items: res.items.map(wireToRule) };
  },

  async getRule(id: string): Promise<RoutingRule> {
    return wireToRule(await http.get<RoutingRuleWire>(`/api/routing/rules/${id}`));
  },

  async createRule(input: {
    name: string;
    ruleType: string;
    campaignId: string;
    priority?: number;
  }): Promise<RoutingRule> {
    return wireToRule(
      await http.post<RoutingRuleWire>("/api/routing/rules", { body: input }),
    );
  },

  async updateRule(id: string, patch: Partial<RoutingRule>): Promise<RoutingRule> {
    return wireToRule(
      await http.patch<RoutingRuleWire>(`/api/routing/rules/${id}`, { body: patch }),
    );
  },

  async deleteRule(id: string): Promise<void> {
    await http.delete(`/api/routing/rules/${id}`);
  },

  async addCondition(ruleId: string, conditions: Record<string, unknown>): Promise<RoutingCondition> {
    return http.post<RoutingCondition>(`/api/routing/rules/${ruleId}/conditions`, {
      body: { conditions },
    });
  },

  async addDestination(
    ruleId: string,
    destination: { buyerId: string; weight?: number; priority?: number },
  ): Promise<RoutingDestination> {
    return http.post<RoutingDestination>(`/api/routing/rules/${ruleId}/destinations`, {
      body: destination,
    });
  },
};
