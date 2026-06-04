"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { useUIStore } from "@/lib/store/ui-store";

/**
 * Register a breadcrumb label for the current path.
 * Detail pages call this with the resolved entity name (e.g. campaign name)
 * so the breadcrumb reads as "Avortyx › Campaigns › Health Insurance — Tier 1"
 * instead of the raw ID.
 */
export function useBreadcrumbOverride(label: string | undefined) {
  const pathname = usePathname();
  const set = useUIStore((s) => s.setBreadcrumbOverride);
  const clear = useUIStore((s) => s.clearBreadcrumbOverride);

  useEffect(() => {
    if (!pathname || !label) return;
    set(pathname, label);
    return () => clear(pathname);
  }, [pathname, label, set, clear]);
}
