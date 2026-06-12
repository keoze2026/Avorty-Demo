/**
 * KYC service — /api/kyc/*.
 *
 *   GET  /api/kyc/                  — current submission for the org
 *   POST /api/kyc/                  — submit individual KYC
 *   POST /api/kyc/company/          — submit company KYC
 *   POST /api/kyc/documents/upload  — multipart upload, returns { url }
 *
 * The submission endpoints take pre-uploaded document URLs (`governmentIdUrl`,
 * `businessRegistrationDocUrl`). The frontend uploads files via the document
 * endpoint first, then submits the resolved URLs alongside the rest of the
 * form payload.
 */

import { http } from "@/lib/api/http";

export type KycStatus = "draft" | "submitted" | "approved" | "rejected" | "expired";
export type KycType = "individual" | "company";

export interface KycSubmission {
  id: string;
  kycType: KycType;
  status: KycStatus;
  rejectionReason?: string;
  country: string;
  address: string;
  phoneNumber: string;
  /** Individual fields */
  fullLegalName?: string;
  dateOfBirth?: string;
  governmentIdUrl?: string;
  /** Company fields */
  companyLegalName?: string;
  businessRegistrationNumber?: string;
  taxId?: string;
  directorName?: string;
  businessRegistrationDocUrl?: string;
  /** Timestamps */
  submittedAt?: number;
  reviewedAt?: number;
}

export interface KycIndividualInput {
  fullLegalName: string;
  dateOfBirth: string;
  country: string;
  address: string;
  phoneNumber: string;
  governmentIdUrl: string;
}

export interface KycCompanyInput {
  companyLegalName: string;
  businessRegistrationNumber: string;
  taxId: string;
  country: string;
  address: string;
  phoneNumber: string;
  directorName: string;
  businessRegistrationDocUrl: string;
}

/* ─── Wire shapes (post case-adapter) ──────────────────────────────────── */

interface KycWire {
  id: string;
  kycType: string;
  status: string;
  rejectionReason?: string;
  country?: string;
  address?: string;
  phoneNumber?: string;
  fullLegalName?: string;
  dateOfBirth?: string | null;
  governmentIdUrl?: string;
  companyLegalName?: string;
  businessRegistrationNumber?: string;
  taxId?: string;
  directorName?: string;
  businessRegistrationDocUrl?: string;
  submittedAt?: string | null;
  reviewedAt?: string | null;
}

function normalizeStatus(raw: string | null | undefined): KycStatus {
  const s = (raw ?? "").toLowerCase();
  if (s === "draft" || s === "submitted" || s === "approved" ||
      s === "rejected" || s === "expired") return s;
  return "draft";
}

function normalizeType(raw: string): KycType {
  return raw === "company" ? "company" : "individual";
}

function toTs(s: string | null | undefined): number | undefined {
  if (!s) return undefined;
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : undefined;
}

function wireToSubmission(w: KycWire): KycSubmission {
  return {
    id: w.id,
    kycType: normalizeType(w.kycType),
    status: normalizeStatus(w.status),
    rejectionReason: w.rejectionReason || undefined,
    country: w.country ?? "",
    address: w.address ?? "",
    phoneNumber: w.phoneNumber ?? "",
    fullLegalName: w.fullLegalName,
    dateOfBirth: w.dateOfBirth ?? undefined,
    governmentIdUrl: w.governmentIdUrl,
    companyLegalName: w.companyLegalName,
    businessRegistrationNumber: w.businessRegistrationNumber,
    taxId: w.taxId,
    directorName: w.directorName,
    businessRegistrationDocUrl: w.businessRegistrationDocUrl,
    submittedAt: toTs(w.submittedAt),
    reviewedAt: toTs(w.reviewedAt),
  };
}

export const kycService = {
  /** Fetch the current org's KYC submission (404 → returns null). */
  async get(): Promise<KycSubmission | null> {
    try {
      const wire = await http.get<KycWire>("/api/kyc/");
      return wireToSubmission(wire);
    } catch (e) {
      if (e instanceof Error && /404/.test(e.message)) return null;
      throw e;
    }
  },

  async submitIndividual(input: KycIndividualInput): Promise<KycSubmission> {
    return wireToSubmission(
      await http.post<KycWire>("/api/kyc/", { body: { kycType: "individual", ...input } }),
    );
  },

  async submitCompany(input: KycCompanyInput): Promise<KycSubmission> {
    return wireToSubmission(
      await http.post<KycWire>("/api/kyc/company/", { body: { kycType: "company", ...input } }),
    );
  },

  /**
   * Upload a KYC supporting document (government ID, business registration
   * certificate, etc.). Multipart POST; the backend persists the file and
   * returns the resolved URL the caller passes into `submitIndividual`
   * or `submitCompany` as the `governmentIdUrl` / `businessRegistrationDocUrl`
   * field.
   */
  async uploadDocument(file: File): Promise<{ url: string }> {
    const form = new FormData();
    form.append("file", file);
    const res = await http.post<{ url?: string; documentUrl?: string }>(
      "/api/kyc/documents/upload",
      { body: form, rawBody: true },
    );
    const url = res.url ?? res.documentUrl ?? "";
    if (!url) throw new Error("Upload succeeded but the server returned no URL.");
    return { url };
  },
};
