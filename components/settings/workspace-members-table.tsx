"use client";

import * as React from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { EditMemberDialog } from "./edit-member-dialog";
import { InviteMemberDialog } from "./invite-member-dialog";
import { Pagination } from "@/components/shared/pagination";
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
import type { Member, MemberRole } from "@/lib/types";
import { useTranslation } from "@/hooks/use-translation";

interface WorkspaceMembersTableProps {
  members: Member[];
  onMembersChange: (next: Member[]) => void;
}

export function WorkspaceMembersTable({ members, onMembersChange }: WorkspaceMembersTableProps) {
  const { t } = useTranslation();
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Member | null>(null);
  const [removing, setRemoving] = React.useState<Member | null>(null);
  const [pageSize, setPageSize] = React.useState(25);
  const [page, setPage] = React.useState(0);
  React.useEffect(() => {
    setPage(0);
  }, [pageSize, members.length]);

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
    toast.success(t("workspaceUI.members.removed").replace("{name}", m.name));
    setRemoving(null);
  };

  const activeCount = members.filter((m) => m.status === "active").length;
  const invitedCount = members.filter((m) => m.status === "invited").length;

  return (
    <>
      <Card className="overflow-hidden p-0">
        <CardHeader className="flex flex-row items-center justify-between gap-2 border-b border-border bg-secondary/20 px-4 py-3 space-y-0">
          <div>
            <CardTitle className="text-base">{t("workspaceUI.members.title")}</CardTitle>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {t("workspaceUI.members.countSummary")
                .replace("{active}", String(activeCount))
                .replace("{invited}", String(invitedCount))}
            </p>
          </div>
          <Button size="sm" onClick={() => setInviteOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> {t("workspaceUI.members.invite")}
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {members.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Plus className="h-5 w-5" />
              </span>
              <div>
                <h4 className="text-sm font-semibold">No team members yet</h4>
                <p className="mt-1 max-w-md text-xs text-muted-foreground">
                  Invite teammates once the team-members endpoint ships on the
                  backend. The invite + role + suspend actions all need
                  <span className="font-mono"> /api/accounts/members</span>
                  &nbsp;CRUD, which isn&apos;t live yet.
                </p>
              </div>
            </div>
          ) : (
          <>
          <div className="overflow-x-auto">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-4 text-left">{t("workspaceUI.members.columnName")}</TableHead>
                  <TableHead className="text-left">{t("workspaceUI.members.columnEmail")}</TableHead>
                  <TableHead>{t("workspaceUI.members.columnRole")}</TableHead>
                  <TableHead>{t("workspaceUI.members.columnStatus")}</TableHead>
                  <TableHead className="pr-4">{t("workspaceUI.members.columnActions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members
                  .slice(page * pageSize, page * pageSize + pageSize)
                  .map((m) => (
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
                    <TableCell>{t(`workspaceUI.members.role.${m.role}`)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          m.status === "active"
                            ? "success"
                            : m.status === "invited"
                              ? "outline"
                              : "destructive"
                        }
                      >
                        {t(`workspaceUI.members.status.${m.status}`)}
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
                          <Pencil className="h-3.5 w-3.5" /> {t("workspaceUI.members.edit")}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setRemoving(m)}
                        >
                          <Trash2 className="h-3.5 w-3.5" /> {t("workspaceUI.members.remove")}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {members.length > pageSize && (
            <div className="border-t border-border px-4 py-2.5">
              <Pagination
                page={page}
                pageSize={pageSize}
                total={members.length}
                onPage={setPage}
                onPageSize={setPageSize}
              />
            </div>
          )}
          </>
          )}
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
            <AlertDialogTitle>
              {t("workspaceUI.members.removeConfirmTitle").replace("{name}", removing?.name ?? "")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("workspaceUI.members.removeConfirmDescription").replace("{name}", removing?.name ?? "")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("workspaceUI.members.removeCancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removing && onRemove(removing)}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {t("workspaceUI.members.remove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

