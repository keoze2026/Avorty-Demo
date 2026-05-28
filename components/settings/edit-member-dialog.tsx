"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, UserCog } from "lucide-react";

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
import { ROLES_IN_ORDER, ROLE_DESCRIPTIONS } from "@/lib/mock/settings";
import type { Member, MemberRole } from "@/lib/types";

type MemberStatus = Member["status"];

const STATUS_OPTIONS: Array<{ value: MemberStatus; label: string; description: string }> = [
  { value: "active", label: "Active", description: "Has full access to the workspace." },
  { value: "invited", label: "Invited", description: "Setup link sent — pending acceptance." },
  { value: "suspended", label: "Suspended", description: "Access revoked — can't sign in." },
];

interface Props {
  member: Member | null;
  onOpenChange: (open: boolean) => void;
  onSave: (input: {
    id: string;
    name: string;
    email: string;
    role: MemberRole;
    status: MemberStatus;
  }) => void;
}

export function EditMemberDialog({ member, onOpenChange, onSave }: Props) {
  const open = member !== null;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MemberRole>("manager");
  const [status, setStatus] = useState<MemberStatus>("active");
  const [submitting, setSubmitting] = useState(false);

  // Sync local state whenever the dialog opens with a new member.
  useEffect(() => {
    if (member) {
      setName(member.name);
      setEmail(member.email);
      setRole(member.role);
      setStatus(member.status);
      setSubmitting(false);
    }
  }, [member]);

  const onSubmit = async () => {
    if (!member || !name.trim() || !email.trim()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 250));
    onSave({ id: member.id, name: name.trim(), email: email.trim(), role, status });
    toast.success(`Updated ${name.trim()}`);
    onOpenChange(false);
  };

  const statusDescription = STATUS_OPTIONS.find((s) => s.value === status)?.description;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <UserCog className="h-4 w-4" />
            </span>
            <div>
              <DialogTitle>Edit member</DialogTitle>
              <DialogDescription>Update this member&apos;s name, email, or role.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="em-name">Name</Label>
              <Input id="em-name" autoFocus value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="em-email">Email</Label>
              <Input id="em-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as MemberRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES_IN_ORDER.map((r) => (
                    <SelectItem key={r} value={r}>
                      <span className="font-mono capitalize">{r}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground">{ROLE_DESCRIPTIONS[role]}</p>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as MemberStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      <span className="font-mono">{s.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground">{statusDescription}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={submitting || !name.trim() || !email.trim()}>
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
