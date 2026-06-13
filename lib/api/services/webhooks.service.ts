/**
 * Webhooks + Conversion Pixels service — /api/webhooks/*.
 */

import { http } from "@/lib/api/http";
import type { Paginated } from "@/lib/api/types";

export type WebhookStatus = "active" | "paused" | "failed";

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: WebhookStatus;
  maxRetries: number;
  timeoutSeconds: number;
  createdAt: number;
  updatedAt: number;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: string;
  status: string;
  statusCode?: number;
  responseTimeMs?: number;
  createdAt: number;
}

export interface ConversionPixel {
  id: string;
  name: string;
  campaignId?: string;
  campaignName?: string;
  token: string;
  pixelUrl?: string;
  isActive: boolean;
  createdAt: number;
}

interface WebhookWire {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: string;
  maxRetries: number;
  timeoutSeconds: number;
  createdAt: string;
  updatedAt: string;
}

interface PixelWire {
  id: string;
  name: string;
  campaignId?: string;
  campaignName?: string;
  token: string;
  pixelUrl?: string;
  isActive: boolean;
  createdAt: string;
}

function normalizeStatus(raw: string | null | undefined): WebhookStatus {
  const s = (raw ?? "").toLowerCase();
  if (s === "paused" || s === "failed") return s;
  return "active";
}

function toTs(s: string | undefined): number {
  if (!s) return Date.now();
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : Date.now();
}

function wireToWebhook(w: WebhookWire): Webhook {
  return {
    id: w.id,
    name: w.name,
    url: w.url,
    events: Array.isArray(w.events) ? w.events.map(String) : [],
    status: normalizeStatus(w.status),
    maxRetries: w.maxRetries,
    timeoutSeconds: w.timeoutSeconds,
    createdAt: toTs(w.createdAt),
    updatedAt: toTs(w.updatedAt),
  };
}

function wireToPixel(w: PixelWire): ConversionPixel {
  return {
    id: w.id,
    name: w.name,
    campaignId: w.campaignId,
    campaignName: w.campaignName,
    token: w.token,
    pixelUrl: w.pixelUrl,
    isActive: !!w.isActive,
    createdAt: toTs(w.createdAt),
  };
}

export const webhooksService = {
  async list(query: { page?: number; pageSize?: number } = {}): Promise<Paginated<Webhook>> {
    const res = await http.get<Paginated<WebhookWire>>("/api/webhooks/", { query });
    return { ...res, items: res.items.map(wireToWebhook) };
  },

  async get(id: string): Promise<Webhook> {
    return wireToWebhook(await http.get<WebhookWire>(`/api/webhooks/${id}/`));
  },

  async create(input: {
    name: string;
    url: string;
    events: string[];
    maxRetries?: number;
    timeoutSeconds?: number;
  }): Promise<Webhook> {
    return wireToWebhook(await http.post<WebhookWire>("/api/webhooks/", { body: input }));
  },

  async update(id: string, patch: Partial<Webhook>): Promise<Webhook> {
    return wireToWebhook(await http.patch<WebhookWire>(`/api/webhooks/${id}/`, { body: patch }));
  },

  async remove(id: string): Promise<void> {
    await http.delete(`/api/webhooks/${id}/`);
  },

  async test(id: string): Promise<unknown> {
    return http.post(`/api/webhooks/${id}/test/`);
  },

  async deliveries(id: string, query: { page?: number; pageSize?: number } = {}) {
    return http.get<Paginated<WebhookDelivery>>(`/api/webhooks/${id}/deliveries/`, { query });
  },

  /* ─── Conversion pixels ──────────────────────────────────────────── */
  async listPixels(): Promise<ConversionPixel[]> {
    const res = await http.get<PixelWire[]>("/api/webhooks/pixels/");
    return res.map(wireToPixel);
  },

  async getPixel(id: string): Promise<ConversionPixel> {
    return wireToPixel(await http.get<PixelWire>(`/api/webhooks/pixels/${id}/`));
  },

  async createPixel(input: {
    name: string;
    campaignId?: string;
    isActive?: boolean;
  }): Promise<ConversionPixel> {
    return wireToPixel(await http.post<PixelWire>("/api/webhooks/pixels/", { body: input }));
  },

  async updatePixel(id: string, patch: Partial<ConversionPixel>): Promise<ConversionPixel> {
    return wireToPixel(
      await http.patch<PixelWire>(`/api/webhooks/pixels/${id}/`, { body: patch }),
    );
  },

  async deletePixel(id: string): Promise<void> {
    await http.delete(`/api/webhooks/pixels/${id}/`);
  },
};
