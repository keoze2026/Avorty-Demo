"use client";

import { useMemo } from "react";

import { MOCK_BUYERS } from "@/lib/mock/buyers";

/** Tiny helper — buyer lookup by id. Centralized so we can swap to a query later. */
export function useBuyer(id: string) {
  return useMemo(() => MOCK_BUYERS.find((b) => b.id === id), [id]);
}
