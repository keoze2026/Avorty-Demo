"use client";

/**
 * Subject + body for the invite email preview. Lives in a client component
 * so the role switcher (?role=buyer | publisher) can rewrite the copy and
 * the CTA target without a full reload.
 *
 * The body uses inline-style-only HTML — that's how real transactional
 * email templates have to be authored (most mail clients strip <style> and
 * external stylesheets), so this doubles as a sketch of what the actual
 * Mailgun / Postmark template would output.
 */

import { useSearchParams } from "next/navigation";

type Role = "buyer" | "publisher";

interface InviteCopy {
  preheader: string;
  subject: string;
  roleLabel: string;
  roleLower: string;
  acceptHref: string;
  what: string[];
}

const COPY: Record<Role, InviteCopy> = {
  buyer: {
    preheader:
      "Avery Chen at Vortyx invited you to buy calls on their network.",
    subject: "You're invited to Vortyx — start buying qualified calls",
    roleLabel: "Buyer",
    roleLower: "buyer",
    acceptHref: "/invite/buyer/buyer-demo",
    what: [
      "Live view of every routed call, including caller geo and intent signals",
      "Daily / monthly cap controls and concurrency limits",
      "Per-vertical bidding with full call recording and dispute tools",
    ],
  },
  publisher: {
    preheader:
      "Avery Chen at Vortyx invited you to monetize your traffic with their buyers.",
    subject: "You're invited to Vortyx — start monetizing your calls",
    roleLabel: "Publisher",
    roleLower: "publisher",
    acceptHref: "/invite/publisher/publisher-demo",
    what: [
      "Live revenue, payout share, and per-campaign earnings",
      "Number provisioning and routing assignment in seconds",
      "Direct payouts with full transparency on every billable call",
    ],
  },
};

function useRole(): Role {
  const params = useSearchParams();
  const v = params.get("role");
  return v === "publisher" ? "publisher" : "buyer";
}

export function SubjectLine() {
  const copy = COPY[useRole()];
  return <>{copy.subject}</>;
}

export function EmailBody() {
  const copy = COPY[useRole()];

  return (
    <div
      style={{
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        color: "#1F2937",
        fontSize: 15,
        lineHeight: 1.6,
        padding: "32px 40px 40px",
        background: "#ffffff",
      }}
    >
      {/* Preheader — hidden in most clients but shown in the inbox preview */}
      <div
        style={{
          display: "none",
          maxHeight: 0,
          overflow: "hidden",
          color: "transparent",
        }}
      >
        {copy.preheader}
      </div>

      {/* Brand mark */}
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontWeight: 600,
            fontSize: 16,
            color: "#0F1117",
          }}
        >
          <span
            aria-hidden
            style={{
              width: 24,
              height: 24,
              borderRadius: 999,
              background:
                "linear-gradient(135deg, #3A4BC4 0%, #5266E0 55%, #818CF8 100%)",
              display: "inline-block",
            }}
          />
          Vortyx
        </div>
      </div>

      <h2
        style={{
          margin: 0,
          fontSize: 22,
          lineHeight: 1.3,
          color: "#0F1117",
          fontWeight: 600,
        }}
      >
        You&apos;re invited to Vortyx as a {copy.roleLabel}
      </h2>

      <p style={{ margin: "16px 0 0" }}>Hi there —</p>

      <p style={{ margin: "12px 0 0" }}>
        <strong>Avery Chen</strong> at Vortyx invited you to join their{" "}
        {copy.roleLower} workspace. Click the button below to accept your
        invitation, set a password, and get started.
      </p>

      {/* CTA */}
      <div style={{ margin: "28px 0" }}>
        <a
          href={copy.acceptHref}
          style={{
            display: "inline-block",
            padding: "12px 22px",
            background: "#0F1117",
            color: "#ffffff",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          Accept invitation →
        </a>
      </div>

      <p style={{ margin: "20px 0 6px", fontWeight: 600, fontSize: 13 }}>
        What you&apos;ll get
      </p>
      <ul style={{ margin: "4px 0 0", paddingLeft: 20, color: "#374151" }}>
        {copy.what.map((line) => (
          <li key={line} style={{ marginBottom: 4 }}>
            {line}
          </li>
        ))}
      </ul>

      {/* Plain-text fallback link */}
      <div
        style={{
          marginTop: 28,
          padding: "16px 18px",
          background: "#F3F4F6",
          border: "1px solid #E5E7EB",
          borderRadius: 8,
          fontSize: 12,
          color: "#4B5563",
          wordBreak: "break-all",
        }}
      >
        If the button doesn&apos;t work, paste this URL into your browser:
        <br />
        <span style={{ color: "#0F1117", fontFamily: "monospace" }}>
          https://app.vortyx.io{copy.acceptHref}
        </span>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: 36,
          paddingTop: 16,
          borderTop: "1px solid #E5E7EB",
          color: "#6B7280",
          fontSize: 12,
        }}
      >
        This invitation expires in 7 days. If you weren&apos;t expecting this,
        you can safely ignore the message.
        <br />
        <br />
        Vortyx, Inc. · 548 Market St #28000 · San Francisco, CA 94104
        <br />
        <a href="#" style={{ color: "#6B7280", textDecoration: "underline" }}>
          Unsubscribe
        </a>{" "}
        ·{" "}
        <a href="#" style={{ color: "#6B7280", textDecoration: "underline" }}>
          Privacy
        </a>
      </div>
    </div>
  );
}
