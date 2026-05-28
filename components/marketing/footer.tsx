import Link from "next/link";

import { Wordmark } from "@/components/brand/wordmark";

const footerLinks: Record<string, string[]> = {
  Platform: ["Live Monitor", "Routing Builder", "Marketplace", "AI Insights", "Numbers", "Analytics"],
  Resources: ["Documentation", "API Reference", "Webhooks", "Changelog", "Status", "SDK"],
  Company: ["About", "Customers", "Careers", "Blog", "Press", "Contact"],
  Legal: ["Privacy", "Terms", "Security", "TCPA", "HIPAA", "SOC 2"],
};

export function Footer() {
  return (
    <footer className="border-t border-border py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Logo */}
          <div className="col-span-2 md:col-span-1">
            <Wordmark size="sm" uid="footer" gradient={false} />
            <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
              A real-time call tracking, routing, and analytics platform for modern pay-per-call
              marketers.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-foreground font-medium text-sm mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-muted-foreground hover:text-foreground/85 transition-colors text-sm"
                    >
                      {link}
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
            © {new Date().getFullYear()} Vortyx Inc. All rights reserved.
          </p>
          <Link
            href="#"
            className="text-[color:var(--success)] text-sm flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="w-2 h-2 bg-[color:var(--success)] rounded-full" />
            ALL SYSTEMS OPERATIONAL
          </Link>
        </div>
      </div>
    </footer>
  );
}
