"use client";

/**
 * Publisher settings — Members + Permissions + Advanced collaboration controls.
 *
 * Layout (matches the design spec):
 *   ┌─────────────────────────────────────────────┐
 *   │ Publisher name        [Timezone select]      │
 *   │ Manage settings for this publisher           │
 *   ├──────────── MEMBERS ─────────────────────────┤
 *   ├──────────── PERMISSIONS ─────────────────────┤
 *   ├──────────── ADVANCED SETTINGS ───────────────┤
 *   └─────────────────────────────────────────────┘
 *
 * All state persists per-publisher via `usePublisherAccessStore`.
 */

import * as React from "react";
import {
  ChevronDown,
  ChevronUp,
  Filter,
  Gauge,
  Info,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PERMISSIONS,
  REPORTING_COLUMNS,
  TIMEZONES,
  usePublisherAccessStore,
  type PermissionKey,
  type ReportingColumnKey,
  type ReportingVisibility,
} from "@/lib/store/publisher-access-store";
import type { Publisher } from "@/lib/types";

interface Props {
  publisher: Publisher;
}

export function PublisherSettingsTab({ publisher }: Props) {
  const access = usePublisherAccessStore((s) => s.byPublisher[publisher.id]);
  const setTimezone = usePublisherAccessStore((s) => s.setTimezone);
  const togglePermission = usePublisherAccessStore((s) => s.togglePermission);
  const toggleReportingColumn = usePublisherAccessStore((s) => s.toggleReportingColumn);
  const setCapEnabled = usePublisherAccessStore((s) => s.setCapEnabled);
  const addMember = usePublisherAccessStore((s) => s.addMember);
  const removeMember = usePublisherAccessStore((s) => s.removeMember);

  const timezone = access?.timezone ?? "UTC";
  const members = access?.members ?? [];
  const permissions = access?.permissions ?? {
    manageTraffic: false,
    numberCreation: false,
    audioRecording: false,
    blockNumbers: false,
    downloadReports: false,
  };
  const reporting: ReportingVisibility = access?.reporting ?? {
    incoming: true,
    connected: true,
    qualified: true,
    notConnected: true,
    acl: true,
    tcl: true,
    cost: true,
  };
  const capEnabled = access?.cap.enabled ?? false;

  return (
    <Card className="space-y-6 p-6">
      <HeaderRow
        title={publisher.name}
        timezone={timezone}
        onTimezoneChange={(v) => setTimezone(publisher.id, v)}
      />

      <MembersSection
        publisherId={publisher.id}
        members={members}
        onAdd={(email) => addMember(publisher.id, email)}
        onRemove={(memberId) => removeMember(publisher.id, memberId)}
      />

      <PermissionsSection
        permissions={permissions}
        onToggle={(key) => togglePermission(publisher.id, key)}
      />

      <ReportingVisibilitySection
        visibility={reporting}
        onToggle={(key) => toggleReportingColumn(publisher.id, key)}
      />

      <AdvancedSection
        capEnabled={capEnabled}
        onCapEnabledChange={(v) => setCapEnabled(publisher.id, v)}
      />
    </Card>
  );
}

/* ─── Header ─────────────────────────────────────────────────────────── */

function HeaderRow({
  title,
  timezone,
  onTimezoneChange,
}: {
  title: string;
  timezone: string;
  onTimezoneChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          <Info className="h-4 w-4 text-muted-foreground" />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage settings for this publisher
        </p>
      </div>
      <Select value={timezone} onValueChange={onTimezoneChange}>
        <SelectTrigger className="w-full sm:w-72">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TIMEZONES.map((tz) => (
            <SelectItem key={tz.value} value={tz.value}>
              {tz.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/* ─── Members ────────────────────────────────────────────────────────── */

function MembersSection({
  publisherId,
  members,
  onAdd,
  onRemove,
}: {
  publisherId: string;
  members: ReturnType<typeof usePublisherAccessStore.getState>["byPublisher"][string]["members"];
  onAdd: (email: string) => void;
  onRemove: (memberId: string) => void;
}) {
  const [query, setQuery] = React.useState("");
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [inviteEmail, setInviteEmail] = React.useState("");

  const filtered = React.useMemo(() => {
    if (!query.trim()) return members;
    const q = query.trim().toLowerCase();
    return members.filter((m) => m.email.toLowerCase().includes(q));
  }, [members, query]);

  const submitInvite = () => {
    const trimmed = inviteEmail.trim();
    if (!/^\S+@\S+\.\S+$/.test(trimmed)) {
      toast.error("Enter a valid email address");
      return;
    }
    onAdd(trimmed);
    toast.success(`Invited ${trimmed}`);
    setInviteEmail("");
    setInviteOpen(false);
  };

  return (
    <Section
      title="Members"
      description="Users who can view the statistics for this publisher"
    >
      <div className="flex items-center justify-end gap-2 px-4 pb-3 pt-1">
        <button
          type="button"
          onClick={() => setSearchOpen((v) => !v)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Search members"
        >
          <Search className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => toast.info("Filter members — coming soon")}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Filter members"
        >
          <Filter className="h-3.5 w-3.5" />
        </button>
        <Button
          size="sm"
          variant="default"
          onClick={() => setInviteOpen((v) => !v)}
        >
          Invite
        </Button>
      </div>

      {searchOpen && (
        <div className="px-4 pb-3">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by email"
            className="h-8"
          />
        </div>
      )}

      {inviteOpen && (
        <div className="mx-4 mb-3 flex items-center gap-2 rounded-md border border-border bg-secondary/30 p-2">
          <Input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submitInvite();
              }
            }}
            placeholder="member@example.com"
            className="h-8"
            autoFocus
          />
          <Button size="sm" onClick={submitInvite}>
            Send invite
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setInviteOpen(false);
              setInviteEmail("");
            }}
          >
            Cancel
          </Button>
        </div>
      )}

      <div className="overflow-hidden border-t border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4 text-left">Email</TableHead>
              <TableHead className="text-left">Status</TableHead>
              <TableHead className="pr-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={3}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  <Users className="mx-auto mb-2 h-5 w-5 opacity-40" />
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="pl-4 text-left font-medium">
                    {m.email}
                  </TableCell>
                  <TableCell className="text-left">
                    <Badge
                      variant={m.status === "active" ? "success" : "outline"}
                      className="capitalize"
                    >
                      {m.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        onRemove(m.id);
                        toast.success(`Removed ${m.email}`);
                      }}
                      aria-label={`Remove ${m.email}`}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {/* swallow unused-var linter warning when publisherId isn't read directly */}
      <span hidden data-publisher-id={publisherId} />
    </Section>
  );
}

/* ─── Permissions ────────────────────────────────────────────────────── */

function PermissionsSection({
  permissions,
  onToggle,
}: {
  permissions: Record<PermissionKey, boolean>;
  onToggle: (key: PermissionKey) => void;
}) {
  return (
    <Section
      title="Permissions"
      description="List of available permissions for users"
    >
      <ul className="divide-y divide-border">
        {PERMISSIONS.map((p) => (
          <li
            key={p.key}
            className="flex items-center justify-between gap-4 px-4 py-3.5"
          >
            <div>
              <div className="text-sm font-medium leading-tight">{p.label}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {p.description}
              </div>
            </div>
            <Switch
              checked={!!permissions[p.key]}
              onCheckedChange={() => onToggle(p.key)}
              aria-label={`Toggle ${p.label}`}
            />
          </li>
        ))}
      </ul>
    </Section>
  );
}

/* ─── Reporting visibility ───────────────────────────────────────────── */

function ReportingVisibilitySection({
  visibility,
  onToggle,
}: {
  visibility: ReportingVisibility;
  onToggle: (key: ReportingColumnKey) => void;
}) {
  const visibleCount = REPORTING_COLUMNS.filter((c) => visibility[c.key]).length;

  return (
    <Section
      title="Reporting Visibility"
      description={`Pick which reporting columns this publisher can see — uncheck to hide. ${visibleCount} of ${REPORTING_COLUMNS.length} visible.`}
    >
      <ul className="grid grid-cols-1 gap-1 px-2 py-2 sm:grid-cols-2">
        {REPORTING_COLUMNS.map((col) => {
          const id = `rpt-${col.key}`;
          const checked = !!visibility[col.key];
          return (
            <li key={col.key}>
              <label
                htmlFor={id}
                className="flex cursor-pointer items-start gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-secondary/40"
              >
                <Checkbox
                  id={id}
                  checked={checked}
                  onCheckedChange={() => onToggle(col.key)}
                  className="mt-0.5"
                />
                <div className="min-w-0">
                  <div className="text-sm font-medium leading-tight">
                    {col.label}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {col.description}
                  </div>
                </div>
              </label>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

/* ─── Advanced settings ──────────────────────────────────────────────── */

function AdvancedSection({
  capEnabled,
  onCapEnabledChange,
}: {
  capEnabled: boolean;
  onCapEnabledChange: (v: boolean) => void;
}) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <Section
      title="Advanced Settings"
      description="Customize how incoming calls are routed to optimize the call experience"
    >
      <div className="px-2 py-2">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-between gap-4 rounded-md px-3 py-3 text-left transition-colors hover:bg-secondary/40"
        >
          <div className="flex items-center gap-3">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-accent/10 text-accent">
              <Gauge className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-medium leading-tight">CAP SETTINGS</div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                Manage limits for the traffic sources of the publisher
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={capEnabled ? "success" : "outline"}>
              {capEnabled ? "Enabled" : "Disabled"}
            </Badge>
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </button>
        {expanded && (
          <div className="mx-3 mt-2 rounded-md border border-border bg-secondary/30 p-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium">Enable cap limits</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  When on, routing will respect this publisher's hourly / daily caps.
                </div>
              </div>
              <Switch
                checked={capEnabled}
                onCheckedChange={onCapEnabledChange}
                aria-label="Enable cap settings"
              />
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}

/* ─── Shared sub-card shell ──────────────────────────────────────────── */

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-background/30">
      <header className="px-4 py-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-foreground">
          {title}
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </header>
      {children}
    </section>
  );
}
