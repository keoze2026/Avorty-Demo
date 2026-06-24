import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "Publisher" };

export default function PublisherDetailLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
