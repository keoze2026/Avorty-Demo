"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

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
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 px-4 sm:bottom-6 sm:left-auto sm:right-6 sm:translate-x-0 sm:px-0"
        >
          <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/95 px-3 py-1.5 backdrop-blur-xl">
            <div className="px-1">
              <span className="text-xs text-foreground">Try Vortyx free</span>
            </div>
            <Link href={ROUTES.signup}>
              <Button size="sm" className="h-7 rounded-full px-3 text-xs font-medium">
                Start free
              </Button>
            </Link>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => setDismissed(true)}
              className="inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
