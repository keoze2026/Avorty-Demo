import Link from "next/link";

import { Wordmark } from "@/components/brand/wordmark";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export default function NotFound() {
  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl opacity-30"
        style={{
          background:
            "radial-gradient(circle at center, var(--vortyx-glow), transparent 70%)",
        }}
      />
      <div className="relative z-10 text-center">
        <Wordmark size="lg" uid="404" />
        <h1 className="mt-8 font-mono text-6xl font-bold tracking-tight">404</h1>
        <p className="mt-2 text-muted-foreground">That route doesn&apos;t exist on this network.</p>
        <Link href={ROUTES.home} className="mt-6 inline-block">
          <Button>Take me home</Button>
        </Link>
      </div>
    </main>
  );
}
