/**
 * Section header for marketing pages — eyebrow + title + description block.
 */

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  eyebrowIcon?: LucideIcon;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeader({
  eyebrow,
  eyebrowIcon: EyebrowIcon,
  title,
  description,
  align = "center",
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("mx-auto max-w-2xl", align === "center" && "text-center", className)}>
      {eyebrow && (
        <div
          className={cn(
            "flex items-center gap-2 text-sm text-accent",
            align === "center" && "justify-center",
          )}
        >
          {EyebrowIcon && <EyebrowIcon className="h-4 w-4" />}
          <span className="font-mono uppercase tracking-wider">{eyebrow}</span>
        </div>
      )}
      <h2 className="mt-4 font-mono text-3xl font-bold tracking-tight text-balance sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-lg text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
