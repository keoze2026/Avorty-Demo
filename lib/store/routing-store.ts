"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { MOCK_PLANS } from "@/lib/mock/routing";
import type { RoutingEdge, RoutingNode, RoutingPlan, RoutingPlanStatus } from "@/lib/types";

interface RoutingState {
  plans: RoutingPlan[];

  getById: (id: string) => RoutingPlan | undefined;
  add: (input: Omit<RoutingPlan, "id" | "createdAt" | "updatedAt">) => RoutingPlan;
  remove: (id: string) => void;
  setStatus: (id: string, status: RoutingPlanStatus) => void;

  /** Replace a plan's nodes & edges in one shot. */
  setGraph: (id: string, nodes: RoutingNode[], edges: RoutingEdge[]) => void;
  /** Patch a single node's data (e.g. from the inspector). */
  patchNodeData: (planId: string, nodeId: string, data: Partial<RoutingNode["data"]>) => void;
}

function makeId() {
  return `plan_${Math.random().toString(36).slice(2, 8)}`;
}

export const useRoutingStore = create<RoutingState>()(
  persist(
    (set, get) => ({
      plans: MOCK_PLANS,

      getById: (id) => get().plans.find((p) => p.id === id),
      add: (input) => {
        const now = Date.now();
        const created: RoutingPlan = { ...input, id: makeId(), createdAt: now, updatedAt: now };
        set((s) => ({ plans: [created, ...s.plans] }));
        return created;
      },
      remove: (id) => set((s) => ({ plans: s.plans.filter((p) => p.id !== id) })),
      setStatus: (id, status) =>
        set((s) => ({
          plans: s.plans.map((p) => (p.id === id ? { ...p, status, updatedAt: Date.now() } : p)),
        })),
      setGraph: (id, nodes, edges) =>
        set((s) => ({
          plans: s.plans.map((p) =>
            p.id === id ? { ...p, nodes, edges, updatedAt: Date.now() } : p,
          ),
        })),
      patchNodeData: (planId, nodeId, data) =>
        set((s) => ({
          plans: s.plans.map((p) =>
            p.id === planId
              ? {
                  ...p,
                  nodes: p.nodes.map((n) =>
                    n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n,
                  ),
                  updatedAt: Date.now(),
                }
              : p,
          ),
        })),
    }),
    {
      name: "vortyx.routing",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
