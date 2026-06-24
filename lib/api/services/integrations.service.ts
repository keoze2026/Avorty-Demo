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
};
