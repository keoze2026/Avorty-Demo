import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export function CTASection() {
  return (
    <section className="relative overflow-hidden border-t border-border/40 bg-card/30 py-24 sm:py-32">
      {/* Perspective floor grid */}
      <div className="absolute inset-0 flex items-end justify-center overflow-hidden">
        <div
          className="w-[200%] h-[70%] origin-bottom animate-floor"
          style={{
            background: `
              linear-gradient(to right, #3a3a3a 2px, transparent 2px),
              linear-gradient(to bottom, #3a3a3a 2px, transparent 2px)
            `,
            backgroundSize: "4rem 4rem",
            transform: "perspective(500px) rotateX(60deg)",
            maskImage: "linear-gradient(to top, black 0%, black 50%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to top, black 0%, black 50%, transparent 100%)",
          }}
        />
      </div>

      {/* Vortex glow at the horizon */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto h-40 w-[70%] blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse 50% 100% at 50% 100%, var(--vortyx-glow), transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-mono text-3xl font-bold tracking-tight sm:text-5xl text-balance">
            Ready to route calls smarter?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join leading pay-per-call networks scaling traffic, decisioning, and revenue on Vortyx.
            Free for your first 2,000 calls — no credit card.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href={ROUTES.signup}>
              <Button size="lg" className="w-full sm:w-auto">
                Start free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
              Book a demo
            </Button>
          </div>
          <p className="mt-6 text-[11px] font-mono text-muted-foreground/80">
            Live network · 142ms decisioning · 12+ verticals supported
          </p>
        </div>
      </div>
    </section>
  );
}
