/**
 * Access requests service — invite-only signup flow.
 *
 * Endpoints (confirmed by backend dev, June 2026):
 *   POST   /api/accounts/access-requests/            — anonymous, rate limited 5/min
 *   GET    /api/accounts/access-requests/            — admin only, ?status=pending
 *   POST   /api/accounts/access-requests/{id}/approve/   body: { role?: string }
 *   POST   /api/accounts/access-requests/{id}/reject/    body: { reason?: string }
 *   POST   /api/accounts/set-password/               — anonymous, body: { token, password }
 *
 * Flow: prospect fills in the contact form → admin reviews + approves →
 * backend creates the user (no password), sends an email with a one-time
 * `setup_link`. User clicks the link → /set-password?token=... → submits
 * → backend returns login-shape tokens and the frontend signs them in.
 */

import { http } from "@/lib/api/http";
import type { Role } from "@/lib/types";

/* ─── Frontend shapes ─────────────────────────────────────────────────── */

export type AccessRequestStatus = "pending" | "approved" | "rejected";

export interface AccessRequest {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  useCase: string;
  status: AccessRequestStatus;
  createdAt: number;
  reviewedAt?: number;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface AccessRequestInput {
  name: string;
  company: string;
  email: string;
  phone: string;
  useCase: string;
}

/** Response of `setPassword` — matches the login endpoint shape so the
 *  caller can persist tokens and treat the user as fully signed in. */
export interface SetPasswordResponse {
  access: string;
  refresh: string;
  userId: string;
  email: string;
  role: string;
  organizationId: string;
}

/* ─── Wire shapes (post case-adapter) ─────────────────────────────────── */

interface AccessRequestWire {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  useCase: string;
  status: string;
  createdAt: string;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  rejectionReason?: string | null;
}

/* ─── Helpers ─────────────────────────────────────────────────────────── */

function toTs(s: string | null | undefined): number | undefined {
  if (!s) return undefined;
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : undefined;
}

function normalizeStatus(raw: string): AccessRequestStatus {
  const s = raw.toLowerCase();
  if (s === "approved" || s === "rejected") return s;
  return "pending";
}

function wireToRequest(w: AccessRequestWire): AccessRequest {
  return {
    id: w.id,
    name: w.name,
    company: w.company,
    email: w.email,
    phone: w.phone,
    useCase: w.useCase,
    status: normalizeStatus(w.status),
    createdAt: toTs(w.createdAt) ?? Date.now(),
    reviewedAt: toTs(w.reviewedAt),
    reviewedBy: w.reviewedBy ?? undefined,
    rejectionReason: w.rejectionReason ?? undefined,
  };
}

function unwrapItems<W>(res: unknown): W[] {
  if (Array.isArray(res)) return res as W[];
  if (res && typeof res === "object" && Array.isArray((res as { items?: unknown }).items)) {
    return (res as { items: W[] }).items;
  }
  return [];
}

/* ─── Public service ──────────────────────────────────────────────────── */

export const accessRequestsService = {
  /** Public — submit a new access request from the marketing site form. */
  async create(input: AccessRequestInput): Promise<AccessRequest> {
    const wire = await http.post<AccessRequestWire>("/api/accounts/access-requests/", {
      body: input,
      anonymous: true,
    });
    return wireToRequest(wire);
  },

  /** Admin — list access requests, optionally filtered by status. */
  async list(filter?: { status?: AccessRequestStatus }): Promise<AccessRequest[]> {
    const res = await http.get<AccessRequestWire[] | { items?: AccessRequestWire[] }>(
      "/api/accounts/access-requests/",
      { query: filter?.status ? { status: filter.status } : undefined },
    );
    return unwrapItems<AccessRequestWire>(res).map(wireToRequest);
  },

  /** Admin — approve a pending request. Backend creates the user, generates
   *  a one-time setup token, and emails the setup link synchronously. */
  async approve(id: string, role: Role = "buyer"): Promise<AccessRequest> {
    const wire = await http.post<AccessRequestWire>(
      `/api/accounts/access-requests/${id}/approve/`,
      { body: { role } },
    );
    return wireToRequest(wire);
  },

  /** Admin — reject a pending request. Reason is optional but recommended. */
  async reject(id: string, reason?: string): Promise<AccessRequest> {
    const wire = await http.post<AccessRequestWire>(
      `/api/accounts/access-requests/${id}/reject/`,
      { body: reason ? { reason } : {} },
    );
    return wireToRequest(wire);
  },

  /** Public — consume the setup token + set the user's password. Returns
   *  login-shape tokens so the caller can sign the user in immediately. */
  async setPassword(input: { token: string; password: string }): Promise<SetPasswordResponse> {
    return http.post<SetPasswordResponse>("/api/accounts/set-password/", {
      body: input,
      anonymous: true,
    });
  },
};
