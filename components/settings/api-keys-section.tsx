"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Eye, EyeOff, KeyRound, Loader2, MoreVertical, Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { SectionShell } from "./profile-section";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatRelativeTime } from "@/lib/format";
import { MOCK_API_KEYS } from "@/lib/mock/settings";
import type { ApiKey, ApiScope } from "@/lib/types";
import { cn } from "@/lib/utils";

const SCOPE_TONE: Record<ApiScope, string> = {
  read: "border-accent/30 bg-accent/10 text-accent",
  write: "border-[oklch(0.6_0.16_75)]/40 bg-[oklch(0.6_0.16_75)]/10 text-[oklch(0.6_0.16_75)] dark:text-[oklch(0.82_0.16_75)]",
  admin: "border-destructive/40 bg-destructive/10 text-destructive",
};

export function ApiKeysSection() {
  const [keys, setKeys] = useState<ApiKey[]>(MOCK_API_KEYS);
  const [createOpen, setCreateOpen] = useState(false);
  const [revealed, setRevealed] = useState<{ id: string; token: string } | null>(null);
  const [revealsExpanded, setRevealsExpanded] = useState<Set<string>>(new Set());
  const [rotating, setRotating] = useState<ApiKey | null>(null);

  const onRotate = (key: ApiKey) => {
    // Generate a new prefix + token; mutate the existing key id in place.
    const tail = Math.random().toString(36).slice(2, 10);
    const prefix = `vx_live_${tail.slice(0, 8)}`;
    const token = `${prefix}${tail.slice(8)}_${Math.random().toString(36).slice(2, 12)}`;
    setKeys((ks) =>
      ks.map((k) =>
        k.id === key.id
          ? { ...k, prefix, createdAt: Date.now(), lastUsedAt: undefined }
          : k,
      ),
    );
    setRotating(null);
    setRevealed({ id: key.id, token });
    toast.success(`Rotated "${key.name}"`, { description: "Previous token is now invalid." });
  };

  const onCreate = (input: { name: string; scopes: ApiScope[] }) => {
    const id = `k_${Math.random().toString(36).slice(2, 8)}`;
    const tail = Math.random().toString(36).slice(2, 10);
    const prefix = `vx_live_${tail.slice(0, 8)}`;
    const token = `${prefix}${tail.slice(8)}_${Math.random().toString(36).slice(2, 12)}`;
    setKeys((ks) => [
      {
        id,
        name: input.name,
        prefix,
        scopes: input.scopes,
        createdAt: Date.now(),
        createdByName: "Avery Quinn",
      },
      ...ks,
    ]);
    setRevealed({ id, token });
  };

  const toggleReveal = (id: string) =>
    setRevealsExpanded((curr) => {
      const next = new Set(curr);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const copyToken = (token: string) => {
    navigator.clipboard?.writeText(token).then(() => toast.success("Copied to clipboard"));
  };

  return (
    <SectionShell
      eyebrow="API keys"
      title="Programmatic access"
      description="Keys authenticate the SDK + REST API. Reveal once on creation — store them somewhere safe."
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-mono text-muted-foreground">
          {keys.length} keys · {keys.filter((k) => k.scopes.includes("admin")).length} admin
        </p>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> New API key
        </Button>
      </div>

      <div className="space-y-2">
        {keys.map((k, i) => (
          <motion.div
            key={k.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03, duration: 0.2 }}
          >
            <Card className="transition-colors hover:border-accent/30">
              <CardContent className="flex flex-wrap items-center gap-3 p-4">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <KeyRound className="h-4 w-4" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{k.name}</span>
                    {k.scopes.map((s) => (
                      <span
                        key={s}
                        className={cn(
                          "rounded-full border px-1.5 py-0 text-[9px] font-mono uppercase tracking-wider",
                          SCOPE_TONE[s],
                        )}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <code className="font-mono text-xs text-muted-foreground">
                      {revealsExpanded.has(k.id) ? k.prefix + "•••••••• (rotate to reveal)" : k.prefix + "•••••"}
                    </code>
                    <button
                      type="button"
                      onClick={() => toggleReveal(k.id)}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label="Toggle reveal"
                    >
                      {revealsExpanded.has(k.id) ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => copyToken(k.prefix)}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label="Copy prefix"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <div className="hidden text-right text-[10px] font-mono uppercase tracking-wider text-muted-foreground sm:block">
                  <div>{k.lastUsedAt ? `Used ${formatRelativeTime(k.lastUsedAt)}` : "Never used"}</div>
                  <div>by {k.createdByName}</div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => setRotating(k)}>
                      <RefreshCw className="h-4 w-4" /> Rotate
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => {
                        setKeys((ks) => ks.filter((x) => x.id !== k.id));
                        toast.success(`Revoked "${k.name}"`);
                      }}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" /> Revoke
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <CreateKeyDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={onCreate} />
      <RevealDialog revealed={revealed} onClose={() => setRevealed(null)} />

      {/* Rotate confirmation */}
      <AlertDialog open={!!rotating} onOpenChange={(o) => !o && setRotating(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <span className="inline-flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-accent" />
                Rotate &ldquo;{rotating?.name}&rdquo;?
              </span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              The current token becomes invalid the moment you confirm. Any service still using
              the old token will start failing. We&apos;ll show the new token once — store it
              somewhere safe.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => rotating && onRotate(rotating)}>
              Rotate now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SectionShell>
  );
}

function CreateKeyDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (input: { name: string; scopes: ApiScope[] }) => void;
}) {
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<Set<ApiScope>>(new Set(["read"]));
  const [submitting, setSubmitting] = useState(false);

  const toggleScope = (s: ApiScope) =>
    setScopes((curr) => {
      const next = new Set(curr);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });

  const reset = () => { setName(""); setScopes(new Set(["read"])); setSubmitting(false); };
  const onClose = (next: boolean) => { onOpenChange(next); if (!next) setTimeout(reset, 200); };

  const onSubmit = async () => {
    if (!name.trim() || scopes.size === 0) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 350));
    onCreate({ name: name.trim(), scopes: [...scopes] });
    onClose(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <KeyRound className="h-4 w-4" />
            </span>
            <div>
              <DialogTitle>Create API key</DialogTitle>
              <DialogDescription>
                Pick a descriptive name and the scopes this key should grant.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-2">
            <Label htmlFor="ck-name">Name</Label>
            <Input
              id="ck-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Production server"
            />
          </div>

          <div className="space-y-2">
            <Label>Scopes</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["read", "write", "admin"] as ApiScope[]).map((s) => {
                const active = scopes.has(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleScope(s)}
                    className={cn(
                      "rounded-md border p-2 text-left text-xs transition-colors",
                      active
                        ? SCOPE_TONE[s]
                        : "border-border bg-secondary/30 text-muted-foreground hover:border-accent/30",
                    )}
                  >
                    <div className="font-mono uppercase tracking-wider">{s}</div>
                    <div className="mt-0.5 text-[10px] opacity-70">
                      {s === "read" && "Read calls, reports, listings"}
                      {s === "write" && "Place bids, edit campaigns"}
                      {s === "admin" && "Manage members + billing"}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onClose(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={submitting || !name.trim()}>
            {submitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Creating…
              </>
            ) : (
              "Create key"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RevealDialog({
  revealed,
  onClose,
}: {
  revealed: { id: string; token: string } | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!revealed} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <KeyRound className="h-4 w-4" />
            </span>
            <div>
              <DialogTitle>Save this key now</DialogTitle>
              <DialogDescription>
                This is the only time we&apos;ll show the full token. Store it in your secret manager.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {revealed && (
          <div className="space-y-3 py-2">
            <div className="rounded-lg border border-accent/40 bg-accent/5 p-3">
              <div className="flex items-center justify-between gap-2">
                <code className="break-all font-mono text-sm">{revealed.token}</code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => {
                    navigator.clipboard?.writeText(revealed.token).then(() =>
                      toast.success("Token copied"),
                    );
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              We hash this token after you close this dialog — it can&apos;t be recovered.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button onClick={onClose}>I&apos;ve saved it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
