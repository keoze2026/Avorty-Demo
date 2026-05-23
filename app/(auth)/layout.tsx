import type { ReactNode } from "react";

import { GridBackground } from "@/components/shared/grid-background";
import { ThemeToggle } from "@/components/shared/theme-toggle";

/**
 * Auth pages share a centered card on top of the signature grid + glow.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <GridBackground glow mask={false} />

      {/* Ambient vortex orb */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl opacity-40"
        style={{
          background:
            "radial-gradient(circle at center, var(--vortyx-glow), transparent 70%)",
        }}
      />

      {/* Theme toggle pinned to the corner */}
      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full">{children}</div>
    </main>
  );
}
