/**
 * Contact service — public contact form on the marketing site.
 *
 * Endpoint:
 *   POST /api/contact/  (anonymous, rate-limited 5/min by IP)
 *
 * The backend persists the submission, emails the support inbox, and
 * pings the sales team's Telegram channel. We just POST the form fields
 * and surface the resulting success/error to the visitor.
 */

import { http } from "@/lib/api/http";

export interface ContactInput {
  name: string;
  email: string;
  message: string;
}

export interface ContactSubmission {
  id: string;
  createdAt: number;
}

interface ContactSubmissionWire {
  id: string;
  createdAt: string;
}

function toTs(s: string | null | undefined): number {
  if (!s) return Date.now();
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : Date.now();
}

export const contactService = {
  async send(input: ContactInput): Promise<ContactSubmission> {
    const wire = await http.post<ContactSubmissionWire>("/api/contact/", {
      body: input,
      anonymous: true,
    });
    return {
      id: wire.id,
      createdAt: toTs(wire.createdAt),
    };
  },
};
