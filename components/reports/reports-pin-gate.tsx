"use client";

import * as React from "react";
import { Lock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/lib/constants";
import { useSecurityStore } from "@/lib/store/security-store";
import { cn } from "@/lib/utils";

interface Props {
  /** What the report would look like if the gate weren't here. */
  children: React.ReactNode;
  /** Is the user currently asking for past-date data? Drives whether the
   *  gate even checks the PIN. */
  needsPin: boolean;
  /** Called when the user wants to back out — typically resets dateRange. */
  onCancel?: () => void;
}

/**
 * Reports PIN gate.
 *
 * Shows the unlock screen when:
 *   1. The user has set a `reportsPin` in security settings
 *   2. The current date range includes anything before today
 *   3. The session hasn't been unlocked yet
 *
 * Today-only views pass through untouched, and accounts without a PIN at
 * all (`reportsPin === null`) also pass through — the gate is opt-in via
 * the Security settings card.
 */
export function ReportsPinGate({ children, needsPin, onCancel }: Props) {
  const reportsPin = useSecurityStore((s) => s.reportsPin);
  const unlocked = useSecurityStore((s) => s.reportsPinUnlocked);
  const unlockReports = useSecurityStore((s) => s.unlockReports);
  const lockReports = useSecurityStore((s) => s.lockReports);

  const [entered, setEntered] = React.useState("");
  const [attempts, setAttempts] = React.useState(0);

  // PIN not configured, or already unlocked, or the date range is today-only
  // → render the report straight through, with an optional "Lock" affordance
  // on the side so the operator can re-lock manually.
  if (!reportsPin || !needsPin || unlocked) {
    return (
      <div className="space-y-3">
        {reportsPin && unlocked && needsPin && (
          <div className="flex items-center justify-between rounded-lg border border-[oklch(0.78_0.18_155)]/30 bg-[oklch(0.78_0.18_155)]/8 px-3 py-2 text-[11px]">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-[oklch(0.78_0.18_155)]" />
              Historical reports unlocked for this session.
            </span>
            <button
              type="button"
              onClick={() => {
                lockReports();
                toast.success("Historical reports locked");
              }}
              className="text-[oklch(0.78_0.18_155)] underline-offset-2 hover:underline"
            >
              Lock now
            </button>
          </div>
        )}
        {children}
      </div>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (entered.length !== 4) return;
    if (entered === reportsPin) {
      unlockReports();
      toast.success("Unlocked for this session");
      setEntered("");
    } else {
      setAttempts((a) => a + 1);
      setEntered("");
      toast.error("Incorrect PIN");
    }
  };

  return (
    <Card className="mx-auto max-w-md p-6">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary/60 text-muted-foreground">
          <Lock className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold">Historical reports are locked</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Today&apos;s data is always available, but yesterday and earlier
            require the 4-digit reports PIN you set in{" "}
            <Link
              href={ROUTES.settings}
              className="text-accent underline-offset-2 hover:underline"
            >
              Security settings
            </Link>
            .
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="mt-5 space-y-3">
        <div className="grid gap-1.5">
          <Label htmlFor="reports-pin" className="text-xs">
            Enter reports PIN
          </Label>
          <Input
            id="reports-pin"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={4}
            value={entered}
            onChange={(e) =>
              setEntered(e.target.value.replace(/\D/g, "").slice(0, 4))
            }
            placeholder="••••"
            className={cn(
              "text-center font-mono text-xl tracking-[0.6em]",
              entered.length === 4 && "border-accent/50",
            )}
            autoFocus
          />
          {attempts > 0 && (
            <p className="text-[11px] text-destructive">
              {attempts} incorrect attempt{attempts === 1 ? "" : "s"} this session.
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button type="submit" disabled={entered.length !== 4}>
            Unlock
          </Button>
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel}>
              View today only
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
