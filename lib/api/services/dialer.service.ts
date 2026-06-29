/**
 * Live Dialer service — agent-centric floor view.
 *
 *   GET /api/dialer/snapshot — full snapshot: 6 KPIs + up to 250 online agents
 *
 * Currently demo-only. The real Avortyx backend doesn't model agents, so
 * this endpoint is served exclusively by the demo router. When/if the
 * backend ships an agents API, the wire shape here is what to match;
 * nothing in the UI changes.
 */

import { http } from "@/lib/api/http";

export type AgentStatus = "on_call" | "free" | "wrap_up" | "break";

export interface DialerAgent {
  id: string;
  name: string;
  initials: string;
  status: AgentStatus;
  currentCall?: {
    caller: string;
    durationSec: number;
    campaign: string;
  };
  callsToday: number;
  salesToday: number;
  missedToday: number;
  shiftHours: number;
  avgHandleSec: number;
}

export interface DialerSnapshot {
  agentsOnline: number;
  agentsOnCall: number;
  agentsFree: number;
  agentsWrapUp: number;
  agentsBreak: number;
  callsLive: number;
  callsMissed: number;
  callsTotal: number;
  sales: number;
  agents: DialerAgent[];
  generatedAt: number;
}

interface SnapshotWire {
  agentsOnline: number;
  agentsOnCall: number;
  agentsFree: number;
  agentsWrapUp: number;
  agentsBreak: number;
  callsLive: number;
  callsMissed: number;
  callsTotal: number;
  sales: number;
  agents: Array<{
    id: string;
    name: string;
    initials: string;
    status: string;
    currentCall?: {
      caller: string;
      durationSec: number;
      campaign: string;
    };
    callsToday: number;
    salesToday: number;
    missedToday: number;
    shiftHours: number;
    avgHandleSec: number;
  }>;
  generatedAt: number;
}

function normalizeStatus(s: string): AgentStatus {
  if (s === "on_call" || s === "free" || s === "wrap_up" || s === "break") return s;
  return "free";
}

export const dialerService = {
  async snapshot(): Promise<DialerSnapshot> {
    const wire = await http.get<SnapshotWire>("/api/dialer/snapshot");
    return {
      agentsOnline: wire.agentsOnline,
      agentsOnCall: wire.agentsOnCall,
      agentsFree: wire.agentsFree,
      agentsWrapUp: wire.agentsWrapUp,
      agentsBreak: wire.agentsBreak,
      callsLive: wire.callsLive,
      callsMissed: wire.callsMissed,
      callsTotal: wire.callsTotal,
      sales: wire.sales,
      generatedAt: wire.generatedAt,
      agents: wire.agents.slice(0, 250).map((a) => ({
        id: a.id,
        name: a.name,
        initials: a.initials,
        status: normalizeStatus(a.status),
        currentCall: a.currentCall,
        callsToday: a.callsToday,
        salesToday: a.salesToday,
        missedToday: a.missedToday,
        shiftHours: a.shiftHours,
        avgHandleSec: a.avgHandleSec,
      })),
    };
  },
};
