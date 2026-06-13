/**
 * IVR service — /api/ivr/*.
 *
 * Flows hold a tree of nodes (menu / collect / transfer / hangup / record /
 * say) connected by transitions. The full visual builder is a Phase 7
 * concern; this service just exposes the flat CRUD the backend ships.
 */

import { http } from "@/lib/api/http";

export type IvrFlowStatus = "draft" | "active" | "paused";

export interface IvrFlow {
  id: string;
  name: string;
  description?: string;
  status: IvrFlowStatus;
  welcomeMessage?: string;
  language?: string;
  voice?: string;
  campaignId?: string;
  campaignName?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface IvrNode {
  id: string;
  flowId?: string;
  nodeType: string;
  label?: string;
  config: Record<string, unknown>;
}

export interface IvrTransition {
  id?: string;
  fromNodeId: string;
  toNodeId: string;
  condition?: string;
}

interface IvrFlowWire {
  id: string;
  name: string;
  description?: string;
  status?: string;
  welcomeMessage?: string;
  language?: string;
  voice?: string;
  campaignId?: string | null;
  campaignName?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

function normalizeStatus(raw?: string): IvrFlowStatus {
  const s = (raw ?? "").toLowerCase();
  if (s === "active" || s === "paused") return s;
  return "draft";
}

function toTs(s: string | undefined): number | undefined {
  if (!s) return undefined;
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : undefined;
}

function wireToFlow(w: IvrFlowWire): IvrFlow {
  return {
    id: w.id,
    name: w.name,
    description: w.description,
    status: normalizeStatus(w.status),
    welcomeMessage: w.welcomeMessage,
    language: w.language,
    voice: w.voice,
    campaignId: w.campaignId ?? undefined,
    campaignName: w.campaignName ?? undefined,
    createdAt: toTs(w.createdAt),
    updatedAt: toTs(w.updatedAt),
  };
}

export const ivrService = {
  async listFlows(): Promise<IvrFlow[]> {
    const res = await http.get<{ items?: IvrFlowWire[] } | IvrFlowWire[]>("/api/ivr/flows/");
    const items = Array.isArray(res) ? res : (res.items ?? []);
    return items.map(wireToFlow);
  },

  async getFlow(id: string): Promise<IvrFlow> {
    return wireToFlow(await http.get<IvrFlowWire>(`/api/ivr/flows/${id}/`));
  },

  async createFlow(input: {
    name: string;
    description?: string;
    campaignId?: string;
    welcomeMessage?: string;
    language?: string;
    voice?: string;
  }): Promise<IvrFlow> {
    return wireToFlow(await http.post<IvrFlowWire>("/api/ivr/flows/", { body: input }));
  },

  async updateFlow(id: string, patch: Partial<IvrFlow>): Promise<IvrFlow> {
    return wireToFlow(await http.patch<IvrFlowWire>(`/api/ivr/flows/${id}/`, { body: patch }));
  },

  async deleteFlow(id: string): Promise<void> {
    await http.delete(`/api/ivr/flows/${id}/`);
  },

  async addNode(
    flowId: string,
    input: { nodeType: string; label?: string; config?: Record<string, unknown> },
  ): Promise<IvrNode> {
    return http.post<IvrNode>(`/api/ivr/flows/${flowId}/nodes/`, {
      body: {
        nodeType: input.nodeType,
        label: input.label,
        config: input.config ?? {},
      },
    });
  },

  async addTransition(flowId: string, input: IvrTransition): Promise<IvrTransition> {
    return http.post<IvrTransition>(`/api/ivr/flows/${flowId}/transitions/`, { body: input });
  },
};
