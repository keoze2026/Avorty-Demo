/**
 * KYC service — /api/kyc/*.
 *
 *   GET  /api/kyc/         — current submission for the org
 *   POST /api/kyc/         — submit individual KYC
 *   POST /api/kyc/company/ — submit company KYC
 *
 * Document URLs (`governmentIdUrl`, `businessRegistrationDocUrl`, etc.) are
 * pre-uploaded by the caller (storage proxy or signed URL flow) and the
 * KYC submission carries the resolved URL. Bulk file-upload helpers are not
 * in this service — they'd live in a storage service.
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

function normalizeStatus(raw: string): KycStatus {
  const s = raw.toLowerCase();
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
};
