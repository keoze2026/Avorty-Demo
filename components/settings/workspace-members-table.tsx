"use client";

import * as React from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { EditMemberDialog } from "./edit-member-dialog";
import { InviteMemberDialog } from "./invite-member-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MOCK_MEMBERS } from "@/lib/mock/settings";
import type { Member, MemberRole } from "@/lib/types";

interface WorkspaceMembersTableProps {
  members: Member[];
  onMembersChange: (next: Member[]) => void;
}

export function WorkspaceMembersTable({ members, onMembersChange }: WorkspaceMembersTableProps) {
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Member | null>(null);
  const [removing, setRemoving] = React.useState<Member | null>(null);

  const onInvite = ({ name, email, role }: { name: string; email: string; role: MemberRole }) => {
    const initials = name
      .split(" ")
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
    onMembersChange([
      {
        id: `m_${Math.random().toString(36).slice(2, 8)}`,
        name,
        email,
        role,
        initials,
        avatar: ["#5266E0", "#818CF8"],
        status: "invited",
        invitedAt: Date.now(),
      },
      ...members,
    ]);
  };

  const onUpdate = ({
    id,
    name,
    email,
    role,
    status,
  }: {
    id: string;
    name: string;
    email: string;
    role: MemberRole;
    status: Member["status"];
  }) => {
    const initials = name
      .split(" ")
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
    onMembersChange(
      members.map((m) =>
        m.id === id ? { ...m, name, email, role, status, initials } : m,
      ),
    );
  };

  const onRemove = (m: Member) => {
    onMembersChange(members.filter((x) => x.id !== m.id));
    toast.success(`Removed ${m.name}`);
    setRemoving(null);
  };

  const activeCount = members.filter((m) => m.status === "active").length;
  const invitedCount = members.filter((m) => m.status === "invited").length;

  return (
    <>
      <Card className="overflow-hidden p-0">
        <CardHeader className="flex flex-row items-center justify-between gap-2 border-b border-border bg-secondary/20 px-4 py-3 space-y-0">
          <div>
            <CardTitle className="text-base">Members</CardTitle>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {activeCount} active · {invitedCount} pending
            </p>
          </div>
          <Button size="sm" onClick={() => setInviteOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Invite member
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-4 text-left">Name</TableHead>
                  <TableHead className="text-left">Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-4">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="pl-4 text-left">
                      <div className="flex items-center gap-3">
                        <span
                          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-background shadow"
                          style={{
                            background: `linear-gradient(135deg, ${m.avatar[0]}, ${m.avatar[1]})`,
                          }}
                        >
                          {m.initials}
                        </span>
                        <span className="truncate text-sm font-medium">{m.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-left font-mono text-[11px] text-muted-foreground">
                      {m.email}
                    </TableCell>
                    <TableCell className="capitalize">{m.role}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          m.status === "active"
                            ? "success"
                            : m.status === "invited"
                              ? "outline"
                              : "destructive"
                        }
                        className="capitalize"
                      >
                        {m.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-4">
                      <div className="inline-flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => setEditing(m)}
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setRemoving(m)}
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <InviteMemberDialog open={inviteOpen} onOpenChange={setInviteOpen} onInvite={onInvite} />

      <EditMemberDialog
        member={editing}
        onOpenChange={(next) => {
          if (!next) setEditing(null);
        }}
        onSave={onUpdate}
      />

      <AlertDialog open={removing !== null} onOpenChange={(next) => !next && setRemoving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {removing?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              {removing?.name} will lose access to this workspace immediately. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removing && onRemove(removing)}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/** Default seed — re-exported so the parent doesn't have to know about the mock. */
export { MOCK_MEMBERS };
