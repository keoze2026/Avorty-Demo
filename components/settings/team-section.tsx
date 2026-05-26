"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, MoreVertical, Plus, ShieldOff, UserCog, UserMinus } from "lucide-react";
import { toast } from "sonner";

import { InviteMemberDialog } from "./invite-member-dialog";
import { PermissionsMatrix } from "./permissions-matrix";
import { SectionShell } from "./profile-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatRelativeTime } from "@/lib/format";
import { MOCK_MEMBERS, ROLES_IN_ORDER, ROLE_DESCRIPTIONS } from "@/lib/mock/settings";
import type { Member, MemberRole } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TeamSection() {
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS);
  const [inviteOpen, setInviteOpen] = useState(false);

  const onInvite = ({ name, email, role }: { name: string; email: string; role: MemberRole }) => {
    const initials = name.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
    setMembers((m) => [
      {
        id: `m_${Math.random().toString(36).slice(2, 8)}`,
        name,
        email,
        role,
        initials,
        avatar: ["#00e6b8", "#22d3ee"],
        status: "invited",
        invitedAt: Date.now(),
      },
      ...m,
    ]);
  };

  const onSuspend = (m: Member) => {
    setMembers((all) => all.map((x) => (x.id === m.id ? { ...x, status: "suspended" } : x)));
    toast.success(`${m.name} suspended`);
  };
  const onRevoke = (m: Member) => {
    setMembers((all) => all.filter((x) => x.id !== m.id));
    toast.success(`Removed ${m.name}`);
  };
  const onChangeRole = (m: Member, next: MemberRole) => {
    if (m.role === next) return;
    setMembers((all) => all.map((x) => (x.id === m.id ? { ...x, role: next } : x)));
    toast.success(`Changed ${m.name}'s role`, { description: `Now ${next}` });
  };

  return (
    <SectionShell
      eyebrow="Team"
      title="Members &amp; permissions"
      description="Invite, control, and audit who has access — and what they can do."
    >
      {/* Member list */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-secondary/30 px-4 py-3">
          <div>
            <h3 className="text-sm font-semibold">Members</h3>
            <p className="text-[10px] text-muted-foreground">
              {members.filter((m) => m.status === "active").length} active ·{" "}
              {members.filter((m) => m.status === "invited").length} pending invites
            </p>
          </div>
          <Button size="sm" onClick={() => setInviteOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Invite member
          </Button>
        </div>

        <ul className="divide-y divide-border/60">
          {members.map((m, i) => (
            <motion.li
              key={m.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.22 }}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-secondary/20"
            >
              <span
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-background shadow"
                style={{ background: `linear-gradient(135deg, ${m.avatar[0]}, ${m.avatar[1]})` }}
              >
                {m.initials}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium">{m.name}</span>
                  <Badge
                    variant={
                      m.status === "active" ? "success" : m.status === "invited" ? "outline" : "destructive"
                    }
                    className="capitalize"
                  >
                    {m.status}
                  </Badge>
                </div>
                <div className="truncate text-[11px] text-muted-foreground font-mono">{m.email}</div>
              </div>

              <div className="hidden text-right sm:block">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Role</div>
                <div className="text-xs font-mono capitalize">{m.role}</div>
              </div>

              <div className="hidden w-28 text-right text-[11px] text-muted-foreground sm:block">
                {m.lastActiveAt ? `Active ${formatRelativeTime(m.lastActiveAt)}` : m.status === "invited" ? "Invite pending" : "—"}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <UserCog className="h-4 w-4" /> Change role
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent className="w-56">
                        {ROLES_IN_ORDER.map((r) => {
                          const active = m.role === r;
                          return (
                            <DropdownMenuItem
                              key={r}
                              onSelect={() => onChangeRole(m, r)}
                              className={cn("flex items-start gap-2", active && "bg-accent/10")}
                            >
                              <span
                                className={cn(
                                  "mt-0.5 inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center",
                                  active ? "text-accent" : "text-transparent",
                                )}
                              >
                                <Check className="h-3 w-3" strokeWidth={3} />
                              </span>
                              <span className="min-w-0">
                                <span className="block font-mono text-xs capitalize">{r}</span>
                                <span className="block text-[10px] text-muted-foreground">
                                  {ROLE_DESCRIPTIONS[r]}
                                </span>
                              </span>
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                  <DropdownMenuItem onSelect={() => onSuspend(m)}>
                    <ShieldOff className="h-4 w-4" /> Suspend
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => onRevoke(m)}
                    className="text-destructive focus:text-destructive"
                  >
                    <UserMinus className="h-4 w-4" /> Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* The matrix */}
      <PermissionsMatrix />

      <InviteMemberDialog open={inviteOpen} onOpenChange={setInviteOpen} onInvite={onInvite} />
    </SectionShell>
  );
}
