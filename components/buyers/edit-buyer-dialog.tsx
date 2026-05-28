"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Pencil } from "lucide-react";

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
import { useBuyersStore } from "@/lib/store/buyers-store";

interface EditBuyerDialogProps {
  /** The buyer to edit. `null` keeps the dialog closed. */
  buyerId: string | null;
  onOpenChange: (open: boolean) => void;
}

export function EditBuyerDialog({ buyerId, onOpenChange }: EditBuyerDialogProps) {
  const buyers = useBuyersStore((s) => s.buyers);
  const update = useBuyersStore((s) => s.update);

  const buyer = buyerId ? buyers.find((b) => b.id === buyerId) : null;

  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [bidAmount, setBidAmount] = useState(35);
  const [dailyCap, setDailyCap] = useState(200);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Sync local form state when a new buyer is selected
  useEffect(() => {
    if (!buyer) return;
    setName(buyer.name);
    setOrganization(buyer.organization);
    setContactName(buyer.contactName ?? "");
    setEmail(buyer.email ?? "");
    setBidAmount(buyer.bidAmount);
    setDailyCap(buyer.dailyCap);
    setDescription(buyer.description ?? "");
  }, [buyer]);

  const onSubmit = async () => {
    if (!buyer || !name.trim() || !organization.trim()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 250));
    update(buyer.id, {
      name: name.trim(),
      organization: organization.trim(),
      contactName: contactName.trim() || undefined,
      email: email.trim() || undefined,
      description: description.trim() || undefined,
      bidAmount,
      dailyCap,
      monthlyCap: dailyCap * 25,
    });
    setSubmitting(false);
    toast.success(`${name.trim()} updated`);
    onOpenChange(false);
  };

  return (
    <Dialog open={!!buyer} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <Pencil className="h-4 w-4" />
            </span>
            <div>
              <DialogTitle>Edit buyer</DialogTitle>
              <DialogDescription>Update the buyer&apos;s details.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="eb-name">Buyer name</Label>
              <Input id="eb-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eb-org">Organization</Label>
              <Input
                id="eb-org"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="eb-contact">Contact name</Label>
              <Input
                id="eb-contact"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eb-email">Email</Label>
              <Input
                id="eb-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="eb-bid">Bid per call ($)</Label>
              <Input
                id="eb-bid"
                type="number"
                min={0}
                step="0.5"
                value={bidAmount}
                onChange={(e) => setBidAmount(parseFloat(e.target.value) || 0)}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eb-cap">Daily cap</Label>
              <Input
                id="eb-cap"
                type="number"
                min={0}
                value={dailyCap}
                onChange={(e) => setDailyCap(parseInt(e.target.value) || 0)}
                className="font-mono"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="eb-desc">Notes</Label>
            <Textarea
              id="eb-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Vertical, geo, anything routing-affecting."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={submitting || !name.trim() || !organization.trim()}
          >
            {submitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
