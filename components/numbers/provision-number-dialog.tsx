"use client";

import * as React from "react";
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
import { useTranslation } from "@/hooks/use-translation";
import { useCampaignsStore } from "@/lib/store/campaigns-store";
import { useNumbersStore } from "@/lib/store/numbers-store";
import type { NumberType } from "@/lib/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * When set, the provisioned number(s) are auto-attached to this campaign and
   * the campaign picker is hidden. Used by the Campaign → Settings → Tracking
   * Numbers section so the user doesn't have to re-pick the campaign they're
   * already editing.
   */
  lockedCampaignId?: string;
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

export function ProvisionNumberDialog({ open, onOpenChange, lockedCampaignId }: Props) {
  const { t } = useTranslation();
  const campaigns = useCampaignsStore((s) => s.campaigns);
  const addNumber = useNumbersStore((s) => s.addNumber);
  const lockedCampaign =
    lockedCampaignId ? campaigns.find((c) => c.id === lockedCampaignId) : undefined;

  const [type, setType] = useState<NumberType>("local");
  const [region, setRegion] = useState(STATE_OPTIONS[0].code);
  // When a campaign is locked in, force the picker value; otherwise default
  // to "none" so the user can attach manually.
  const [campaignId, setCampaignId] = useState<string>(lockedCampaignId ?? "none");
  const [count, setCount] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Keep the internal selection in sync if the parent swaps which campaign
  // is locked (e.g. user navigates between campaign detail pages without
  // unmounting this dialog).
  React.useEffect(() => {
    if (lockedCampaignId) setCampaignId(lockedCampaignId);
  }, [lockedCampaignId]);

  const reset = () => {
    setType("local");
    setRegion(STATE_OPTIONS[0].code);
    setCampaignId(lockedCampaignId ?? "none");
    setCount(1);
    setSubmitting(false);
  };

  const onClose = (next: boolean) => {
    onOpenChange(next);
    if (!next) setTimeout(reset, 200);
  };

  const onSubmit = async () => {
    setSubmitting(true);
    const region_ = STATE_OPTIONS.find((s) => s.code === region) ?? STATE_OPTIONS[0];
    const campaign = campaignId !== "none" ? campaigns.find((c) => c.id === campaignId) : undefined;

    try {
      // Sequentially provision via the backend — `addNumber` calls
      // POST /api/numbers/purchase under the hood and patches the store.
      for (let i = 0; i < count; i++) {
        await addNumber({
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
        count === 1
          ? t("trafficUI.numbers.provision.toast.one")
          : t("trafficUI.numbers.provision.toast.many").replace("{count}", String(count)),
        {
          description: campaign
            ? t("trafficUI.numbers.provision.toast.attachedTo").replace("{name}", campaign.name)
            : t("trafficUI.numbers.provision.toast.unattached"),
        },
      );
      onClose(false);
    } catch (e) {
      // Surface the backend failure so users don't see a silent "nothing happened".
      toast.error(e instanceof Error ? e.message : "Failed to provision number");
    } finally {
      setSubmitting(false);
    }
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
              <DialogTitle>{t("trafficUI.numbers.provision.title")}</DialogTitle>
              <DialogDescription>
                {t("trafficUI.numbers.provision.description")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>{t("trafficUI.numbers.provision.type")}</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["local", "tollfree"] as NumberType[]).map((nt) => (
                <button
                  key={nt}
                  type="button"
                  onClick={() => setType(nt)}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    type === nt
                      ? "border-accent bg-accent/10"
                      : "border-border bg-secondary/30 hover:border-border/80"
                  }`}
                >
                  <div className="text-sm font-medium capitalize">
                    {nt === "tollfree" ? t("trafficUI.numbers.provision.tollfree") : t("trafficUI.numbers.provision.local")}
                  </div>
                  <div className="mt-0.5 text-[10px] text-muted-foreground">
                    {nt === "tollfree" ? t("trafficUI.numbers.provision.tollfreeHint") : t("trafficUI.numbers.provision.localHint")}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {type === "local" && (
            <div className="space-y-2">
              <Label>{t("trafficUI.numbers.provision.region")}</Label>
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

          {lockedCampaign ? (
            // Campaign is fixed by the caller (e.g. Campaign → Settings →
            // Tracking Numbers section). Render a static hint instead of a
            // picker so the user understands what they're about to do.
            <div className="space-y-2">
              <Label>{t("trafficUI.numbers.provision.attachCampaign")}</Label>
              <div className="flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-xs">
                <Hash className="h-3.5 w-3.5 shrink-0 text-accent" />
                <span className="font-medium text-foreground">{lockedCampaign.name}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>{t("trafficUI.numbers.provision.attachCampaign")}</Label>
              <Select value={campaignId} onValueChange={setCampaignId}>
                <SelectTrigger>
                  <SelectValue placeholder={t("trafficUI.numbers.provision.leaveUnassigned")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("trafficUI.numbers.provision.leaveUnassignedItem")}</SelectItem>
                  {campaigns.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="prov-count">{t("trafficUI.numbers.provision.howMany")}</Label>
            <Input
              id="prov-count"
              type="number"
              min={1}
              max={20}
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
              className="font-mono"
            />
            <p className="text-[10px] text-muted-foreground">{t("trafficUI.numbers.provision.upTo")}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onClose(false)}>
            {t("trafficUI.common.cancel")}
          </Button>
          <Button onClick={onSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> {t("trafficUI.numbers.provision.provisioning")}
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" /> {count > 1 ? t("trafficUI.numbers.provision.provisionMany").replace("{count}", String(count)) : t("trafficUI.numbers.provision.provisionOne")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
