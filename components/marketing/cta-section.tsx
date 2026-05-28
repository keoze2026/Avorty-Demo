import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export function CTASection() {
  return (
    <section className="border-t border-border/40 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Ready to route calls smarter?
          </h2>
          <p className="mt-4 text-balance text-base text-muted-foreground sm:text-lg">
            Join leading pay-per-call networks scaling traffic, decisioning, and revenue on Vortyx.
            Free for your first 2,000 calls — no credit card.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href={ROUTES.signup}>
              <Button size="lg" className="h-11 w-full px-6 text-sm font-medium sm:w-auto">
                Get started — free
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="h-11 w-full px-6 text-sm font-medium sm:w-auto"
            >
              Book a demo
            </Button>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            Live network · 142ms decisioning · 12+ verticals supported
          </p>
        </div>
      </div>
    </section>
  );
}
