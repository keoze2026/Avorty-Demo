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
 *
 * Structure (matches the polished SaaS invite template the user provided):
 *   ┌──────────────────────────────────────────────┐
 *   │   ░░░ COSMIC GRADIENT HERO ░░░               │
 *   │            Avortyx                            │
 *   │       Pay-per-call routing, reimagined.      │
 *   ├──────────────────────────────────────────────┤
 *   │   Hi there                                   │
 *   │                                              │
 *   │   This email has been sent because           │
 *   │   {inviter} is using Avortyx ...              │
 *   │                                              │
 *   │   Please click below to accept...            │
 *   │                                              │
 *   │   [   Accept invitation →   ]                │
 *   │                                              │
 *   │   What you'll get                            │
 *   │   ✓ ...                                      │
 *   │   ✓ ...                                      │
 *   │   ✓ ...                                      │
 *   ├──────────────────────────────────────────────┤
 *   │   (avatar)  Have a question?                 │
 *   │            Get in touch with our team...     │
 *   │            We're here to help 24/7.          │
 *   │            Talk to an expert / Request demo  │
 *   ├──────────────────────────────────────────────┤
 *   │   Plain-text fallback URL                    │
 *   │   Footer: expiry · address · unsub · privacy │
 *   └──────────────────────────────────────────────┘
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

const INVITER_NAME = "Avery Chen";

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

      {/* ─────────────────────────── HERO ─────────────────────────── */}
      <div
        style={{
          background:
            "radial-gradient(ellipse at 30% 30%, #5266E0 0%, #1A1F4D 35%, #050810 75%), radial-gradient(ellipse at 75% 70%, rgba(217, 70, 239, 0.35) 0%, transparent 50%)",
          padding: "48px 40px 56px",
          textAlign: "center",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            fontWeight: 700,
            fontSize: 28,
            letterSpacing: "-0.02em",
            color: "#ffffff",
          }}
        >
          <span
            aria-hidden
            style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              background:
                "linear-gradient(135deg, #3A4BC4 0%, #5266E0 55%, #818CF8 100%)",
              display: "inline-block",
              boxShadow:
                "0 0 20px rgba(82, 102, 224, 0.6), inset 0 -4px 12px rgba(0,0,0,0.2)",
            }}
          />
          {t("authUI.inviteEmail.brand")}
        </div>
        <p
          style={{
            margin: "12px 0 0",
            color: "rgba(255,255,255,0.78)",
            fontSize: 14,
            fontWeight: 500,
            letterSpacing: "0.01em",
          }}
        >
          {t("authUI.inviteEmail.heroTagline")}
        </p>
      </div>

      {/* ─────────────────────────── BODY ─────────────────────────── */}
      <div style={{ padding: "40px 40px 24px" }}>
        <h2
          style={{
            margin: 0,
            fontSize: 22,
            lineHeight: 1.3,
            color: "#0F1117",
            fontWeight: 600,
          }}
        >
          {t("authUI.inviteEmail.headlineTemplate").replace(
            "{role}",
            copy.roleLabel,
          )}
        </h2>

        <p style={{ margin: "20px 0 0", color: "#374151" }}>
          {t("authUI.inviteEmail.greeting")}
        </p>

        <p style={{ margin: "14px 0 0", color: "#374151" }}>
          {(() => {
            const parts = t("authUI.inviteEmail.bodyTemplate")
              .replace("{roleLower}", copy.roleLower)
              .split("{inviter}");
            return (
              <>
                {parts[0]}
                <strong style={{ color: "#0F1117" }}>{INVITER_NAME}</strong>
                {parts.slice(1).join("{inviter}")}
              </>
            );
          })()}
        </p>

        <p style={{ margin: "14px 0 0", color: "#374151" }}>
          {t("authUI.inviteEmail.pleaseClick")}
        </p>

        {/* CTA — centered, full-width on narrow viewports */}
        <div style={{ margin: "32px 0 28px", textAlign: "center" }}>
          <a
            href={copy.acceptHref}
            style={{
              display: "inline-block",
              padding: "14px 32px",
              background:
                "linear-gradient(135deg, #3A4BC4 0%, #5266E0 55%, #818CF8 100%)",
              color: "#ffffff",
              borderRadius: 10,
              textDecoration: "none",
              fontWeight: 600,
              fontSize: 15,
              boxShadow:
                "0 12px 28px -10px rgba(82, 102, 224, 0.55), 0 2px 4px rgba(0,0,0,0.08)",
            }}
          >
            {t("authUI.inviteEmail.ctaAccept")}
          </a>
        </div>

        {/* What you'll get */}
        <div
          style={{
            marginTop: 12,
            padding: "20px 22px",
            background: "#F8FAFF",
            border: "1px solid #E5E9F7",
            borderRadius: 12,
          }}
        >
          <p
            style={{
              margin: 0,
              fontWeight: 600,
              fontSize: 13,
              color: "#0F1117",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {t("authUI.inviteEmail.whatHeading")}
          </p>
          <ul
            style={{
              margin: "10px 0 0",
              paddingLeft: 0,
              listStyle: "none",
              color: "#374151",
            }}
          >
            {copy.what.map((line) => (
              <li
                key={line}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  marginBottom: 6,
                  fontSize: 14,
                }}
              >
                <span
                  aria-hidden
                  style={{
                    flexShrink: 0,
                    width: 16,
                    height: 16,
                    marginTop: 3,
                    borderRadius: 999,
                    background:
                      "linear-gradient(135deg, #3A4BC4 0%, #5266E0 100%)",
                    color: "#ffffff",
                    fontSize: 10,
                    fontWeight: 700,
                    lineHeight: "16px",
                    textAlign: "center",
                  }}
                >
                  ✓
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ──────────────────────── EXPERT BLOCK ──────────────────────── */}
      <div
        style={{
          margin: "0 40px",
          padding: "28px 0 32px",
          borderTop: "1px solid #E5E7EB",
          display: "flex",
          alignItems: "flex-start",
          gap: 18,
        }}
      >
        <Avatar />
        <div style={{ flex: 1 }}>
          <p
            style={{
              margin: 0,
              fontWeight: 700,
              fontSize: 15,
              color: "#0F1117",
            }}
          >
            {t("authUI.inviteEmail.haveQuestion")}
          </p>
          <p style={{ margin: "6px 0 0", color: "#374151", fontSize: 14 }}>
            {t("authUI.inviteEmail.haveQuestionBody")}
          </p>
          <p style={{ margin: "10px 0 0", color: "#374151", fontSize: 14 }}>
            {t("authUI.inviteEmail.helpAvailable")}
          </p>
          <p style={{ margin: "14px 0 0", fontSize: 14 }}>
            <a
              href="mailto:experts@avortyx.io"
              style={{
                color: "#5266E0",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              {t("authUI.inviteEmail.talkToExpert")}
            </a>
            <span style={{ color: "#9CA3AF", margin: "0 8px" }}>/</span>
            <a
              href="#"
              style={{
                color: "#5266E0",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              {t("authUI.inviteEmail.requestDemo")}
            </a>
          </p>
        </div>
      </div>

      {/* ─────────── Plain-text fallback URL ─────────── */}
      <div style={{ padding: "0 40px" }}>
        <div
          style={{
            padding: "14px 16px",
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
            https://app.avortyx.io{copy.acceptHref}
          </span>
        </div>
      </div>

      {/* ─────────────────────── FOOTER ─────────────────────── */}
      <div
        style={{
          margin: "28px 40px 32px",
          paddingTop: 18,
          borderTop: "1px solid #E5E7EB",
          color: "#6B7280",
          fontSize: 12,
          lineHeight: 1.7,
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

/* ──────────────────────────────────────────────────────────── */
/*  Avatar — initials chip with brand gradient                   */
/* ──────────────────────────────────────────────────────────── */

function Avatar() {
  const { t } = useTranslation();
  return (
    <div style={{ flexShrink: 0, textAlign: "center" }}>
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 999,
          padding: 2,
          background:
            "linear-gradient(135deg, #3A4BC4 0%, #5266E0 55%, #818CF8 100%)",
          boxShadow: "0 8px 20px -8px rgba(82, 102, 224, 0.55)",
          boxSizing: "border-box",
        }}
      >
        <img
          src="/avatars/Female-avatar.webp"
          alt={INVITER_NAME}
          width={68}
          height={68}
          style={{
            width: 68,
            height: 68,
            borderRadius: 999,
            display: "block",
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
      </div>
      <p
        style={{
          margin: "8px 0 0",
          fontSize: 11,
          color: "#6B7280",
          fontWeight: 600,
        }}
      >
        {INVITER_NAME}
      </p>
      <p
        style={{
          margin: "1px 0 0",
          fontSize: 10,
          color: "#9CA3AF",
        }}
      >
        {t("authUI.inviteEmail.inviterRole")}
      </p>
    </div>
  );
}
