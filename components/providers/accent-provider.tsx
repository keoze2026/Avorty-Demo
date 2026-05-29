"use client";

/**
 * Listens to the accent store and overrides the relevant CSS variables on
 * `<html>` whenever the user picks a different brand color. Renders nothing.
 */

import * as React from "react";

import { findAccent } from "@/lib/accent-themes";
import { useAccentStore } from "@/lib/store/accent-store";

export function AccentProvider() {
  const accent = useAccentStore((s) => s.accent);

  React.useEffect(() => {
    const cfg = findAccent(accent);
    const root = document.documentElement;
    root.style.setProperty("--accent", cfg.accent);
    root.style.setProperty("--accent-foreground", cfg.accentForeground);
    // The focus ring should match the accent so form fields feel coherent.
    root.style.setProperty("--ring", cfg.accent);
  }, [accent]);

  return null;
}
