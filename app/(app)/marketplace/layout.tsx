import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "Marketplace" };

export default function MarketplaceLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
