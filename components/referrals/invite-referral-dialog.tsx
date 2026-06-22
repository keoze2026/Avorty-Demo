"use client";

/**
 * Invite dialog for the Referral Program — collects name + email, POSTs to
 * /api/referrals/invite, surfaces success/error via toast.
 *
 * Used by the Email Contact button on the Referrals page. Previously this
 * button just fired a "coming soon" toast; with the backend's POST
 * /api/referrals/invite endpoint live, it now sends an actual invite.
 */

import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
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
import { friendlyErrorMessage } from "@/lib/api/errors";
import { referralsService } from "@/lib/api/services/referrals.service";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EMAIL_RX = /^\S+@\S+\.\S+$/;

export function InviteReferralDialog({ open, onOpenChange }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setName("");
    setEmail("");
    setSubmitting(false);
  };

  const onClose = (next: boolean) => {
    onOpenChange(next);
    if (!next) setTimeout(reset, 200);
  };

  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const emailLooksValid = EMAIL_RX.test(trimmedEmail);
  const canSubmit = trimmedName.length > 0 && emailLooksValid;

  const onSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await referralsService.sendInvite({ name: trimmedName, email: trimmedEmail });
      toast.success(`Invite sent to ${trimmedEmail}`);
      onClose(false);
    } catch (e) {
      toast.error(friendlyErrorMessage(e, "Couldn't send invite — please try again"));
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
              <Mail className="h-4 w-4" />
            </span>
            <div>
              <DialogTitle>Invite a contact</DialogTitle>
              <DialogDescription>
                We&apos;ll email them a personalized referral link tied to your code.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-2">
            <Label htmlFor="ref-name">Name</Label>
            <Input
              id="ref-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Chen"
              onKeyDown={(e) => {
                if (e.key === "Enter") void onSubmit();
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ref-email">Email</Label>
            <Input
              id="ref-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@company.com"
              aria-invalid={email.length > 0 && !emailLooksValid ? true : undefined}
              onKeyDown={(e) => {
                if (e.key === "Enter") void onSubmit();
              }}
            />
            {email.length > 0 && !emailLooksValid && (
              <p className="text-xs text-destructive">
                Please enter a valid email address.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onClose(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={submitting || !canSubmit}>
            {submitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Sending…
              </>
            ) : (
              "Send invite"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
