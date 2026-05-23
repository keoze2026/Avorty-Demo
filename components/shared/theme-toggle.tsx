"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Monitor, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  /** "icon" = compact button (topbar). "menu" = dropdown with all 3 options. */
  variant?: "icon" | "menu";
}

export function ThemeToggle({ className, variant = "menu" }: ThemeToggleProps) {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // SSR placeholder — render a stable shell to avoid hydration mismatch
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className={cn("relative", className)} aria-label="Theme">
        <Sun className="h-4 w-4 opacity-50" />
      </Button>
    );
  }

  const isDark = (resolvedTheme ?? theme) === "dark";

  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn("relative overflow-hidden", className)}
        onClick={() => setTheme(isDark ? "light" : "dark")}
        aria-label="Toggle theme"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.span
              key="moon"
              initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Moon className="h-4 w-4" />
            </motion.span>
          ) : (
            <motion.span
              key="sun"
              initial={{ rotate: 90, opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -90, opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Sun className="h-4 w-4" />
            </motion.span>
          )}
        </AnimatePresence>
      </Button>
    );
  }

  const Icon = theme === "system" ? Monitor : isDark ? Moon : Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("relative", className)} aria-label="Theme">
          <Icon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuItem onSelect={() => setTheme("light")}>
          <Sun className="h-4 w-4" /> Light
          {theme === "light" && <span className="ml-auto text-[10px] text-accent">●</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setTheme("dark")}>
          <Moon className="h-4 w-4" /> Dark
          {theme === "dark" && <span className="ml-auto text-[10px] text-accent">●</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setTheme("system")}>
          <Monitor className="h-4 w-4" /> System
          {theme === "system" && <span className="ml-auto text-[10px] text-accent">●</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
