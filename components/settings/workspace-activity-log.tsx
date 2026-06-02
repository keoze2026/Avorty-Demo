"use client";

import * as React from "react";
import {
  Search,
  Settings2,
  ShieldCheck,
  UserCog,
  UserMinus,
  UserPlus,
} from "lucide-react";

import { Pagination } from "@/components/shared/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRelativeTime } from "@/lib/format";
import {
  MOCK_WORKSPACE_ACTIVITY,
  type ActivityCategory,
  type ActivityKind,
  type WorkspaceActivityEvent,
} from "@/lib/mock/workspace-activity";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";

type Filter = "all" | ActivityCategory;

const FILTERS: Array<{ id: Filter; labelKey: string }> = [
  { id: "all", labelKey: "workspaceUI.activity.filter.all" },
  { id: "member", labelKey: "workspaceUI.activity.filter.member" },
  { id: "role", labelKey: "workspaceUI.activity.filter.role" },
  { id: "settings", labelKey: "workspaceUI.activity.filter.settings" },
];

/** Maps activity kinds to translation keys for the verb phrase. */
const VERB_KEYS: Record<ActivityKind, string> = {
  "member.invited": "workspaceUI.activity.verbs.invited",
  "member.joined": "workspaceUI.activity.verbs.joined",
  "member.removed": "workspaceUI.activity.verbs.removed",
  "member.suspended": "workspaceUI.activity.verbs.suspended",
  "member.reactivated": "workspaceUI.activity.verbs.reactivated",
  "member.role-changed": "workspaceUI.activity.verbs.roleChanged",
  "role.permissions-updated": "workspaceUI.activity.verbs.permissionsUpdated",
  "workspace.renamed": "workspaceUI.activity.verbs.renamed",
  "workspace.timezone-changed": "workspaceUI.activity.verbs.timezoneChanged",
};

/** Per-kind icon shown next to the action verb. */
const KIND_ICONS: Record<ActivityKind, React.ComponentType<{ className?: string }>> = {
  "member.invited": UserPlus,
  "member.joined": UserPlus,
  "member.removed": UserMinus,
  "member.suspended": UserMinus,
  "member.reactivated": UserPlus,
  "member.role-changed": UserCog,
  "role.permissions-updated": ShieldCheck,
  "workspace.renamed": Settings2,
  "workspace.timezone-changed": Settings2,
};

/** Tint the icon so categories are visually distinct without color-coding everything. */
const CATEGORY_TINT: Record<ActivityCategory, string> = {
  member: "text-sky-500 dark:text-sky-400",
  role: "text-violet-500 dark:text-violet-400",
  settings: "text-amber-500 dark:text-amber-400",
};

function absoluteTime(ts: number) {
  return new Date(ts).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function WorkspaceActivityLog() {
  const { t } = useTranslation();
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState<Filter>("all");
  const [pageSize, setPageSize] = React.useState(25);
  const [page, setPage] = React.useState(0);

  const events = MOCK_WORKSPACE_ACTIVITY;

  React.useEffect(() => {
    setPage(0);
  }, [query, filter, pageSize]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter((e) => {
      if (filter !== "all" && e.category !== filter) return false;
      if (!q) return true;
      return (
        e.actor.name.toLowerCase().includes(q) ||
        (e.target?.toLowerCase().includes(q) ?? false) ||
        t(VERB_KEYS[e.kind]).toLowerCase().includes(q)
      );
    });
  }, [events, filter, query, t]);

  return (
    <Card className="overflow-hidden p-0">
      <CardHeader className="flex flex-col gap-3 border-b border-border bg-secondary/20 px-4 py-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-base">{t("workspaceUI.activity.title")}</CardTitle>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {t("workspaceUI.activity.description")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("workspaceUI.activity.searchPlaceholder")}
              className="h-8 w-56 pl-7 text-xs"
            />
          </div>
          <div className="inline-flex items-center rounded-md border border-border bg-card p-0.5">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={cn(
                  "rounded px-2.5 py-1 text-[11px] font-medium transition-colors",
                  filter === f.id
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t(f.labelKey)}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4 text-left">{t("workspaceUI.activity.columnActor")}</TableHead>
                <TableHead className="text-left">{t("workspaceUI.activity.columnAction")}</TableHead>
                <TableHead className="text-left">{t("workspaceUI.activity.columnDetail")}</TableHead>
                <TableHead className="pr-4">{t("workspaceUI.activity.columnWhen")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-xs text-muted-foreground">
                    {t("workspaceUI.activity.empty")}
                  </TableCell>
                </TableRow>
              ) : (
                filtered
                  .slice(page * pageSize, page * pageSize + pageSize)
                  .map((e) => <ActivityRow key={e.id} event={e} />)
              )}
            </TableBody>
          </Table>
        </div>

        <div className="border-t border-border px-4 py-2.5">
          <Pagination
            page={page}
            pageSize={pageSize}
            total={filtered.length}
            onPage={setPage}
            onPageSize={setPageSize}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityRow({ event }: { event: WorkspaceActivityEvent }) {
  const { t } = useTranslation();
  const Icon = KIND_ICONS[event.kind];
  const verb = t(VERB_KEYS[event.kind]);

  return (
    <TableRow>
      <TableCell className="pl-4 text-left">
        <div className="flex items-center gap-2.5">
          <span
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-background shadow"
            style={{
              background: `linear-gradient(135deg, ${event.actor.avatar[0]}, ${event.actor.avatar[1]})`,
            }}
          >
            {event.actor.initials}
          </span>
          <span className="truncate text-sm font-medium">{event.actor.name}</span>
        </div>
      </TableCell>
      <TableCell className="text-left">
        <div className="inline-flex items-center gap-2 text-[13px]">
          <Icon className={cn("h-3.5 w-3.5 shrink-0", CATEGORY_TINT[event.category])} />
          <span className="text-muted-foreground">{verb}</span>
          {event.target && <span className="font-medium text-foreground">{event.target}</span>}
        </div>
      </TableCell>
      <TableCell className="text-left text-[12px] text-muted-foreground">
        {event.rolePair ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="rounded border border-border bg-card px-1.5 py-0.5 text-[10px]">
              {t(`workspaceUI.members.role.${event.rolePair.from}`)}
            </span>
            <span aria-hidden>→</span>
            <span className="rounded border border-accent/45 bg-accent/12 px-1.5 py-0.5 text-[10px] text-foreground">
              {t(`workspaceUI.members.role.${event.rolePair.to}`)}
            </span>
          </span>
        ) : (
          event.detail ?? "—"
        )}
      </TableCell>
      <TableCell className="pr-4 tabular-nums" title={absoluteTime(event.timestamp)}>
        {formatRelativeTime(event.timestamp)}
      </TableCell>
    </TableRow>
  );
}
