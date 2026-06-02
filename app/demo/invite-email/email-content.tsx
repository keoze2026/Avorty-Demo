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

import { useTranslation } from "@/hooks/use-translation";

type Role = "buyer" | "publisher";

interface InviteCopy {
  preheader: string;
  subject: string;
  roleLabel: string;
  roleLower: string;
  acceptHref: string;
  what: string[];
}

function useRole(): Role {
  const params = useSearchParams();
  const v = params.get("role");
  return v === "publisher" ? "publisher" : "buyer";
}

function useCopy(): InviteCopy {
  const { t } = useTranslation();
  const role = useRole();

  if (role === "buyer") {
    return {
      preheader: t("authUI.inviteEmail.buyerPreheader"),
      subject: t("authUI.inviteEmail.buyerSubject"),
      roleLabel: t("authUI.invite.roleBuyer"),
      roleLower: t("authUI.invite.roleBuyerLower"),
      acceptHref: "/invite/buyer/buyer-demo",
      what: [
        t("authUI.inviteEmail.buyerWhat1"),
        t("authUI.inviteEmail.buyerWhat2"),
        t("authUI.inviteEmail.buyerWhat3"),
      ],
    };
  }
  return {
    preheader: t("authUI.inviteEmail.publisherPreheader"),
    subject: t("authUI.inviteEmail.publisherSubject"),
    roleLabel: t("authUI.invite.rolePublisher"),
    roleLower: t("authUI.invite.rolePublisherLower"),
    acceptHref: "/invite/publisher/publisher-demo",
    what: [
      t("authUI.inviteEmail.publisherWhat1"),
      t("authUI.inviteEmail.publisherWhat2"),
      t("authUI.inviteEmail.publisherWhat3"),
    ],
  };
}

export function SubjectLine() {
  const copy = useCopy();
  return <>{copy.subject}</>;
}

export function EmailBody() {
  const { t } = useTranslation();
  const copy = useCopy();

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
          {t("authUI.inviteEmail.brand")}
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
        {t("authUI.inviteEmail.headlineTemplate").replace("{role}", copy.roleLabel)}
      </h2>

      <p style={{ margin: "16px 0 0" }}>{t("authUI.inviteEmail.greeting")}</p>

      <p style={{ margin: "12px 0 0" }}>
        {(() => {
          const parts = t("authUI.inviteEmail.bodyTemplate")
            .replace("{roleLower}", copy.roleLower)
            .split("{inviter}");
          return (
            <>
              {parts[0]}
              <strong>Avery Chen</strong>
              {parts.slice(1).join("{inviter}")}
            </>
          );
        })()}
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
          {t("authUI.inviteEmail.ctaAccept")}
        </a>
      </div>

      <p style={{ margin: "20px 0 6px", fontWeight: 600, fontSize: 13 }}>
        {t("authUI.inviteEmail.whatHeading")}
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
        {t("authUI.inviteEmail.fallbackPrompt")}
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
        {t("authUI.inviteEmail.footerExpiry")}
        <br />
        <br />
        {t("authUI.inviteEmail.footerAddress")}
        <br />
        <a href="#" style={{ color: "#6B7280", textDecoration: "underline" }}>
          {t("authUI.inviteEmail.footerUnsubscribe")}
        </a>{" "}
        ·{" "}
        <a href="#" style={{ color: "#6B7280", textDecoration: "underline" }}>
          {t("authUI.inviteEmail.footerPrivacy")}
        </a>
      </div>
    </div>
  );
}
