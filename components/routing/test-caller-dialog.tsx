"use client";

/**
 * Test caller dialog — POST /api/routing/rules/{id}/simulate.
 *
 * The operator types a caller number (and optionally a state / country) and
 * the dialog returns which conditions matched, which destination would be
 * picked, and a step-by-step trace. Used for QA the live graph before
 * publishing a rule change.
 */

import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Hash,
  Loader2,
  Phone,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { friendlyErrorMessage } from "@/lib/api/errors";
import {
  routingService,
  type SimulateResult,
} from "@/lib/api/services/routing.service";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ruleId: string;
  ruleName: string;
}

export function TestCallerDialog({ open, onOpenChange, ruleId, ruleName }: Props) {
  const [callerNumber, setCallerNumber] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<SimulateResult | null>(null);

  // Reset transient state every time the dialog reopens so a fresh test
  // doesn't show a previous run's trace.
  useEffect(() => {
    if (!open) return;
    setCallerNumber("");
    setState("");
    setCountry("");
    setResult(null);
    setRunning(false);
  }, [open]);

  const canRun = callerNumber.trim().length > 0 && !running;

  const onRun = async () => {
    if (!canRun) return;
    setRunning(true);
    setResult(null);
    try {
      const r = await routingService.simulate(ruleId, {
        callerNumber: callerNumber.trim(),
        callerState: state.trim() || undefined,
        callerCountry: country.trim() || undefined,
      });
      setResult(r);
    } catch (e) {
      toast.error(friendlyErrorMessage(e, "Simulation failed"));
    } finally {
      setRunning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <Phone className="h-4 w-4" />
            </span>
            <div>
              <DialogTitle>Test caller</DialogTitle>
              <DialogDescription>
                Walk a hypothetical inbound call through{" "}
                <span className="font-medium text-foreground">{ruleName}</span> — without affecting live traffic.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.5fr_1fr_1fr]">
            <div className="space-y-1.5">
              <Label htmlFor="sim-num">Caller number (E.164)</Label>
              <Input
                id="sim-num"
                autoFocus
                value={callerNumber}
                onChange={(e) => setCallerNumber(e.target.value)}
                placeholder="+15125551234"
                className="font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sim-state">Caller state</Label>
              <Input
                id="sim-state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="TX"
                maxLength={2}
                className="uppercase"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sim-country">Country</Label>
              <Input
                id="sim-country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="US"
                maxLength={2}
                className="uppercase"
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <Button onClick={onRun} disabled={!canRun} size="sm">
              {running ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Running…
                </>
              ) : (
                <>
                  <Phone className="h-3.5 w-3.5" /> Run simulation
                </>
              )}
            </Button>
          </div>

          {result && (
            <div className="space-y-4 border-t border-border/60 pt-4">
              {/* Selected destination — the headline outcome */}
              <ResultSection title="Selected destination">
                {result.selectedDestination ? (
                  <div className="rounded-lg border border-[color:var(--success)]/40 bg-[color:var(--success)]/10 p-3">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <CheckCircle2 className="h-4 w-4 text-[color:var(--success)]" />
                      {result.selectedDestination.name}
                    </div>
                    <div className="mt-1 grid grid-cols-3 gap-2 text-[11px] text-muted-foreground">
                      <span>
                        <span className="font-mono uppercase tracking-wider">Buyer</span>{" "}
                        <span className="text-foreground">{result.selectedDestination.buyerName}</span>
                      </span>
                      <span>
                        <span className="font-mono uppercase tracking-wider">Priority</span>{" "}
                        <span className="text-foreground tabular-nums">{result.selectedDestination.priority}</span>
                      </span>
                      <span>
                        <span className="font-mono uppercase tracking-wider">Weight</span>{" "}
                        <span className="text-foreground tabular-nums">{result.selectedDestination.weight}</span>
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
                    <div className="inline-flex items-center gap-2 font-semibold text-destructive">
                      <XCircle className="h-4 w-4" /> No destination selected
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Trace below shows where the call dropped out.
                    </p>
                  </div>
                )}
              </ResultSection>

              {/* Conditions — which rule conditions matched */}
              <ResultSection title="Matched conditions">
                {result.matchedConditions.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No conditions evaluated.</p>
                ) : (
                  <ul className="grid grid-cols-1 gap-1.5">
                    {result.matchedConditions.map((c) => (
                      <li
                        key={c.conditionId}
                        className={cn(
                          "flex items-center gap-2 rounded border px-2.5 py-1.5 font-mono text-[11px]",
                          c.matched
                            ? "border-[color:var(--success)]/30 bg-[color:var(--success)]/10"
                            : "border-border/60 bg-secondary/30 text-muted-foreground",
                        )}
                      >
                        {c.matched ? (
                          <CheckCircle2 className="h-3 w-3 text-[color:var(--success)]" />
                        ) : (
                          <XCircle className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span className="truncate">{c.conditionId}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </ResultSection>

              {/* Trace — step-by-step walkthrough */}
              <ResultSection title="Trace">
                {result.trace.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No trace returned.</p>
                ) : (
                  <ol className="space-y-1">
                    {result.trace.map((s, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 rounded border border-border/60 bg-secondary/30 px-2.5 py-1.5"
                      >
                        <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] tabular-nums">
                          {i + 1}
                        </span>
                        <span className="font-mono text-[11px] text-foreground">{s.step}</span>
                        <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                        <span className="text-[11px] text-muted-foreground">{s.outcome}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </ResultSection>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ResultSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Hash className="h-3 w-3" />
        {title}
      </div>
      {children}
    </div>
  );
}
