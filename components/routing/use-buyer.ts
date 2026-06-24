"use client";

import { useBuyersStore } from "@/lib/store/buyers-store";

export function useBuyer(id: string) {
  return useBuyersStore((s) => s.buyers.find((b) => b.id === id));
}
