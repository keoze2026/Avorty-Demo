/**
 * Centered card frame used by login / signup / forgot-password.
 * The decoration (grid + glow) lives in the (auth) layout — this just hosts the form.
 */

import * as React from "react";

import { Wordmark } from "@/components/brand/wordmark";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function AuthCard({ title, description, children, footer, className }: AuthCardProps) {
  return (
    <div
      className={cn(
        "relative w-full max-w-md rounded-2xl border border-border/60 bg-card/80 p-8 backdrop-blur-xl",
        className,
      )}
    >
      <div className="mb-7 flex flex-col items-center gap-4 text-center">
        <Wordmark href={null} iconOnly size="md" uid="auth" />
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-foreground">{title}</h1>
          {description && (
            <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>

      {children}

      {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
    </div>
  );
}
