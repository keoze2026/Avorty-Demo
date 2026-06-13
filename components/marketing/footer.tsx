"use client";

import Link from "next/link";

import { Wordmark } from "@/components/brand/wordmark";
import { useTranslation } from "@/hooks/use-translation";

const FOOTER_COLUMNS: {
  headingKey: string;
  links: { key: string }[];
}[] = [
  {
    headingKey: "marketingUI.footer.columns.platform",
    links: [
      { key: "marketingUI.footer.links.liveMonitor" },
      { key: "marketingUI.footer.links.routingBuilder" },
      { key: "marketingUI.footer.links.marketplace" },
      { key: "marketingUI.footer.links.aiInsights" },
      { key: "marketingUI.footer.links.numbers" },
      { key: "marketingUI.footer.links.analytics" },
    ],
  },
  {
    headingKey: "marketingUI.footer.columns.resources",
    links: [
      { key: "marketingUI.footer.links.documentation" },
      { key: "marketingUI.footer.links.apiReference" },
      { key: "marketingUI.footer.links.webhooks" },
      { key: "marketingUI.footer.links.changelog" },
      { key: "marketingUI.footer.links.status" },
      { key: "marketingUI.footer.links.sdk" },
    ],
  },
  {
    headingKey: "marketingUI.footer.columns.company",
    links: [
      { key: "marketingUI.footer.links.about" },
      { key: "marketingUI.footer.links.customers" },
      { key: "marketingUI.footer.links.careers" },
      { key: "marketingUI.footer.links.blog" },
      { key: "marketingUI.footer.links.press" },
      { key: "marketingUI.footer.links.contact" },
    ],
  },
  {
    headingKey: "marketingUI.footer.columns.legal",
    links: [
      { key: "marketingUI.footer.links.privacy" },
      { key: "marketingUI.footer.links.terms" },
      { key: "marketingUI.footer.links.security" },
      { key: "marketingUI.footer.links.tcpa" },
      { key: "marketingUI.footer.links.hipaa" },
      { key: "marketingUI.footer.links.soc2" },
    ],
  },
];

/** Social channels surfaced under the brand mark. Telegram is live; the rest
 *  link to "#" until URLs are confirmed — placeholder is intentional so the
 *  icons render in their final position now. */
const SOCIAL_LINKS: Array<{
  label: string;
  href: string;
  icon: React.ReactNode;
}> = [
  {
    label: "Telegram",
    href: "https://t.me/Avortyx_Sup",
    icon: <TelegramIcon />,
  },
  { label: "X", href: "#", icon: <XIcon /> },
  { label: "Discord", href: "#", icon: <DiscordIcon /> },
  { label: "Facebook", href: "#", icon: <FacebookIcon /> },
];

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-border px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Wordmark size="sm" uid="footer" gradient={false} />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {t("marketingUI.footer.tagline")}
            </p>

            {/* Social row */}
            <div className="mt-6">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Follow us
              </p>
              <ul className="mt-3 flex items-center gap-2">
                {SOCIAL_LINKS.map((s) => (
                  <li key={s.label}>
                    <SocialIconLink href={s.href} label={s.label}>
                      {s.icon}
                    </SocialIconLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.headingKey}>
              <h3 className="mb-4 text-sm font-medium text-foreground">
                {t(column.headingKey)}
              </h3>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.key}>
                    <Link
                      href="#"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground/85"
                    >
                      {t(link.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()}{" "}
            {t("marketingUI.footer.copyrightSuffix")}
          </p>
          <Link
            href="#"
            className="flex items-center gap-2 text-sm text-[color:var(--success)] transition-opacity hover:opacity-80"
          >
            <span className="h-2 w-2 rounded-full bg-[color:var(--success)]" />
            {t("marketingUI.footer.allSystemsOperational")}
          </Link>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Small circular icon button used for the social row. Renders the     */
/*  same affordance whether the link is live (external new-tab) or a    */
/*  placeholder `#`.                                                    */
/* ─────────────────────────────────────────────────────────────────── */

function SocialIconLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  const isExternal = href.startsWith("http");
  return (
    <a
      href={href}
      aria-label={label}
      title={label}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 bg-secondary/20 text-muted-foreground transition-colors hover:border-accent/40 hover:bg-accent/10 hover:text-accent"
    >
      {children}
    </a>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Brand-accurate SVG marks for each social channel. Inlined so we     */
/*  don't pull a brand-icon dependency just for four marks.             */
/* ─────────────────────────────────────────────────────────────────── */

function TelegramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-4 w-4 fill-current"
    >
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0Zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212-.07-.062-.174-.041-.249-.024-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635Z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-4 w-4 fill-current"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-4 w-4 fill-current"
    >
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03ZM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-4 w-4 fill-current"
    >
      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
    </svg>
  );
}
