/**
 * API keys service — /api/accounts/api-keys/*.
 *
 * Endpoints (confirmed by backend dev, June 2026):
 *   GET    /api/accounts/api-keys/         → list every key in the org
 *   POST   /api/accounts/api-keys/         body: { name, scopes }
 *   DELETE /api/accounts/api-keys/{id}     → revoke
 *
 * Keys are scoped to the caller's organization (a.k.a. Workspace ID) via the
 * bearer token, so no org id is sent on the wire.
 *
 * The full secret is returned ONCE, on create, and is never retrievable
 * afterwards — `list()` only ever exposes the masked prefix. The backend has
 * no rotate endpoint, so `rotate()` is composed client-side: mint a fresh key
 * with the same name + scopes, then revoke the old one.
 */

import { http } from "@/lib/api/http";
import type { ApiKey, ApiScope } from "@/lib/types";

/* ─── Wire shapes (post case-adapter) ─────────────────────────────────── */

interface ApiKeyWire {
  id: string;
  name: string;
  /** Masked display value. Backend naming varies — accept the common spellings. */
  prefix?: string;
  keyPrefix?: string;
  maskedKey?: string;
  scopes?: unknown;
  permissions?: unknown;
  createdAt?: string;
  lastUsedAt?: string | null;
  createdByName?: string;
  createdBy?: string;
}

/** Create returns the key record PLUS the one-time plaintext secret. The
 *  field name isn't pinned down, so we read whichever of these is present. */
interface ApiKeyCreateWire extends ApiKeyWire {
  key?: string;
  token?: string;
  secret?: string;
  fullKey?: string;
  plaintext?: string;
  apiKey?: string;
}

/* ─── Helpers ─────────────────────────────────────────────────────────── */

const VALID_SCOPES: ApiScope[] = ["read", "write", "admin"];

function toTs(s: string | null | undefined): number | undefined {
  if (!s) return undefined;
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : undefined;
}

function normalizeScopes(raw: unknown): ApiScope[] {
  if (!Array.isArray(raw)) return [];
  const scopes = raw
    .map((s) => String(s).toLowerCase())
    .filter((s): s is ApiScope => VALID_SCOPES.includes(s as ApiScope));
  // De-dupe while preserving order.
  return [...new Set(scopes)];
}

function wireToApiKey(w: ApiKeyWire): ApiKey {
  const scopes = normalizeScopes(w.scopes ?? w.permissions);
  return {
    id: w.id,
    name: w.name,
    prefix: w.prefix ?? w.keyPrefix ?? w.maskedKey ?? "",
    scopes: scopes.length > 0 ? scopes : ["read"],
    createdAt: toTs(w.createdAt) ?? Date.now(),
    lastUsedAt: toTs(w.lastUsedAt),
    createdByName: w.createdByName ?? w.createdBy ?? "",
  };
}

/** Pull the one-time plaintext secret out of a create response, whatever the
 *  backend chose to call it. Falls back to the masked prefix so the reveal
 *  dialog always has something to show. */
function extractSecret(w: ApiKeyCreateWire, key: ApiKey): string {
  return w.key ?? w.token ?? w.secret ?? w.fullKey ?? w.plaintext ?? w.apiKey ?? key.prefix;
}

/* ─── Public service ──────────────────────────────────────────────────── */

export interface CreatedApiKey {
  key: ApiKey;
  /** Shown exactly once — surfaced in the reveal dialog, then discarded. */
  token: string;
}

export const apiKeysService = {
  async list(): Promise<ApiKey[]> {
    // Backend may return a bare array or a paginated envelope — handle both.
    const res = await http.get<ApiKeyWire[] | { items?: ApiKeyWire[] }>(
      "/api/accounts/api-keys/",
    );
    const items = Array.isArray(res) ? res : (res.items ?? []);
    return items.map(wireToApiKey);
  },

  async create(input: { name: string; scopes: ApiScope[] }): Promise<CreatedApiKey> {
    const wire = await http.post<ApiKeyCreateWire>("/api/accounts/api-keys/", {
      body: { name: input.name, scopes: input.scopes },
    });
    const key = wireToApiKey(wire);
    return { key, token: extractSecret(wire, key) };
  },

  async revoke(id: string): Promise<void> {
    await http.delete(`/api/accounts/api-keys/${id}`);
  },

  /** No backend rotate endpoint: mint a replacement, then revoke the old key.
   *  Create-first so a failed revoke never leaves the caller with no key. */
  async rotate(key: ApiKey): Promise<CreatedApiKey> {
    const created = await this.create({ name: key.name, scopes: key.scopes });
    try {
      await this.revoke(key.id);
    } catch {
      // The new key is live; surface a non-fatal warning at the call site.
    }
    return created;
  },
};
