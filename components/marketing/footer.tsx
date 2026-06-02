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

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-border py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Logo */}
          <div className="col-span-2 md:col-span-1">
            <Wordmark size="sm" uid="footer" gradient={false} />
            <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
              {t("marketingUI.footer.tagline")}
            </p>
          </div>

          {/* Links */}
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.headingKey}>
              <h3 className="text-foreground font-medium text-sm mb-4">{t(column.headingKey)}</h3>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.key}>
                    <Link
                      href="#"
                      className="text-muted-foreground hover:text-foreground/85 transition-colors text-sm"
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
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} {t("marketingUI.footer.copyrightSuffix")}
          </p>
          <Link
            href="#"
            className="text-[color:var(--success)] text-sm flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="w-2 h-2 bg-[color:var(--success)] rounded-full" />
            {t("marketingUI.footer.allSystemsOperational")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
