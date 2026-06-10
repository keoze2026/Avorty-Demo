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
import { ROLES_IN_ORDER } from "@/lib/mock/settings";
import type { Member, MemberRole } from "@/lib/types";
import { useTranslation } from "@/hooks/use-translation";

type MemberStatus = Member["status"];

const STATUS_VALUES: MemberStatus[] = ["active", "suspended"];

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
  const { t } = useTranslation();
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
    toast.success(t("workspaceUI.editMember.updated").replace("{name}", name.trim()));
    onOpenChange(false);
  };

  const statusDescription = t(`workspaceUI.editMember.statusDescriptions.${status}`);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <UserCog className="h-4 w-4" />
            </span>
            <div>
              <DialogTitle>{t("workspaceUI.editMember.title")}</DialogTitle>
              <DialogDescription>{t("workspaceUI.editMember.description")}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="em-name">{t("workspaceUI.editMember.nameLabel")}</Label>
              <Input id="em-name" autoFocus value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="em-email">{t("workspaceUI.editMember.emailLabel")}</Label>
              <Input id="em-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>{t("workspaceUI.editMember.roleLabel")}</Label>
              <Select value={role} onValueChange={(v) => setRole(v as MemberRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES_IN_ORDER.map((r) => (
                    <SelectItem key={r} value={r}>
                      {t(`workspaceUI.members.role.${r}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground">{t(`workspaceUI.roles.descriptions.${role}`)}</p>
            </div>
            <div className="space-y-2">
              <Label>{t("workspaceUI.editMember.statusLabel")}</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as MemberStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_VALUES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {t(`workspaceUI.members.status.${s}`)}
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
            {t("workspaceUI.editMember.cancel")}
          </Button>
          <Button onClick={onSubmit} disabled={submitting || !name.trim() || !email.trim()}>
            {submitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> {t("workspaceUI.editMember.saving")}
              </>
            ) : (
              t("workspaceUI.editMember.save")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
