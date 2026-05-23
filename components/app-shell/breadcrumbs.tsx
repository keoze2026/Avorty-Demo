"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { ROUTES } from "@/lib/constants";
import { NAV_LABEL_BY_PATH } from "@/lib/nav";
import { useUIStore } from "@/lib/store/ui-store";
import { cn } from "@/lib/utils";

function humanize(seg: string) {
  return seg.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());
}

export function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname();
  const overrides = useUIStore((s) => s.breadcrumbOverrides);

  if (!pathname || pathname === "/") return null;

  const segments = pathname.split("/").filter(Boolean);
  const crumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    // Order of precedence: per-path override → known nav label → humanized segment
    const label = overrides[href] ?? NAV_LABEL_BY_PATH[href] ?? humanize(seg);
    return { href, label };
  });

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-1 text-xs", className)}>
      <Link href={ROUTES.dashboard} className="text-muted-foreground hover:text-foreground transition-colors">
        Vortyx
      </Link>
      {crumbs.map((c, i) => {
        const last = i === crumbs.length - 1;
        return (
          <span key={c.href} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
            {last ? (
              <span className="font-mono text-foreground">{c.label}</span>
            ) : (
              <Link href={c.href} className="text-muted-foreground hover:text-foreground transition-colors">
                {c.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
