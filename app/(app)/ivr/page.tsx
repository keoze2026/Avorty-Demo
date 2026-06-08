"use client";

/**
 * IVR Flows — list of automated voice flows attached to campaigns.
 *
 * This is the v1 admin surface: list + create + status badges + delete.
 * The full visual flow builder (drag-and-drop node graph) is a Phase 7
 * concern; today nodes/transitions are managed via the API directly.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Loader2, PhoneForwarded, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { ivrService, type IvrFlow, type IvrFlowStatus } from "@/lib/api/services/ivr.service";
import { useCampaignsStore } from "@/lib/store/campaigns-store";

const STATUS_VARIANT: Record<IvrFlowStatus, "success" | "outline" | "warning"> = {
  active: "success",
  draft: "outline",
  paused: "warning",
};

export default function IvrPage() {
  const campaigns = useCampaignsStore((s) => s.campaigns);
  const [flows, setFlows] = useState<IvrFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const items = await ivrService.listFlows();
        if (!cancelled) setFlows(items);
      } catch (e) {
        if (!cancelled) toast.error(e instanceof Error ? e.message : "Couldn't load flows");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onCreated = (flow: IvrFlow) => {
    setFlows((f) => [flow, ...f]);
    setCreateOpen(false);
  };

  const remove = async (flow: IvrFlow) => {
    const prev = flows;
    setFlows((f) => f.filter((x) => x.id !== flow.id));
    try {
      await ivrService.deleteFlow(flow.id);
      toast.success(`${flow.name} deleted`);
    } catch (e) {
      setFlows(prev);
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  return (
    <>
      <PageHeader
        title="IVR Flows"
        description="Automated voice menus and transfers for inbound calls."
        actions={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> New flow
          </Button>
        }
      />

      {loading ? (
        <Card>
          <CardContent className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading flows…
          </CardContent>
        </Card>
      ) : flows.length === 0 ? (
        <EmptyState
          icon={PhoneForwarded}
          tone="cyan"
          title="No IVR flows yet"
          description="Create your first flow to route inbound calls through a voice menu before they hit a buyer."
          actions={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> New flow
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {flows.map((f) => (
            <Card key={f.id} className="transition-colors hover:border-accent/40">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold">{f.name}</h3>
                    {f.description && (
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {f.description}
                      </p>
                    )}
                  </div>
                  <Badge variant={STATUS_VARIANT[f.status]}>{f.status}</Badge>
                </div>

                <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
                  <dt className="text-muted-foreground">Campaign</dt>
                  <dd className="text-right font-mono">
                    {f.campaignName ?? f.campaignId ?? "—"}
                  </dd>
                  <dt className="text-muted-foreground">Language</dt>
                  <dd className="text-right font-mono">{f.language ?? "en"}</dd>
                  <dt className="text-muted-foreground">Voice</dt>
                  <dd className="text-right font-mono">{f.voice ?? "default"}</dd>
                </dl>

                <div className="flex items-center justify-between border-t border-border/40 pt-2">
                  <Link
                    href={`/ivr/${f.id}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-accent transition-colors hover:underline"
                  >
                    Configure <ExternalLink className="h-3 w-3" />
                  </Link>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    aria-label={`Delete ${f.name}`}
                    onClick={() => remove(f)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateFlowDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        campaigns={campaigns}
        onCreated={onCreated}
      />
    </>
  );
}

function CreateFlowDialog({
  open,
  onOpenChange,
  campaigns,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  campaigns: ReturnType<typeof useCampaignsStore.getState>["campaigns"];
  onCreated: (f: IvrFlow) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [campaignId, setCampaignId] = useState<string>("none");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setName("");
    setDescription("");
    setCampaignId("none");
    setWelcomeMessage("");
  };

  const onClose = (next: boolean) => {
    onOpenChange(next);
    if (!next) setTimeout(reset, 200);
  };

  const onSubmit = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const flow = await ivrService.createFlow({
        name: name.trim(),
        description: description.trim() || undefined,
        campaignId: campaignId !== "none" ? campaignId : undefined,
        welcomeMessage: welcomeMessage.trim() || undefined,
      });
      toast.success(`${flow.name} created`);
      onCreated(flow);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Create failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New IVR flow</DialogTitle>
          <DialogDescription>
            A flow holds the voice menu and transitions a caller goes through before reaching a buyer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="ivr-name">Name</Label>
            <Input
              id="ivr-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ivr-desc">Description</Label>
            <Textarea
              id="ivr-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Campaign (optional)</Label>
            <Select value={campaignId} onValueChange={setCampaignId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— Unassigned —</SelectItem>
                {campaigns.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ivr-welcome">Welcome message</Label>
            <Textarea
              id="ivr-welcome"
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              rows={2}
              placeholder="Thanks for calling. Press 1 for sales…"
            />
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
              "Create flow"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
