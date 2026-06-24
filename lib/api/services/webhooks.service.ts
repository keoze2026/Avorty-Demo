/**
 * Webhooks + Conversion Pixels service — /api/webhooks/*.
 */

import { http } from "@/lib/api/http";
import type { Paginated } from "@/lib/api/types";

export type WebhookStatus = "active" | "paused" | "failed";

export interface WebhookHeader {
  key: string;
  value: string;
}

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
  /** HMAC-SHA256 signing secret. Backend returns this on create + detail. */
  secret?: string;
  /** Custom HTTP headers forwarded on every delivery. */
  headers?: WebhookHeader[];
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
  /** Backend ships this on POST + GET-by-id. List endpoint may omit it. */
  secret?: string;
  /** Custom HTTP headers — array of {key, value} pairs. */
  headers?: WebhookHeader[];
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
    secret: w.secret,
    headers: Array.isArray(w.headers) ? w.headers : undefined,
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
    return wireToWebhook(await http.get<WebhookWire>(`/api/webhooks/${id}`));
  },

  async create(input: {
    name: string;
    url: string;
    events: string[];
    maxRetries?: number;
    timeoutSeconds?: number;
    /** Optional — backend auto-generates a fresh secret when omitted. */
    secret?: string;
    headers?: WebhookHeader[];
  }): Promise<Webhook> {
    return wireToWebhook(await http.post<WebhookWire>("/api/webhooks/", { body: input }));
  },

  async update(id: string, patch: Partial<Webhook>): Promise<Webhook> {
    return wireToWebhook(await http.patch<WebhookWire>(`/api/webhooks/${id}`, { body: patch }));
  },

  async remove(id: string): Promise<void> {
    await http.delete(`/api/webhooks/${id}`);
  },

  async test(id: string): Promise<unknown> {
    return http.post(`/api/webhooks/${id}/test`);
  },

  /** Test an unsaved webhook configuration. Backend opens a one-off
   *  delivery to `url` using the supplied `secret` + `headers` (if any) and
   *  returns the result so the user can verify their endpoint accepts the
   *  request before committing. Used by the webhook dialog's Test button
   *  when no `id` exists yet. */
  async testUrl(input: {
    url: string;
    secret?: string;
    headers?: WebhookHeader[];
    event?: string;
  }): Promise<{
    ok: boolean;
    latencyMs?: number;
    statusCode?: number;
    error?: string;
  }> {
    return http.post<{
      ok: boolean;
      latencyMs?: number;
      statusCode?: number;
      error?: string;
    }>("/api/webhooks/test-url", { body: input });
  },

  /** Mint a fresh signing secret for an existing webhook. The returned
   *  `secret` is the only chance to capture the plaintext; subsequent GETs
   *  return it only because the backend dev confirmed they include it on
   *  the detail endpoint, but treat this response as the canonical reveal. */
  async rotateSecret(id: string): Promise<{ secret: string }> {
    return http.post<{ secret: string }>(`/api/webhooks/${id}/rotate-secret`);
  },

  async deliveries(id: string, query: { page?: number; pageSize?: number } = {}) {
    return http.get<Paginated<WebhookDelivery>>(`/api/webhooks/${id}/deliveries`, { query });
  },

  /* ─── Conversion pixels ──────────────────────────────────────────── */
  async listPixels(): Promise<ConversionPixel[]> {
    const res = await http.get<PixelWire[]>("/api/webhooks/pixels/");
    return res.map(wireToPixel);
  },

  async getPixel(id: string): Promise<ConversionPixel> {
    return wireToPixel(await http.get<PixelWire>(`/api/webhooks/pixels/${id}`));
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
