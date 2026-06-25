"use client";

/**
 * Refuse to render a demo build when the page is served from the real
 * production hostname. Prevents an accidental `NEXT_PUBLIC_DEMO_MODE=true`
 * deploy from showing fake data to real users.
 *
 * The check happens client-side after first paint so SSR isn't affected
 * (we can't read window.location during SSR anyway).
 *
 * Removal: delete this file and remove the wrapper in `app-providers.tsx`.
 */

import * as React from "react";

import { isDemoMode, isProductionHostname } from "@/lib/demo/flag";

export function DemoModeGuard({ children }: { children: React.ReactNode }) {
  const [blocked, setBlocked] = React.useState(false);

  React.useEffect(() => {
    if (isDemoMode() && isProductionHostname()) {
      // Log loudly so any deploy monitoring picks it up.
      console.error(
        "[demo-guard] Demo build detected on production hostname. Refusing to start.",
      );
      setBlocked(true);
    }
  }, []);

  if (blocked) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0d1f",
          color: "#f8f8fb",
          fontFamily: "system-ui, sans-serif",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
            Demo build on production host
          </h1>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(248,248,251,0.7)" }}>
            This is a marketing-demo build of Avortyx and it cannot run on the
            production domain. If you are seeing this in error, redeploy with
            <code style={{ background: "rgba(255,255,255,0.06)", padding: "1px 6px", borderRadius: 4, marginLeft: 6, marginRight: 6 }}>
              NEXT_PUBLIC_DEMO_MODE=false
            </code>
            and try again.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
