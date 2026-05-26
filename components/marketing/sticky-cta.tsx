"use client";

/**
 * Floating sticky CTA that fades into view after the user scrolls past the hero.
 * Appears at bottom-right on desktop, full-width pill at the bottom on mobile.
 * Hides itself once the user reaches the page's bottom CTA section.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

const SHOW_AFTER_PX = 700;

export function StickyCTA() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (dismissed) return setVisible(false);
      const y = window.scrollY;
      // Hide near the bottom so it doesn't overlap the page's own CTA section
      const nearBottom = window.innerHeight + y > document.body.scrollHeight - 600;
      setVisible(y > SHOW_AFTER_PX && !nearBottom);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [dismissed]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 px-4 sm:bottom-6 sm:left-auto sm:right-6 sm:translate-x-0 sm:px-0"
        >
          <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/95 px-3 py-2 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent/15 text-accent">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <div className="pr-2">
              <div className="text-xs font-semibold leading-tight">Try Vortyx free</div>
              <div className="text-[10px] text-muted-foreground leading-tight">2,000 calls · no card</div>
            </div>
            <Link href={ROUTES.signup}>
              <Button size="sm" className="h-8 px-3 text-xs">
                Start
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => setDismissed(true)}
              className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
