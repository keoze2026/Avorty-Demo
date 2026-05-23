"use client";

/**
 * Client-side auth gate for the (app) route group.
 * Waits for the persisted store to hydrate, then redirects unauthenticated
 * visitors to /login (with `?from=` so we can return them after sign-in).
 *
 * NOTE: this is a UX guard, not a security boundary — when a real backend
 * is wired up, enforce auth in middleware / on the server too.
 */

import { useRouter, usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { Logo } from "@/components/brand/logo";
import { ROUTES } from "@/lib/constants";
import { useAuthStore } from "@/lib/store/auth-store";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthed = useAuthStore((s) => s.isAuthenticated);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthed) {
      const params = new URLSearchParams();
      if (pathname) params.set("from", pathname);
      router.replace(`${ROUTES.login}?${params.toString()}`);
    }
  }, [hydrated, isAuthed, pathname, router]);

  if (!hydrated || !isAuthed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Logo animated className="h-10 w-10" uid="guard" />
          <p className="text-xs font-mono uppercase tracking-wider">Loading workspace…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
