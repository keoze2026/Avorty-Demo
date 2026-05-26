import type { Metadata } from "next";
import type { ReactNode } from "react";

import { MOCK_BUYERS } from "@/lib/mock/buyers";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const buyer = MOCK_BUYERS.find((b) => b.id === id);
  return { title: buyer?.name ?? "Buyer" };
}

export default function BuyerDetailLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
