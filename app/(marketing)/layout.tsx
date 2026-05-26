import type { ReactNode } from "react";

import { Footer } from "@/components/marketing/footer";
import { Navbar } from "@/components/marketing/navbar";
import { StickyCTA } from "@/components/marketing/sticky-cta";

/**
 * Marketing layout — public navbar + footer wrapper + floating sticky CTA.
 * Lives at /, /pricing, etc.
 */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  // Marketing surfaces are crafted for the dark premium treatment;
  // we scope `.dark` to this subtree so the rest of the app can still
  // honor the user's theme choice.
  return (
    <div className="dark force-dark min-h-screen bg-background text-foreground">
      <Navbar />
      <main>{children}</main>
      <Footer />
      <StickyCTA />
    </div>
  );
}
