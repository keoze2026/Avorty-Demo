"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Eye, EyeOff, KeyRound, Loader2, MoreVertical, Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { SectionShell } from "./profile-section";
import { useTranslation } from "@/hooks/use-translation";
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
  write: "border-[color:var(--warning)]/40 bg-[color:var(--warning)]/10 text-[color:var(--warning)]",
  admin: "border-destructive/40 bg-destructive/10 text-destructive",
};

export function ApiKeysSection() {
  const { t } = useTranslation();
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
    toast.success(t("workspaceUI.apiKeys.rotated").replace("{name}", key.name), {
      description: t("workspaceUI.apiKeys.rotatedDescription"),
    });
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
    navigator.clipboard?.writeText(token).then(() => toast.success(t("workspaceUI.apiKeys.copied")));
  };

  return (
    <SectionShell
      eyebrow={t("settings.apiKeysSection.eyebrow")}
      title={t("settings.apiKeysSection.title")}
      description={t("settings.apiKeysSection.description")}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-mono text-muted-foreground">
          {t("workspaceUI.apiKeys.countSummary")
            .replace("{total}", String(keys.length))
            .replace("{admin}", String(keys.filter((k) => k.scopes.includes("admin")).length))}
        </p>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> {t("workspaceUI.apiKeys.newKey")}
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
                      aria-label={t("workspaceUI.apiKeys.toggleReveal")}
                    >
                      {revealsExpanded.has(k.id) ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => copyToken(k.prefix)}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label={t("workspaceUI.apiKeys.copyPrefix")}
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <div className="hidden text-right text-[10px] font-mono uppercase tracking-wider text-muted-foreground sm:block">
                  <div>
                    {k.lastUsedAt
                      ? t("workspaceUI.apiKeys.usedRelative").replace("{time}", formatRelativeTime(k.lastUsedAt))
                      : t("workspaceUI.apiKeys.neverUsed")}
                  </div>
                  <div>{t("workspaceUI.apiKeys.byUser").replace("{name}", k.createdByName ?? "")}</div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={t("workspaceUI.apiKeys.keyActions")}>
                      <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => setRotating(k)}>
                      <RefreshCw className="h-4 w-4" /> {t("workspaceUI.apiKeys.menuRotate")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => {
                        setKeys((ks) => ks.filter((x) => x.id !== k.id));
                        toast.success(t("workspaceUI.apiKeys.revoked").replace("{name}", k.name));
                      }}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" /> {t("workspaceUI.apiKeys.menuRevoke")}
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
                {t("workspaceUI.apiKeys.rotateConfirmTitle").replace("{name}", rotating?.name ?? "")}
              </span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("workspaceUI.apiKeys.rotateConfirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("workspaceUI.apiKeys.rotateCancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => rotating && onRotate(rotating)}>
              {t("workspaceUI.apiKeys.rotateNow")}
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
  const { t } = useTranslation();
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
              <DialogTitle>{t("workspaceUI.apiKeys.create.title")}</DialogTitle>
              <DialogDescription>
                {t("workspaceUI.apiKeys.create.description")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-2">
            <Label htmlFor="ck-name">{t("workspaceUI.apiKeys.create.nameLabel")}</Label>
            <Input
              id="ck-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("workspaceUI.apiKeys.create.namePlaceholder")}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("workspaceUI.apiKeys.create.scopesLabel")}</Label>
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
                      {s === "read" && t("workspaceUI.apiKeys.create.readDescription")}
                      {s === "write" && t("workspaceUI.apiKeys.create.writeDescription")}
                      {s === "admin" && t("workspaceUI.apiKeys.create.adminDescription")}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onClose(false)}>
            {t("workspaceUI.apiKeys.create.cancel")}
          </Button>
          <Button onClick={onSubmit} disabled={submitting || !name.trim()}>
            {submitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> {t("workspaceUI.apiKeys.create.creating")}
              </>
            ) : (
              t("workspaceUI.apiKeys.create.submit")
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
  const { t } = useTranslation();
  return (
    <Dialog open={!!revealed} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <KeyRound className="h-4 w-4" />
            </span>
            <div>
              <DialogTitle>{t("workspaceUI.apiKeys.reveal.title")}</DialogTitle>
              <DialogDescription>
                {t("workspaceUI.apiKeys.reveal.description")}
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
                      toast.success(t("workspaceUI.apiKeys.tokenCopied")),
                    );
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {t("workspaceUI.apiKeys.reveal.warning")}
            </p>
          </div>
        )}

        <DialogFooter>
          <Button onClick={onClose}>{t("workspaceUI.apiKeys.reveal.confirm")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
