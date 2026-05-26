"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Footer newsletter form — kept as its own client component so the parent
 * footer can stay a server component.
 */
export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (sending || !email) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 500));
    setSending(false);
    setDone(true);
    setEmail("");
    setTimeout(() => setDone(false), 4000);
  };

  return (
    <form className="mt-6 flex max-w-sm flex-col gap-2 sm:flex-row" onSubmit={onSubmit}>
      <div className="relative flex-1">
        <Mail className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@network.com"
          className="h-10 pl-8 backdrop-blur"
          aria-label="Email"
          disabled={sending || done}
        />
      </div>
      <Button
        type="submit"
        size="default"
        className="h-10 shrink-0 whitespace-nowrap font-semibold"
        disabled={sending || done}
      >
        {sending ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> …
          </>
        ) : done ? (
          "Subscribed ✓"
        ) : (
          "Get updates"
        )}
      </Button>
    </form>
  );
}
