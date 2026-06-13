/**
 * Spam & Fraud Protection service — /api/spam/*.
 * Powers the VoIP Shield, TCPA Shield, and Blocked Numbers surfaces.
 */

import { http } from "@/lib/api/http";
import type { Paginated } from "@/lib/api/types";

export interface SpamEntry {
  id: string;
  number: string;
  reason?: string;
  isActive: boolean;
  expiresAt?: number;
  createdAt: number;
}

export interface SpamReport {
  id: string;
  number: string;
  reportType: string;
  source: string;
  confidence?: number;
  createdAt: number;
}

interface SpamEntryWire {
  id: string;
  number: string;
  reason?: string;
  isActive: boolean;
  expiresAt?: string | null;
  createdAt: string;
}

interface SpamReportWire {
  id: string;
  number: string;
  reportType: string;
  source: string;
  confidence?: number;
  createdAt: string;
}

function toTs(s: string | null | undefined): number | undefined {
  if (!s) return undefined;
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : undefined;
}

function wireToEntry(w: SpamEntryWire): SpamEntry {
  return {
    id: w.id,
    number: w.number,
    reason: w.reason,
    isActive: !!w.isActive,
    expiresAt: toTs(w.expiresAt ?? null),
    createdAt: toTs(w.createdAt) ?? Date.now(),
  };
}

function wireToReport(w: SpamReportWire): SpamReport {
  return {
    id: w.id,
    number: w.number,
    reportType: w.reportType,
    source: w.source,
    confidence: w.confidence,
    createdAt: toTs(w.createdAt) ?? Date.now(),
  };
}

export const spamService = {
  /* ─── Blacklist ──────────────────────────────────────────────────── */
  async listBlacklist(query: { page?: number; pageSize?: number } = {}): Promise<Paginated<SpamEntry>> {
    const res = await http.get<Paginated<SpamEntryWire>>("/api/spam/blacklist/", { query });
    return { ...res, items: res.items.map(wireToEntry) };
  },
  async getBlacklistEntry(id: string): Promise<SpamEntry> {
    return wireToEntry(await http.get<SpamEntryWire>(`/api/spam/blacklist/${id}/`));
  },
  async createBlacklist(input: { number: string; reason?: string }): Promise<SpamEntry> {
    return wireToEntry(await http.post<SpamEntryWire>("/api/spam/blacklist/", { body: input }));
  },
  async updateBlacklist(id: string, patch: Partial<SpamEntry>): Promise<SpamEntry> {
    return wireToEntry(await http.patch<SpamEntryWire>(`/api/spam/blacklist/${id}/`, { body: patch }));
  },
  async deactivateBlacklist(id: string): Promise<void> {
    await http.post(`/api/spam/blacklist/${id}/deactivate/`);
  },
  async deleteBlacklist(id: string): Promise<void> {
    await http.delete(`/api/spam/blacklist/${id}/`);
  },

  /* ─── Whitelist ──────────────────────────────────────────────────── */
  async listWhitelist(query: { page?: number; pageSize?: number } = {}): Promise<Paginated<SpamEntry>> {
    const res = await http.get<Paginated<SpamEntryWire>>("/api/spam/whitelist/", { query });
    return { ...res, items: res.items.map(wireToEntry) };
  },
  async getWhitelistEntry(id: string): Promise<SpamEntry> {
    return wireToEntry(await http.get<SpamEntryWire>(`/api/spam/whitelist/${id}/`));
  },
  async createWhitelist(input: { number: string; reason?: string }): Promise<SpamEntry> {
    return wireToEntry(await http.post<SpamEntryWire>("/api/spam/whitelist/", { body: input }));
  },
  async updateWhitelist(id: string, patch: Partial<SpamEntry>): Promise<SpamEntry> {
    return wireToEntry(await http.patch<SpamEntryWire>(`/api/spam/whitelist/${id}/`, { body: patch }));
  },
  async deleteWhitelist(id: string): Promise<void> {
    await http.delete(`/api/spam/whitelist/${id}/`);
  },

  /* ─── Spam reports & anonymous-block toggle ──────────────────────── */
  async listReports(query: { page?: number; pageSize?: number } = {}): Promise<Paginated<SpamReport>> {
    const res = await http.get<Paginated<SpamReportWire>>("/api/spam/reports/", { query });
    return { ...res, items: res.items.map(wireToReport) };
  },

  async checkNumber(number: string): Promise<{ isSpam: boolean; confidence?: number; reason?: string }> {
    return http.get(`/api/spam/check/`, { query: { number } });
  },

  async listAnonymousBlocks(): Promise<Array<{ id: string; campaignId: string; isActive: boolean }>> {
    return http.get("/api/spam/anonymous-block/");
  },

  async createAnonymousBlock(input: { campaignId: string; isActive?: boolean }) {
    return http.post("/api/spam/anonymous-block/", { body: input });
  },

  async updateAnonymousBlock(campaignId: string, patch: { isActive: boolean }) {
    return http.patch(`/api/spam/anonymous-block/${campaignId}/`, { body: patch });
  },

  /* ─── Shields (VoIP + TCPA) ─────────────────────────────────────────
   * Backend stores named shield policies with a `shieldType` discriminator,
   * a list of guarded campaign ids, and an active flag. Carrier-block lists
   * piggyback on the policy as a free-form array (frontend uses this for
   * `blockedCarriers`). */
  async listShields(
    query: { shieldType?: ShieldType; page?: number; pageSize?: number } = {},
  ): Promise<Shield[]> {
    const res = await http.get<{ items?: ShieldWire[] } | ShieldWire[]>(
      "/api/spam/shields/",
      { query },
    );
    const items = Array.isArray(res) ? res : (res.items ?? []);
    return items.map(wireToShield);
  },

  async getShield(id: string): Promise<Shield> {
    return wireToShield(await http.get<ShieldWire>(`/api/spam/shields/${id}/`));
  },

  async createShield(input: {
    name: string;
    shieldType: ShieldType;
    campaignIds?: string[];
    blockedCarriers?: string[];
    isActive?: boolean;
  }): Promise<Shield> {
    return wireToShield(
      await http.post<ShieldWire>("/api/spam/shields/", {
        body: {
          name: input.name,
          shieldType: input.shieldType,
          campaignIds: input.campaignIds ?? [],
          blockedCarriers: input.blockedCarriers ?? [],
          isActive: input.isActive ?? true,
        },
      }),
    );
  },

  async updateShield(id: string, patch: Partial<Shield>): Promise<Shield> {
    return wireToShield(
      await http.patch<ShieldWire>(`/api/spam/shields/${id}/`, { body: patch }),
    );
  },

  async deleteShield(id: string): Promise<void> {
    await http.delete(`/api/spam/shields/${id}/`);
  },
};

/* ─── Shield types ──────────────────────────────────────────────────── */

export type ShieldType = "voip" | "tcpa";

export interface Shield {
  id: string;
  name: string;
  shieldType: ShieldType;
  campaignIds: string[];
  blockedCarriers: string[];
  isActive: boolean;
}

interface ShieldWire {
  id: string;
  name: string;
  shieldType: string;
  campaignIds?: string[];
  blockedCarriers?: string[];
  isActive?: boolean;
}

function normalizeShieldType(raw: string): ShieldType {
  return raw === "tcpa" ? "tcpa" : "voip";
}

function wireToShield(w: ShieldWire): Shield {
  return {
    id: w.id,
    name: w.name,
    shieldType: normalizeShieldType(w.shieldType),
    campaignIds: Array.isArray(w.campaignIds) ? w.campaignIds.map(String) : [],
    blockedCarriers: Array.isArray(w.blockedCarriers) ? w.blockedCarriers.map(String) : [],
    isActive: w.isActive ?? true,
  };
}
