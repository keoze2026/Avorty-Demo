"use client";

/**
 * Language picker — globe icon popover that swaps between the configured
 * locales (English, Russian, Japanese). State persists via `useLocaleStore`.
 */

import { useEffect, useState } from "react";
import { Check, Globe } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LOCALES } from "@/lib/i18n/locales";
import { useLocaleStore } from "@/lib/store/locale-store";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

export function LanguageToggle({ className }: Props) {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const { t } = useTranslation();

  // SSR-safe — render a stable shell until hydration.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn("relative", className)}
        aria-label="Language"
      >
        <Globe className="h-4 w-4 opacity-50" />
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative", className)}
          aria-label={t("topbar.language")}
        >
          <Globe className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-2">
        <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t("preferences.language")}
        </div>
        <ul className="space-y-0.5">
          {LOCALES.map((loc) => {
            const active = locale === loc.id;
            return (
              <li key={loc.id}>
                <button
                  type="button"
                  onClick={() => setLocale(loc.id)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-accent/10 text-foreground"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                  )}
                >
                  <span aria-hidden className="text-base leading-none">
                    {loc.flag}
                  </span>
                  <span className="flex-1 text-left">
                    <span className="font-medium">{loc.label}</span>
                    {loc.label !== loc.english && (
                      <span className="ml-1.5 text-[11px] text-muted-foreground">
                        · {loc.english}
                      </span>
                    )}
                  </span>
                  {active && <Check className="h-3.5 w-3.5 text-accent" />}
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
