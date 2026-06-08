/**
 * White Label service — /api/white-label/*.
 *
 * Single org-scoped resource: branding (company name, logo, colors, support
 * contacts) + a list of custom domains. Each domain progresses through a
 * pending → verified flow.
 */

import { http } from "@/lib/api/http";

export type DomainStatus = "pending" | "verifying" | "verified" | "failed";

export interface WhiteLabelDomain {
  id: string;
  domain: string;
  isPrimary: boolean;
  status: DomainStatus;
  verifiedAt?: number;
  createdAt: number;
}

export interface WhiteLabel {
  id: string;
  companyName: string;
  logoUrl?: string;
  faviconUrl?: string;
  supportEmail?: string;
  supportPhone?: string;
  websiteUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  domains: WhiteLabelDomain[];
  createdAt?: number;
}

interface DomainWire {
  id: string;
  domain: string;
  isPrimary: boolean;
  status: string;
  verifiedAt?: string | null;
  createdAt: string;
}

interface WhiteLabelWire {
  id: string;
  companyName: string;
  logoUrl?: string;
  faviconUrl?: string;
  supportEmail?: string;
  supportPhone?: string;
  websiteUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  domains?: DomainWire[];
  createdAt?: string;
}

function normalizeDomainStatus(raw: string): DomainStatus {
  const s = raw.toLowerCase();
  if (s === "verifying" || s === "verified" || s === "failed") return s;
  return "pending";
}

function toTs(s: string | null | undefined): number | undefined {
  if (!s) return undefined;
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : undefined;
}

function wireToDomain(w: DomainWire): WhiteLabelDomain {
  return {
    id: w.id,
    domain: w.domain,
    isPrimary: !!w.isPrimary,
    status: normalizeDomainStatus(w.status),
    verifiedAt: toTs(w.verifiedAt),
    createdAt: toTs(w.createdAt) ?? Date.now(),
  };
}

function wireToWhiteLabel(w: WhiteLabelWire): WhiteLabel {
  return {
    id: w.id,
    companyName: w.companyName,
    logoUrl: w.logoUrl,
    faviconUrl: w.faviconUrl,
    supportEmail: w.supportEmail,
    supportPhone: w.supportPhone,
    websiteUrl: w.websiteUrl,
    primaryColor: w.primaryColor,
    secondaryColor: w.secondaryColor,
    domains: (w.domains ?? []).map(wireToDomain),
    createdAt: toTs(w.createdAt),
  };
}

export const whiteLabelService = {
  async get(): Promise<WhiteLabel | null> {
    try {
      return wireToWhiteLabel(await http.get<WhiteLabelWire>("/api/white-label/"));
    } catch (e) {
      if (e instanceof Error && /404/.test(e.message)) return null;
      throw e;
    }
  },

  async update(patch: Partial<WhiteLabel>): Promise<WhiteLabel> {
    return wireToWhiteLabel(await http.patch<WhiteLabelWire>("/api/white-label/", { body: patch }));
  },

  async getConfigByDomain(domain: string): Promise<WhiteLabel> {
    return wireToWhiteLabel(
      await http.get<WhiteLabelWire>("/api/white-label/config", { query: { domain } }),
    );
  },

  async addDomain(input: { domain: string; isPrimary?: boolean }): Promise<WhiteLabelDomain> {
    return wireToDomain(
      await http.post<DomainWire>("/api/white-label/domains", { body: input }),
    );
  },

  async removeDomain(id: string): Promise<void> {
    await http.delete(`/api/white-label/domains/${id}`);
  },

  async verifyDomain(id: string): Promise<WhiteLabelDomain> {
    return wireToDomain(await http.post<DomainWire>(`/api/white-label/domains/${id}/verify`));
  },
};
