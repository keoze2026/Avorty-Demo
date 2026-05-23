"use client";

import * as React from "react";

import { ThemeProvider } from "./theme-provider";
import { QueryProvider } from "./query-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

/**
 * Single composition point for all client-side providers.
 * The order matters — theme outermost so toasts/popovers see the right palette.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <QueryProvider>
        <TooltipProvider delayDuration={150}>
          {children}
          <Toaster richColors closeButton />
        </TooltipProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
