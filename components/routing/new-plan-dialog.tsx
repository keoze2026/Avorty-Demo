"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { GitFork, Loader2 } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ROUTES } from "@/lib/constants";
import { useCampaignsStore } from "@/lib/store/campaigns-store";
import { useRoutingStore } from "@/lib/store/routing-store";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-select a campaign when opening from a campaign context. */
  defaultCampaignId?: string;
}

export function NewPlanDialog({ open, onOpenChange, defaultCampaignId }: Props) {
  const router = useRouter();
  const campaigns = useCampaignsStore((s) => s.campaigns);
  const add = useRoutingStore((s) => s.add);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [campaignId, setCampaignId] = useState<string>(defaultCampaignId ?? "none");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setName("");
    setDescription("");
    setCampaignId(defaultCampaignId ?? "none");
    setSubmitting(false);
  };

  const onClose = (next: boolean) => {
    onOpenChange(next);
    if (!next) setTimeout(reset, 200);
  };

  const onSubmit = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 300));
    const campaign = campaignId !== "none" ? campaigns.find((c) => c.id === campaignId) : undefined;
    const created = add({
      name: name.trim(),
      description: description.trim() || undefined,
      campaignId: campaign?.id,
      campaignName: campaign?.name,
      status: "draft",
      nodes: [
        {
          id: "n_inbound",
          type: "inbound",
          position: { x: 80, y: 200 },
          data: { kind: "inbound", inbound: { campaignId: campaign?.id } },
        },
      ],
      edges: [],
    });
    toast.success(`Plan "${created.name}" created`);
    onClose(false);
    router.push(`${ROUTES.routing}/${created.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <GitFork className="h-4 w-4" />
            </span>
            <div>
              <DialogTitle>New routing plan</DialogTitle>
              <DialogDescription>Starts with an empty canvas ready to build.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-2">
            <Label htmlFor="plan-name">Name</Label>
            <Input
              id="plan-name"
              autoFocus
              placeholder="e.g. Health — Q3 routing"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Campaign (optional)</Label>
            <Select value={campaignId} onValueChange={setCampaignId}>
              <SelectTrigger>
                <SelectValue placeholder="Unbound plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— Unbound —</SelectItem>
                {campaigns.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="plan-desc">Description</Label>
            <Textarea
              id="plan-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this plan do?"
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
              "Create plan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
