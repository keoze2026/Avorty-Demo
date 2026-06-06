import type { ReactNode } from "react";

import { ChatWidget } from "@/components/marketing/chat-widget";
import { Footer } from "@/components/marketing/footer";
import { Navbar } from "@/components/marketing/navbar";

/**
 * Marketing layout — public navbar + footer wrapper.
 * Forces the dark theme for the marketing surface only; the rest of the
 * app continues to honor the user's theme choice.
 */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="marketing-shell dark force-dark min-h-screen overflow-x-clip bg-background text-foreground">
      <Navbar />
      <main>{children}</main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
