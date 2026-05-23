"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    await new Promise((r) => setTimeout(r, 600));
    setPending(false);
    setSent(true);
    toast.success("If an account exists for that email, a reset link is on its way.");
  };

  if (sent) {
    return (
      <div className="rounded-lg border border-border/60 bg-secondary/30 p-4 text-center text-sm text-muted-foreground">
        Check your inbox at <span className="font-mono text-foreground">{email}</span> for the reset link.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Sending…
          </>
        ) : (
          <>
            Send reset link <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}
