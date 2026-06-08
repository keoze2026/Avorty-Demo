/**
 * Call Queue service — /api/queue/.
 *
 * Returns the calls currently waiting in the routing queue (campaign matched
 * but no destination available yet, or held for caps to clear).
 */

import { http } from "@/lib/api/http";

export interface QueuedCall {
  id: string;
  callerNumber: string;
  destinationNumber?: string;
  campaignId?: string;
  campaignName?: string;
  status: string;
  /** Seconds the call has been in the queue. */
  waitTimeSec: number;
  enqueuedAt: number;
}

interface QueuedCallWire {
  id: string;
  callerNumber: string;
  destinationNumber?: string;
  campaignId?: string;
  campaignName?: string;
  status?: string;
  waitTimeSec?: number;
  enqueuedAt?: string | number;
}

function toTs(s: string | number | undefined): number {
  if (typeof s === "number") return s;
  if (typeof s === "string") {
    const t = Date.parse(s);
    return Number.isFinite(t) ? t : Date.now();
  }
  return Date.now();
}

function wireToQueued(w: QueuedCallWire): QueuedCall {
  return {
    id: w.id,
    callerNumber: w.callerNumber,
    destinationNumber: w.destinationNumber,
    campaignId: w.campaignId,
    campaignName: w.campaignName,
    status: w.status ?? "waiting",
    waitTimeSec: w.waitTimeSec ?? 0,
    enqueuedAt: toTs(w.enqueuedAt),
  };
}

export const queueService = {
  async list(): Promise<QueuedCall[]> {
    const res = await http.get<{ items?: QueuedCallWire[] } | QueuedCallWire[]>("/api/queue/");
    const items = Array.isArray(res) ? res : (res.items ?? []);
    return items.map(wireToQueued);
  },
};
