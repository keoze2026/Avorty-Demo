import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "Buyer" };

export default function BuyerDetailLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
