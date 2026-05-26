import type { Metadata } from "next";
import type { ReactNode } from "react";

import { MOCK_PUBLISHERS } from "@/lib/mock/publishers";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const publisher = MOCK_PUBLISHERS.find((p) => p.id === id);
  return { title: publisher?.name ?? "Publisher" };
}

export default function PublisherDetailLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
