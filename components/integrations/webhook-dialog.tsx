"use client";

/**
 * Add / edit a webhook endpoint.
 * Used by both the "Add webhook" header button and the per-webhook
 * "Configure" menu item.
 */

import { useEffect, useMemo, useState } from "react";
import { Copy, Loader2, Plus, RefreshCw, Trash2, Webhook as WebhookIcon, Zap } from "lucide-react";
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
import type { Webhook } from "@/lib/types";
import { cn } from "@/lib/utils";

const EVENT_CATALOG = [
  { key: "call.completed", description: "Settled call (pays out)" },
  { key: "call.qualified", description: "Passed qualify duration" },
  { key: "call.rejected", description: "Buyer rejected" },
  { key: "buyer.capped", description: "Buyer hit a cap" },
  { key: "publisher.spike", description: "Publisher volume spike" },
  { key: "bid.placed", description: "New marketplace bid" },
];

export interface WebhookDraft {
  name: string;
  url: string;
  events: string[];
  secret: string;
  headers: Array<{ k: string; v: string }>;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pass an existing webhook to edit; omit / null for "create new". */
  initial?: Webhook | null;
  onSave: (input: WebhookDraft, originalId?: string) => void;
}

function randomSecret() {
  const b64 = (s: string) =>
    typeof window === "undefined"
      ? Buffer.from(s).toString("hex")
      : Array.from(crypto.getRandomValues(new Uint8Array(24)))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
  return `whsec_${b64("seed").slice(0, 32)}`;
}

export function WebhookDialog({ open, onOpenChange, initial, onSave }: Props) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [headers, setHeaders] = useState<Array<{ k: string; v: string }>>([]);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  // Seed defaults each time we open
  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setUrl(initial?.url ?? "");
    setSecret(randomSecret());
    setSelectedEvents(new Set(initial?.events ?? ["call.completed"]));
    setHeaders([]);
    setTesting(false);
    setSaving(false);
  }, [open, initial]);

  const isEdit = !!initial;
  const canSubmit = useMemo(() => {
    if (!name.trim() || !url.trim() || selectedEvents.size === 0) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, [name, url, selectedEvents]);

  const toggleEvent = (k: string) =>
    setSelectedEvents((curr) => {
      const next = new Set(curr);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });

  const onTest = async () => {
    if (!canSubmit) {
      toast.error("Add a valid URL + at least one event first");
      return;
    }
    setTesting(true);
    await new Promise((r) => setTimeout(r, 700));
    setTesting(false);
    toast.success("Test event delivered", {
      description: `${url} responded 200 · ${80 + Math.floor(Math.random() * 80)}ms`,
    });
  };

  const onSubmit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));
    onSave(
      {
        name: name.trim(),
        url: url.trim(),
        events: [...selectedEvents],
        secret,
        headers: headers.filter((h) => h.k.trim() && h.v.trim()),
      },
      initial?.id,
    );
    setSaving(false);
    toast.success(isEdit ? "Webhook updated" : "Webhook created");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <WebhookIcon className="h-4 w-4" />
            </span>
            <div>
              <DialogTitle>{isEdit ? "Edit webhook" : "Add webhook"}</DialogTitle>
              <DialogDescription>
                Vortyx posts a JSON payload to your URL for each selected event.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_2fr]">
            <div className="space-y-2">
              <Label htmlFor="wh-name">Name</Label>
              <Input
                id="wh-name"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="CRM postback"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wh-url">URL</Label>
              <Input
                id="wh-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/vortyx/events"
                className="font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Events</Label>
            <div className="grid gap-1.5">
              {EVENT_CATALOG.map((e) => {
                const on = selectedEvents.has(e.key);
                return (
                  <button
                    key={e.key}
                    type="button"
                    onClick={() => toggleEvent(e.key)}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-left text-xs transition-colors",
                      on
                        ? "border-accent/40 bg-accent/8 text-foreground"
                        : "border-border bg-secondary/30 text-muted-foreground hover:border-accent/30",
                    )}
                  >
                    <div className="min-w-0">
                      <div className="font-mono">{e.key}</div>
                      <div className="mt-0.5 text-[10px] text-muted-foreground">{e.description}</div>
                    </div>
                    <span
                      className={cn(
                        "inline-flex h-4 w-4 items-center justify-center rounded-sm border",
                        on ? "border-accent bg-accent/30 text-accent" : "border-border",
                      )}
                    >
                      {on && "✓"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wh-secret">Signing secret</Label>
            <div className="flex gap-2">
              <Input id="wh-secret" value={secret} readOnly className="font-mono text-xs" />
              <Button
                variant="outline"
                size="icon"
                aria-label="Copy secret"
                onClick={() => {
                  navigator.clipboard?.writeText(secret).then(() => toast.success("Secret copied"));
                }}
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Regenerate secret"
                onClick={() => setSecret(randomSecret())}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Verify the <span className="font-mono text-foreground">X-Vortyx-Signature</span> header
              on your endpoint using HMAC-SHA256.
            </p>
          </div>

          {/* Optional headers */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Custom headers (optional)</Label>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setHeaders((h) => [...h, { k: "", v: "" }])}
              >
                <Plus className="h-3 w-3" /> Add header
              </Button>
            </div>
            {headers.length === 0 ? (
              <p className="rounded-md border border-dashed border-border/60 bg-secondary/30 px-2 py-1.5 text-[10px] text-muted-foreground">
                None. Add e.g. an Authorization or X-Source header.
              </p>
            ) : (
              <div className="space-y-1.5">
                {headers.map((h, i) => (
                  <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2">
                    <Input
                      placeholder="Header"
                      value={h.k}
                      onChange={(e) =>
                        setHeaders((hs) => hs.map((x, j) => (j === i ? { ...x, k: e.target.value } : x)))
                      }
                      className="font-mono text-xs"
                    />
                    <Input
                      placeholder="Value"
                      value={h.v}
                      onChange={(e) =>
                        setHeaders((hs) => hs.map((x, j) => (j === i ? { ...x, v: e.target.value } : x)))
                      }
                      className="font-mono text-xs"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-destructive"
                      onClick={() => setHeaders((hs) => hs.filter((_, j) => j !== i))}
                      aria-label="Remove header"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="!justify-between">
          <Button variant="outline" size="sm" onClick={onTest} disabled={testing || !canSubmit}>
            {testing ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" /> Testing…
              </>
            ) : (
              <>
                <Zap className="h-3 w-3" /> Send test event
              </>
            )}
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={onSubmit} disabled={!canSubmit || saving}>
              {saving ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" /> Saving…
                </>
              ) : isEdit ? (
                "Save changes"
              ) : (
                "Create webhook"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
