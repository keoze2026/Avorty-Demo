/**
 * Integrations catalog service — /api/integrations/*.
 *
 * Backed by the dev's shipped endpoints:
 *   GET    /api/integrations/                — paginated catalog
 *   POST   /api/integrations/{id}/connect    — start the connect flow
 *   DELETE /api/integrations/{id}/disconnect — drop the connection
 *
 * Returns frontend-shaped `IntegrationApp` records so the store can drop
 * them straight into state. Connect/disconnect return whatever the backend
 * sends (typically the updated app row) so the caller can reconcile.
 */

import { http } from "@/lib/api/http";
import type { IntegrationApp, IntegrationCategory } from "@/lib/types";

/* ─── Wire shapes (post case-adapter) ─────────────────────────────────── */

interface IntegrationWire {
  id: string;
  name: string;
  description: string;
  category: string;
  color: string;
  mark: string;
  connected: boolean;
  connectedAt?: string | number | null;
}

/* ─── Helpers ─────────────────────────────────────────────────────────── */

function normalizeCategory(raw: string | undefined): IntegrationCategory {
  const c = (raw ?? "").toLowerCase();
  if (
    c === "crm" ||
    c === "telephony" ||
    c === "analytics" ||
    c === "communication" ||
    c === "data" ||
    c === "automation"
  ) {
    return c;
  }
  return "automation";
}

function toTs(v: string | number | null | undefined): number | undefined {
  if (v === null || v === undefined) return undefined;
  if (typeof v === "number") return v;
  const t = Date.parse(v);
  return Number.isFinite(t) ? t : undefined;
}

function wireToApp(w: IntegrationWire): IntegrationApp {
  return {
    id: w.id,
    name: w.name,
    description: w.description,
    category: normalizeCategory(w.category),
    color: w.color,
    mark: w.mark,
    connected: !!w.connected,
    connectedAt: toTs(w.connectedAt),
  };
}

/** Tolerant envelope parser — the dev's response shape said `{ items: [...] }`
 *  but list responses elsewhere in the API sometimes ship the bare array or
 *  the DRF `{ results }` shape. Match whichever arrives. */
function extractItems(raw: unknown): IntegrationWire[] {
  if (Array.isArray(raw)) return raw as IntegrationWire[];
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    if (Array.isArray(o.items)) return o.items as IntegrationWire[];
    if (Array.isArray(o.results)) return o.results as IntegrationWire[];
    if (Array.isArray(o.data)) return o.data as IntegrationWire[];
  }
  return [];
}

/* ─── Public service ──────────────────────────────────────────────────── */

/* ─── Per-integration config ─────────────────────────────────────────────
 * Backend ships these shapes per the latest ask. Token is masked on read;
 * rotate returns a one-time-reveal plaintext. The activity log is its own
 * paginated endpoint mirroring the webhook delivery log. */

export type IntegrationStatus = "active" | "paused";

export interface IntegrationConfig {
  token: string | null;
  baseUrl: string | null;
  events: string[];
  scopes: string[];
  status: IntegrationStatus;
}

export interface IntegrationConfigPatch {
  token?: string;
  baseUrl?: string;
  events?: string[];
  scopes?: string[];
  status?: IntegrationStatus;
}

export interface IntegrationActivityEntry {
  id: string;
  kind: "sync" | "auth" | "delivery";
  label: string;
  detail: string;
  status: "ok" | "warn" | "fail";
  at: number;
}

interface IntegrationActivityWire {
  id: string;
  kind: string;
  label: string;
  detail: string;
  status: string;
  at?: string | number;
  createdAt?: string | number;
}

interface IntegrationConfigWire {
  token: string | null;
  baseUrl: string | null;
  events?: string[];
  scopes?: string[];
  status?: string;
}

function normalizeStatus(raw: string | undefined): IntegrationStatus {
  return raw?.toLowerCase() === "paused" ? "paused" : "active";
}

function normalizeActivityStatus(raw: string): IntegrationActivityEntry["status"] {
  const s = raw.toLowerCase();
  if (s === "warn" || s === "warning") return "warn";
  if (s === "fail" || s === "failed" || s === "error") return "fail";
  return "ok";
}

function normalizeActivityKind(raw: string): IntegrationActivityEntry["kind"] {
  const s = raw.toLowerCase();
  if (s === "auth") return "auth";
  if (s === "delivery") return "delivery";
  return "sync";
}

function toMs(v: string | number | undefined): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const t = Date.parse(v);
    return Number.isFinite(t) ? t : Date.now();
  }
  return Date.now();
}

function wireToActivity(w: IntegrationActivityWire): IntegrationActivityEntry {
  return {
    id: w.id,
    kind: normalizeActivityKind(w.kind),
    label: w.label,
    detail: w.detail,
    status: normalizeActivityStatus(w.status),
    at: toMs(w.at ?? w.createdAt),
  };
}

function wireToConfig(w: IntegrationConfigWire): IntegrationConfig {
  return {
    token: w.token,
    baseUrl: w.baseUrl,
    events: Array.isArray(w.events) ? w.events : [],
    scopes: Array.isArray(w.scopes) ? w.scopes : [],
    status: normalizeStatus(w.status),
  };
}

export const integrationsService = {
  async list(): Promise<IntegrationApp[]> {
    const raw = await http.get<unknown>("/api/integrations/");
    return extractItems(raw).map(wireToApp);
  },

  async connect(id: string): Promise<IntegrationApp | null> {
    // Some implementations 302 to an OAuth start URL; others return the
    // updated app row. Accept either — null means "no body, refetch later".
    const raw = await http.post<unknown>(`/api/integrations/${id}/connect`);
    if (raw && typeof raw === "object" && "id" in (raw as object)) {
      return wireToApp(raw as IntegrationWire);
    }
    return null;
  },

  async disconnect(id: string): Promise<void> {
    await http.delete(`/api/integrations/${id}/disconnect`);
  },

  async getConfig(id: string): Promise<IntegrationConfig> {
    return wireToConfig(
      await http.get<IntegrationConfigWire>(`/api/integrations/${id}/config`),
    );
  },

  async updateConfig(id: string, patch: IntegrationConfigPatch): Promise<IntegrationConfig> {
    return wireToConfig(
      await http.put<IntegrationConfigWire>(`/api/integrations/${id}/config`, {
        body: patch,
      }),
    );
  },

  async testConnection(
    id: string,
  ): Promise<{ ok: boolean; latencyMs?: number; error?: string }> {
    return http.post<{ ok: boolean; latencyMs?: number; error?: string }>(
      `/api/integrations/${id}/test`,
    );
  },

  /** Mint a fresh API token for this integration. Returns the plaintext
   *  exactly once — subsequent GETs only return the masked prefix. */
  async rotateToken(id: string): Promise<{ token: string }> {
    return http.post<{ token: string }>(`/api/integrations/${id}/rotate-token`);
  },

  async activity(
    id: string,
    query: { page?: number; pageSize?: number } = {},
  ): Promise<IntegrationActivityEntry[]> {
    const raw = await http.get<{ items?: IntegrationActivityWire[] } | IntegrationActivityWire[]>(
      `/api/integrations/${id}/activity`,
      { query },
    );
    const items = Array.isArray(raw) ? raw : (raw.items ?? []);
    return items.map(wireToActivity);
  },
};
