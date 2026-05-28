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
import { usePublishersStore } from "@/lib/store/publishers-store";

interface EditPublisherDialogProps {
  /** The publisher to edit. `null` keeps the dialog closed. */
  publisherId: string | null;
  onOpenChange: (open: boolean) => void;
}

export function EditPublisherDialog({ publisherId, onOpenChange }: EditPublisherDialogProps) {
  const publishers = usePublishersStore((s) => s.publishers);
  const update = usePublishersStore((s) => s.update);

  const publisher = publisherId ? publishers.find((p) => p.id === publisherId) : null;

  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [payoutRate, setPayoutRate] = useState(65);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Sync local form state when a new publisher is selected
  useEffect(() => {
    if (!publisher) return;
    setName(publisher.name);
    setOrganization(publisher.organization);
    setContactName(publisher.contactName ?? "");
    setEmail(publisher.email ?? "");
    setPayoutRate(Math.round(publisher.payoutRate * 100));
    setDescription(publisher.description ?? "");
  }, [publisher]);

  const onSubmit = async () => {
    if (!publisher || !name.trim() || !organization.trim()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 250));
    update(publisher.id, {
      name: name.trim(),
      organization: organization.trim(),
      contactName: contactName.trim() || undefined,
      email: email.trim() || undefined,
      description: description.trim() || undefined,
      payoutRate: payoutRate / 100,
    });
    setSubmitting(false);
    toast.success(`${name.trim()} updated`);
    onOpenChange(false);
  };

  return (
    <Dialog open={!!publisher} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <Pencil className="h-4 w-4" />
            </span>
            <div>
              <DialogTitle>Edit publisher</DialogTitle>
              <DialogDescription>Update the publisher&apos;s details.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="ep-name">Publisher name</Label>
              <Input id="ep-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ep-org">Organization</Label>
              <Input
                id="ep-org"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="ep-contact">Contact name</Label>
              <Input
                id="ep-contact"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ep-email">Email</Label>
              <Input
                id="ep-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ep-rate">Payout rate (%)</Label>
            <Input
              id="ep-rate"
              type="number"
              min={0}
              max={100}
              value={payoutRate}
              onChange={(e) =>
                setPayoutRate(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))
              }
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Share of buyer payout passed through to this publisher.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ep-desc">Notes</Label>
            <Textarea
              id="ep-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Traffic channels, verticals, anything routing-affecting."
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
