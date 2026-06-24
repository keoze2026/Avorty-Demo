"use client";

/**
 * Workspace danger-zone "Contact support" dialog.
 *
 * The Transfer-ownership and Delete-workspace flows are locked behind a
 * support hand-off so attackers can't perform them silently after a
 * compromised account / fresh KYC. This dialog gathers a short reason and
 * creates a real support session via POST /api/support/chat — the admin
 * team sees a Telegram ping with the request and reaches back out by email.
 *
 * Replaces the previous "toast.success(supportRequested)" placeholder,
 * which only pretended to file a ticket.
 */

import { useEffect, useState } from "react";
import { Loader2, Mail, ShieldCheck } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { friendlyErrorMessage } from "@/lib/api/errors";
import { supportService } from "@/lib/api/services/support.service";
import { useAuthStore } from "@/lib/store/auth-store";

export type SupportTopic = "transfer-ownership" | "delete-workspace";

const TOPIC_INTRO: Record<SupportTopic, string> = {
  "transfer-ownership":
    "I would like to transfer ownership of my workspace. Please walk me through the verification steps.",
  "delete-workspace":
    "I would like to delete my workspace. Please confirm the consequences and walk me through the verification steps.",
};

const TOPIC_LABEL: Record<SupportTopic, string> = {
  "transfer-ownership": "Transfer ownership",
  "delete-workspace": "Delete workspace",
};

interface Props {
  topic: SupportTopic | null;
  onOpenChange: (open: boolean) => void;
}

export function WorkspaceSupportRequestDialog({ topic, onOpenChange }: Props) {
  const user = useAuthStore((s) => s.user);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!topic) return;
    setMessage(TOPIC_INTRO[topic]);
    setSubmitting(false);
  }, [topic]);

  const onSubmit = async () => {
    if (!topic || !user) return;
    const trimmed = message.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      const result = await supportService.startChat({
        name: user.name,
        email: user.email,
        message: `[${TOPIC_LABEL[topic]}] ${trimmed}`,
      });
      toast.success("Support request opened", {
        description: result.sessionId
          ? `Reference: ${result.sessionId}. We'll reply by email.`
          : "We'll reply by email.",
      });
      onOpenChange(false);
    } catch (e) {
      toast.error(friendlyErrorMessage(e, "Couldn't open support request"));
    } finally {
      setSubmitting(false);
    }
  };

  const open = !!topic;
  const title = topic ? TOPIC_LABEL[topic] : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/15 text-destructive">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>
                Destructive workspace actions require a verified support
                hand-off. We'll reach back out at{" "}
                <span className="font-mono text-foreground">
                  {user?.email ?? "your email on file"}
                </span>
                .
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="ws-support-message">Message to support</Label>
            <Textarea
              id="ws-support-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              autoFocus
            />
            <p className="text-[11px] text-muted-foreground">
              Tell us anything relevant: target user for ownership transfer,
              urgency, business reason. Include nothing sensitive — keep
              passwords and tokens out of the message.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          <p className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Mail className="h-3 w-3" />
            Reply lands in your inbox, typically within one business day.
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={onSubmit} disabled={submitting || !message.trim() || !user}>
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Sending…
                </>
              ) : (
                "Send to support"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
