"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * TanStack Query client.
 * Defaults err on the conservative side — we re-fetch on focus, retry once.
 */
function makeClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: true,
        retry: 1,
      },
    },
  });
}

let browserClient: QueryClient | undefined;
function getClient() {
  if (typeof window === "undefined") return makeClient(); // SSR: fresh each request
  if (!browserClient) browserClient = makeClient();
  return browserClient;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(getClient);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
