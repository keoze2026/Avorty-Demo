"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Hash, Loader2, Plus } from "lucide-react";

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
import { useCampaignsStore } from "@/lib/store/campaigns-store";
import { useNumbersStore } from "@/lib/store/numbers-store";
import type { NumberType } from "@/lib/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATE_OPTIONS = [
  { code: "TX", city: "Austin", area: 512 },
  { code: "CA", city: "Los Angeles", area: 213 },
  { code: "FL", city: "Miami", area: 305 },
  { code: "NY", city: "New York", area: 212 },
  { code: "IL", city: "Chicago", area: 312 },
  { code: "GA", city: "Atlanta", area: 404 },
];

/** Emit E.164 ("+1XXXXXXXXXX") so the rest of the app renders consistently. */
function randomLocalNumber(area: number) {
  const prefix = 200 + Math.floor(Math.random() * 700);
  const line = 1000 + Math.floor(Math.random() * 8999);
  return `+1${area}${prefix}${line}`;
}

function randomTollfree() {
  const prefix = [800, 833, 844, 855, 866, 877, 888][Math.floor(Math.random() * 7)];
  const line = 100000 + Math.floor(Math.random() * 899999);
  return `+1${prefix}${line}`;
}

export function ProvisionNumberDialog({ open, onOpenChange }: Props) {
  const campaigns = useCampaignsStore((s) => s.campaigns);
  const addNumber = useNumbersStore((s) => s.addNumber);

  const [type, setType] = useState<NumberType>("local");
  const [region, setRegion] = useState(STATE_OPTIONS[0].code);
  const [campaignId, setCampaignId] = useState<string>("none");
  const [count, setCount] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setType("local");
    setRegion(STATE_OPTIONS[0].code);
    setCampaignId("none");
    setCount(1);
    setSubmitting(false);
  };

  const onClose = (next: boolean) => {
    onOpenChange(next);
    if (!next) setTimeout(reset, 200);
  };

  const onSubmit = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));
    const region_ = STATE_OPTIONS.find((s) => s.code === region) ?? STATE_OPTIONS[0];
    const campaign = campaignId !== "none" ? campaigns.find((c) => c.id === campaignId) : undefined;

    for (let i = 0; i < count; i++) {
      addNumber({
        number: type === "tollfree" ? randomTollfree() : randomLocalNumber(region_.area),
        type,
        status: "active",
        campaignId: campaign?.id,
        campaignName: campaign?.name,
        state: type === "tollfree" ? undefined : region_.code,
        city: type === "tollfree" ? undefined : region_.city,
        monthlyCost: type === "tollfree" ? 5 : 2,
        callsToday: 0,
        callsMonthly: 0,
        conversionRate: 0,
      });
    }

    toast.success(
      count === 1 ? "Number provisioned" : `${count} numbers provisioned`,
      { description: campaign ? `Attached to ${campaign.name}` : "Sitting unassigned in your inventory." },
    );
    onClose(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <Hash className="h-4 w-4" />
            </span>
            <div>
              <DialogTitle>Provision tracking number</DialogTitle>
              <DialogDescription>
                Pick a type and (optionally) attach it to a campaign.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["local", "tollfree"] as NumberType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    type === t
                      ? "border-accent bg-accent/10"
                      : "border-border bg-secondary/30 hover:border-border/80"
                  }`}
                >
                  <div className="text-sm font-medium capitalize">
                    {t === "tollfree" ? "Toll-free" : "Local"}
                  </div>
                  <div className="mt-0.5 text-[10px] text-muted-foreground">
                    {t === "tollfree" ? "800 / 888 / 877 — $5 / mo" : "Regional area code — $2 / mo"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {type === "local" && (
            <div className="space-y-2">
              <Label>Region</Label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATE_OPTIONS.map((o) => (
                    <SelectItem key={o.code} value={o.code}>
                      {o.city}, {o.code} · ({o.area})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Attach to campaign (optional)</Label>
            <Select value={campaignId} onValueChange={setCampaignId}>
              <SelectTrigger>
                <SelectValue placeholder="Leave unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— Leave unassigned —</SelectItem>
                {campaigns.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prov-count">How many?</Label>
            <Input
              id="prov-count"
              type="number"
              min={1}
              max={20}
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
              className="font-mono"
            />
            <p className="text-[10px] text-muted-foreground">Up to 20 at a time.</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onClose(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Provisioning…
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" /> Provision {count > 1 ? `${count} numbers` : "number"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
