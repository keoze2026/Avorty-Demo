"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Building2, Loader2 } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/hooks/use-translation";
import { ROUTES } from "@/lib/constants";
import { useBuyersStore } from "@/lib/store/buyers-store";

export function InviteBuyerDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const add = useBuyersStore((s) => s.add);

  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [bidAmount, setBidAmount] = useState(35);
  const [dailyCap, setDailyCap] = useState(200);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setName(""); setOrganization(""); setContactName(""); setEmail("");
    setBidAmount(35); setDailyCap(200); setDescription(""); setSubmitting(false);
  };
  const onClose = (next: boolean) => {
    onOpenChange(next);
    if (!next) setTimeout(reset, 200);
  };

  const onSubmit = async () => {
    if (!name.trim() || !organization.trim()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 350));
    const created = add({
      name: name.trim(),
      organization: organization.trim(),
      contactName: contactName.trim() || undefined,
      email: email.trim() || undefined,
      description: description.trim() || undefined,
      status: "pending",
      bidAmount,
      payoutModel: "flat",
      concurrencyCap: 10,
      dailyCap,
      monthlyCap: dailyCap * 25,
      callsToday: 0,
      callsMonth: 0,
      spendToday: 0,
      spendMonth: 0,
      lifetimeSpend: 0,
      acceptRate: 0,
      conversionRate: 0,
      campaignIds: [],
    });
    toast.success(t("networkUI.buyers.invite.invited").replace("{name}", created.name), {
      description: t("networkUI.buyers.invite.willAppear"),
    });
    onClose(false);
    router.push(`${ROUTES.buyers}/${created.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[oklch(0.74_0.18_155)]/15 text-[oklch(0.6_0.18_155)] dark:text-[oklch(0.78_0.18_155)]">
              <Building2 className="h-4 w-4" />
            </span>
            <div>
              <DialogTitle>{t("networkUI.buyers.invite.title")}</DialogTitle>
              <DialogDescription>{t("networkUI.buyers.invite.description")}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="ib-name">{t("networkUI.buyers.invite.buyerName")}</Label>
              <Input id="ib-name" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder={t("networkUI.buyers.invite.namePh")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ib-org">{t("networkUI.buyers.invite.organization")}</Label>
              <Input id="ib-org" value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder={t("networkUI.buyers.invite.orgPh")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="ib-contact">{t("networkUI.buyers.invite.contactName")}</Label>
              <Input id="ib-contact" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder={t("networkUI.buyers.invite.contactPh")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ib-email">{t("networkUI.buyers.invite.email")}</Label>
              <Input id="ib-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("networkUI.buyers.invite.emailPh")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="ib-bid">{t("networkUI.buyers.invite.bidPerCall")}</Label>
              <Input
                id="ib-bid"
                type="number"
                min={0}
                step="0.5"
                value={bidAmount}
                onChange={(e) => setBidAmount(parseFloat(e.target.value) || 0)}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ib-cap">{t("networkUI.buyers.invite.dailyCap")}</Label>
              <Input
                id="ib-cap"
                type="number"
                min={0}
                value={dailyCap}
                onChange={(e) => setDailyCap(parseInt(e.target.value) || 0)}
                className="font-mono"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ib-desc">{t("networkUI.buyers.invite.notes")}</Label>
            <Textarea
              id="ib-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("networkUI.buyers.invite.notesPh")}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onClose(false)}>
            {t("networkUI.buyers.invite.cancel")}
          </Button>
          <Button onClick={onSubmit} disabled={submitting || !name.trim() || !organization.trim()}>
            {submitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> {t("networkUI.buyers.invite.sending")}
              </>
            ) : (
              t("networkUI.buyers.invite.send")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
