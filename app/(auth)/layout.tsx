import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/shared/theme-toggle";

/**
 * Auth pages — clean centered card. No grid, no glow, no orb.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-12">
      {/* Theme toggle pinned to the corner */}
      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>

      <div className="w-full">{children}</div>
    </main>
  );
}
