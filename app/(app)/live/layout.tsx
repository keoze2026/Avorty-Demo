import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "Live Monitor" };

export default function LiveLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
