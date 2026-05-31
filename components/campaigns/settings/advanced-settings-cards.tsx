"use client";

/**
 * The 12 collapsible advanced-setting cards rendered inside the General
 * sub-tab of a campaign's settings. Each card reuses the AdvancedSettingShell
 * for header/toggle/expand chrome and renders its own form body.
 */

import { useCallback } from "react";
import {
  ClockAlert,
  Disc,
  Filter as FilterIcon,
  Headphones,
  ListChecks,
  MessagesSquare,
  Plus,
  Shield,
  ShieldX,
  Sparkles,
  Speech,
  Timer,
  Trash2,
  Voicemail as VoicemailIcon,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { AdvancedSettingShell } from "./advanced-setting-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useCampaignSettingsStore } from "@/lib/store/campaign-settings-store";
import type {
  AutoRecordSettings,
  BusinessHoursSettings,
  CallQueueSettings,
  CampaignAdvancedSettings,
  CapSettings,
  ConcurrencySettings,
  FilterCondition,
  FilterGroup,
  FilterSettings,
  GreetingsMessageSettings,
  RevenueSaverSettings,
  SpamFilterSettings,
  VoicemailSettings,
  VoipShieldSettings,
  WhisperMessageSettings,
} from "@/lib/types";
import { cn } from "@/lib/utils";

/* ─── tiny generic helpers ──────────────────────────────────────── */

const DAYS = [
  { id: 0, label: "Sun" },
  { id: 1, label: "Mon" },
  { id: 2, label: "Tue" },
  { id: 3, label: "Wed" },
  { id: 4, label: "Thu" },
  { id: 5, label: "Fri" },
  { id: 6, label: "Sat" },
];

function NumField({
  label,
  value,
  onChange,
  min = 0,
  step = 1,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  step?: number;
  suffix?: string;
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs">{label}</Label>
      <div className="relative">
        <Input
          type="number"
          min={min}
          step={step}
          value={value}
          onChange={(e) => onChange(Math.max(min, Number(e.target.value) || 0))}
          className={suffix ? "pr-12" : undefined}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

/* ─── single hook to bind a card to the store ──────────────────── */

function useSetting<K extends keyof CampaignAdvancedSettings>(
  campaignId: string,
  key: K,
): [CampaignAdvancedSettings[K], (v: CampaignAdvancedSettings[K]) => void] {
  const get = useCampaignSettingsStore((s) => s.get);
  const update = useCampaignSettingsStore((s) => s.update);
  const value = get(campaignId)[key];
  const setValue = useCallback(
    (v: CampaignAdvancedSettings[K]) => update(campaignId, key, v),
    [campaignId, key, update],
  );
  return [value, setValue];
}

/* ─── 1. Call Queue ─────────────────────────────────────────────── */

export function CallQueueCard({ campaignId }: { campaignId: string }) {
  const [s, setS] = useSetting(campaignId, "callQueue");
  const patch = (p: Partial<CallQueueSettings>) => setS({ ...s, ...p });

  return (
    <AdvancedSettingShell
      icon={Headphones}
      title="Call Queue"
      description="Don't miss calls — just place them in the call queue."
      enabled={s.enabled}
      onEnabledChange={(enabled) => patch({ enabled })}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <NumField
          label="Max queue size"
          value={s.maxQueueSize}
          onChange={(v) => patch({ maxQueueSize: v })}
        />
        <NumField
          label="Max wait time"
          value={s.maxWaitSec}
          onChange={(v) => patch({ maxWaitSec: v })}
          suffix="sec"
        />
        <div className="grid gap-1.5 sm:col-span-2">
          <Label className="text-xs">Hold-music URL (mp3)</Label>
          <Input
            placeholder="https://cdn.example.com/hold-music.mp3"
            value={s.musicUrl}
            onChange={(e) => patch({ musicUrl: e.target.value })}
          />
        </div>
      </div>
    </AdvancedSettingShell>
  );
}

/* ─── 2. Auto Record Calls ─────────────────────────────────────── */

export function AutoRecordCard({ campaignId }: { campaignId: string }) {
  const [s, setS] = useSetting(campaignId, "autoRecord");
  const patch = (p: Partial<AutoRecordSettings>) => setS({ ...s, ...p });

  return (
    <AdvancedSettingShell
      icon={Disc}
      title="Auto Record Calls"
      description="Automatically records all incoming calls."
      enabled={s.enabled}
      onEnabledChange={(enabled) => patch({ enabled })}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <NumField
          label="Retention (days)"
          value={s.storeForDays}
          onChange={(v) => patch({ storeForDays: v })}
          suffix="days"
        />
        <div className="grid gap-1.5">
          <Label className="text-xs">Quality</Label>
          <Select
            value={s.quality}
            onValueChange={(v) => patch({ quality: v as AutoRecordSettings["quality"] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard (8 kHz mono)</SelectItem>
              <SelectItem value="hd">HD (16 kHz stereo)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2">
          <ToggleRow
            label="Notify the buyer when a recording is ready"
            checked={s.notifyBuyer}
            onChange={(notifyBuyer) => patch({ notifyBuyer })}
          />
        </div>
      </div>
    </AdvancedSettingShell>
  );
}

/* ─── 3. Spam Filter ───────────────────────────────────────────── */

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY",
];

export function SpamFilterCard({ campaignId }: { campaignId: string }) {
  const [s, setS] = useSetting(campaignId, "spamFilter");
  const patch = (p: Partial<SpamFilterSettings>) => setS({ ...s, ...p });
  const toggleState = (code: string) => {
    const has = s.blockedStates.includes(code);
    patch({
      blockedStates: has
        ? s.blockedStates.filter((c) => c !== code)
        : [...s.blockedStates, code],
    });
  };

  return (
    <AdvancedSettingShell
      icon={ShieldX}
      title="Spam Filter"
      description="Block unwanted calls by enabling the spam filter."
      enabled={s.enabled}
      onEnabledChange={(enabled) => patch({ enabled })}
    >
      <div className="grid gap-4">
        <ToggleRow
          label="Block calls flagged by the carrier as spam"
          checked={s.blockCarrierSpam}
          onChange={(blockCarrierSpam) => patch({ blockCarrierSpam })}
        />
        <div className="grid gap-1.5">
          <Label className="text-xs">Blocked numbers (one per line)</Label>
          <Textarea
            rows={3}
            placeholder="+15551234567"
            value={s.blockedNumbers}
            onChange={(e) => patch({ blockedNumbers: e.target.value })}
          />
        </div>
        <div>
          <Label className="text-xs">Blocked states ({s.blockedStates.length})</Label>
          <div className="mt-1.5 flex max-h-32 flex-wrap gap-1 overflow-y-auto rounded-md border border-border bg-card p-2">
            {US_STATES.map((st) => {
              const on = s.blockedStates.includes(st);
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => toggleState(st)}
                  className={`rounded px-2 py-0.5 text-[10px] font-mono transition-colors ${
                    on
                      ? "bg-destructive/15 text-destructive"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {st}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </AdvancedSettingShell>
  );
}

/* ─── 4. Filter ─────────────────────────────────────────────────── */

/* ─────────────────────────────────────────────────────────────────── */
/*  Filter rule-builder — group-of-conditions editor                    */
/* ─────────────────────────────────────────────────────────────────── */

/** Parameter dropdown — grouped by source (Call, Caller Profile, etc.). */
const FILTER_PARAMETERS: Array<{
  group: string;
  items: Array<{ value: string; label: string }>;
}> = [
  {
    group: "Call",
    items: [
      { value: "call.duration", label: "Duration (s)" },
      { value: "call.status", label: "Status" },
      { value: "call.startedAtHour", label: "Started at hour (0-23)" },
      { value: "call.callerNumber", label: "Caller number" },
      { value: "call.destinationNumber", label: "Destination number" },
      { value: "call.publisherId", label: "Publisher" },
      { value: "call.campaignId", label: "Campaign" },
    ],
  },
  {
    group: "Caller Profile",
    items: [
      { value: "caller.country", label: "Country" },
      { value: "caller.state", label: "State" },
      { value: "caller.city", label: "City" },
      { value: "caller.zipcode", label: "Zip code" },
      { value: "caller.carrier", label: "Carrier" },
      { value: "caller.lineType", label: "Line type (mobile/voip/landline)" },
      { value: "caller.areaCode", label: "Area code" },
      { value: "caller.timezone", label: "Timezone" },
      { value: "caller.fraudScore", label: "Fraud score (0-100)" },
    ],
  },
  {
    group: "Custom Parameters",
    items: [
      { value: "param.vertical", label: "Vertical" },
      { value: "param.trafficSource", label: "Traffic source" },
      { value: "param.partnerId", label: "Partner id" },
      { value: "param.leadId", label: "Lead id" },
      { value: "param.utmSource", label: "UTM source" },
      { value: "param.utmMedium", label: "UTM medium" },
      { value: "param.utmCampaign", label: "UTM campaign" },
    ],
  },
  {
    group: "Session Data",
    items: [
      { value: "session.id", label: "Session id" },
      { value: "session.referrer", label: "Referrer" },
      { value: "session.landingPage", label: "Landing page" },
      { value: "session.userAgent", label: "User agent" },
      { value: "session.deviceType", label: "Device type" },
      { value: "session.pagesViewed", label: "Pages viewed" },
      { value: "session.timeOnSite", label: "Time on site (s)" },
    ],
  },
  {
    group: "SIP Headers",
    items: [
      { value: "sip.fromHost", label: "From host" },
      { value: "sip.toHost", label: "To host" },
      { value: "sip.contact", label: "Contact" },
      { value: "sip.userAgent", label: "User agent" },
      { value: "sip.diversion", label: "Diversion" },
      { value: "sip.pAssertedIdentity", label: "P-Asserted-Identity" },
    ],
  },
];

const FILTER_OPERATORS: Array<{ value: string; label: string }> = [
  { value: "equals", label: "equals" },
  { value: "notEquals", label: "does not equal" },
  { value: "contains", label: "contains" },
  { value: "notContains", label: "does not contain" },
  { value: "startsWith", label: "starts with" },
  { value: "endsWith", label: "ends with" },
  { value: "in", label: "is in list" },
  { value: "notIn", label: "is not in list" },
  { value: "greaterThan", label: ">" },
  { value: "lessThan", label: "<" },
  { value: "greaterOrEqual", label: "≥" },
  { value: "lessOrEqual", label: "≤" },
  { value: "exists", label: "exists" },
  { value: "notExists", label: "does not exist" },
];

const cid = () =>
  `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
const gid = () =>
  `g_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

function newCondition(): FilterCondition {
  return { id: cid(), parameter: "", operator: "", value: "" };
}
function newGroup(): FilterGroup {
  return { id: gid(), conditions: [newCondition()] };
}

export function FilterCard({ campaignId }: { campaignId: string }) {
  const [s, setS] = useSetting(campaignId, "filter");
  const patch = (p: Partial<FilterSettings>) => setS({ ...s, ...p });

  /* ── Group / condition mutators ─────────────────────────────────── */

  const updateGroup = (gIndex: number, next: FilterGroup) => {
    const groups = s.groups.map((g, i) => (i === gIndex ? next : g));
    patch({ groups });
  };
  const addGroup = () => patch({ groups: [...s.groups, newGroup()] });
  const removeGroup = (gIndex: number) => {
    const groups = s.groups.filter((_, i) => i !== gIndex);
    // Always keep at least one group in the tree so the UI stays meaningful.
    patch({ groups: groups.length > 0 ? groups : [newGroup()] });
  };
  const clearAll = () => patch({ groups: [newGroup()] });

  const addCondition = (gIndex: number) => {
    const g = s.groups[gIndex];
    updateGroup(gIndex, { ...g, conditions: [...g.conditions, newCondition()] });
  };
  const removeCondition = (gIndex: number, cIndex: number) => {
    const g = s.groups[gIndex];
    const conditions = g.conditions.filter((_, i) => i !== cIndex);
    // Each group needs at least one condition row to stay readable.
    updateGroup(gIndex, {
      ...g,
      conditions: conditions.length > 0 ? conditions : [newCondition()],
    });
  };
  const updateCondition = (
    gIndex: number,
    cIndex: number,
    patchCond: Partial<FilterCondition>,
  ) => {
    const g = s.groups[gIndex];
    const conditions = g.conditions.map((c, i) =>
      i === cIndex ? { ...c, ...patchCond } : c,
    );
    updateGroup(gIndex, { ...g, conditions });
  };

  const onSave = () => {
    // For demo purposes — in production this would also POST the settings
    // back to the server. We just toast a confirmation.
    toast.success("Filter saved");
  };

  return (
    <AdvancedSettingShell
      icon={FilterIcon}
      title="Filter"
      description="Set filter to deliver targeted audience."
      enabled={s.enabled}
      onEnabledChange={(enabled) => patch({ enabled })}
    >
      <div className="grid gap-5">
        {/* "Continue only if" — the header for the rule tree */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-foreground">
              Continue only if:
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              All groups of conditions are met.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={clearAll}
          >
            Clear all
          </Button>
        </div>

        {/* Rule tree — groups separated by AND */}
        <div className="space-y-2">
          {s.groups.map((g, gIdx) => (
            <div key={g.id}>
              <FilterGroupBlock
                group={g}
                showDelete={s.groups.length > 1}
                onUpdateCondition={(cIdx, p) => updateCondition(gIdx, cIdx, p)}
                onAddCondition={() => addCondition(gIdx)}
                onRemoveCondition={(cIdx) => removeCondition(gIdx, cIdx)}
                onRemoveGroup={() => removeGroup(gIdx)}
              />
              {gIdx < s.groups.length - 1 && (
                <div className="my-3 flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    AND
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addGroup}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-accent transition-colors hover:text-accent/80"
        >
          <Plus className="h-3.5 w-3.5" />
          Add group
        </button>

        {/* When the rule fails + Save */}
        <div className="border-t border-border pt-4">
          <div className="grid gap-1.5">
            <Label className="text-xs">When the rule fails</Label>
            <Select
              value={s.onFail}
              onValueChange={(v) =>
                patch({ onFail: v as FilterSettings["onFail"] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reject">Reject the call</SelectItem>
                <SelectItem value="voicemail">Send to voicemail</SelectItem>
                <SelectItem value="deadEnd">Send to dead-end</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mt-4 flex justify-end">
            <Button size="sm" onClick={onSave}>
              Save
            </Button>
          </div>
        </div>
      </div>
    </AdvancedSettingShell>
  );
}

/* ─── Group of conditions block ────────────────────────────────── */

function FilterGroupBlock({
  group,
  showDelete,
  onUpdateCondition,
  onAddCondition,
  onRemoveCondition,
  onRemoveGroup,
}: {
  group: FilterGroup;
  showDelete: boolean;
  onUpdateCondition: (cIdx: number, patch: Partial<FilterCondition>) => void;
  onAddCondition: () => void;
  onRemoveCondition: (cIdx: number) => void;
  onRemoveGroup: () => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-secondary/20 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Group of conditions
        </div>
        {showDelete && (
          <button
            type="button"
            onClick={onRemoveGroup}
            aria-label="Delete group"
            className="inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="space-y-2">
        {group.conditions.map((c, cIdx) => (
          <div key={c.id}>
            <ConditionRow
              condition={c}
              onUpdate={(patch) => onUpdateCondition(cIdx, patch)}
              onRemove={() => onRemoveCondition(cIdx)}
              showRemove={group.conditions.length > 1}
            />
            {cIdx < group.conditions.length - 1 && (
              <div className="my-1.5 ml-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                OR
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onAddCondition}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-accent transition-colors hover:text-accent/80"
      >
        <Plus className="h-3.5 w-3.5" />
        Add condition
      </button>
    </div>
  );
}

/* ─── Single PARAMETER · OPERATOR · VALUE row ──────────────────── */

function ConditionRow({
  condition,
  onUpdate,
  onRemove,
  showRemove,
}: {
  condition: FilterCondition;
  onUpdate: (patch: Partial<FilterCondition>) => void;
  onRemove: () => void;
  showRemove: boolean;
}) {
  // Some operators don't need a right-hand value (exists / does not exist).
  // We grey-out the value cell in those cases.
  const valueDisabled =
    condition.operator === "exists" || condition.operator === "notExists";

  return (
    <div className="grid grid-cols-1 items-end gap-2 md:grid-cols-[1fr_1fr_1fr_auto]">
      <div className="grid gap-1">
        <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Parameter
        </Label>
        <Select
          value={condition.parameter}
          onValueChange={(v) => onUpdate({ parameter: v })}
        >
          <SelectTrigger size="sm">
            <SelectValue placeholder="Select parameter" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {FILTER_PARAMETERS.map((g) => (
              <SelectGroup key={g.group}>
                <SelectLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {g.group}
                </SelectLabel>
                {g.items.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1">
        <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Operator
        </Label>
        <Select
          value={condition.operator}
          onValueChange={(v) => onUpdate({ operator: v })}
        >
          <SelectTrigger size="sm">
            <SelectValue placeholder="Select operator" />
          </SelectTrigger>
          <SelectContent>
            {FILTER_OPERATORS.map((op) => (
              <SelectItem key={op.value} value={op.value}>
                {op.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1">
        <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Value
        </Label>
        <Input
          value={condition.value}
          onChange={(e) => onUpdate({ value: e.target.value })}
          placeholder={valueDisabled ? "—" : "Type value"}
          disabled={valueDisabled}
          className={cn("h-9 text-xs", valueDisabled && "opacity-50")}
        />
      </div>

      <button
        type="button"
        onClick={onRemove}
        disabled={!showRemove}
        aria-label="Remove condition"
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors",
          showRemove
            ? "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            : "cursor-not-allowed text-muted-foreground/30",
        )}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ─── 5. VoIP Shield ───────────────────────────────────────────── */

export function VoipShieldCard({ campaignId }: { campaignId: string }) {
  const [s, setS] = useSetting(campaignId, "voipShield");
  const patch = (p: Partial<VoipShieldSettings>) => setS({ ...s, ...p });

  return (
    <AdvancedSettingShell
      icon={Shield}
      title="VoIP Shield"
      description="Block incoming VoIP callers."
      enabled={s.enabled}
      onEnabledChange={(enabled) => patch({ enabled })}
    >
      <div className="grid gap-4">
        <ToggleRow
          label="Block all VoIP callers"
          checked={s.blockAllVoip}
          onChange={(blockAllVoip) => patch({ blockAllVoip })}
        />
        <div className="grid gap-1.5">
          <Label className="text-xs">Allow-list providers (comma-separated)</Label>
          <Input
            placeholder="twilio, bandwidth, telnyx"
            value={s.allowList}
            onChange={(e) => patch({ allowList: e.target.value })}
          />
        </div>
        <div className="grid gap-1.5">
          <Label className="text-xs">Blocked-call action</Label>
          <Select value={s.action} onValueChange={(v) => patch({ action: v as VoipShieldSettings["action"] })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="drop">Drop the call</SelectItem>
              <SelectItem value="voicemail">Send to voicemail</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </AdvancedSettingShell>
  );
}

/* ─── 6. Business Hours ────────────────────────────────────────── */

export function BusinessHoursCard({ campaignId }: { campaignId: string }) {
  const [s, setS] = useSetting(campaignId, "businessHours");
  const patch = (p: Partial<BusinessHoursSettings>) => setS({ ...s, ...p });
  const toggleDay = (d: number) => {
    const has = s.days.includes(d);
    patch({ days: has ? s.days.filter((x) => x !== d) : [...s.days, d].sort() });
  };

  return (
    <AdvancedSettingShell
      icon={ClockAlert}
      title="Business Hours"
      description="Control how your campaign works at different times of day."
      enabled={s.enabled}
      onEnabledChange={(enabled) => patch({ enabled })}
    >
      <div className="grid gap-4">
        <div>
          <Label className="text-xs">Days</Label>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {DAYS.map((d) => {
              const on = s.days.includes(d.id);
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => toggleDay(d.id)}
                  className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                    on ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
                  }`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <NumField label="Start hour" value={s.startHour} onChange={(v) => patch({ startHour: v })} min={0} suffix=":00" />
          <NumField label="End hour" value={s.endHour} onChange={(v) => patch({ endHour: v })} min={0} suffix=":00" />
          <div className="grid gap-1.5">
            <Label className="text-xs">Timezone</Label>
            <Select value={s.timezone} onValueChange={(timezone) => patch({ timezone })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Caller-local</SelectItem>
                <SelectItem value="America/New_York">Eastern</SelectItem>
                <SelectItem value="America/Chicago">Central</SelectItem>
                <SelectItem value="America/Denver">Mountain</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label className="text-xs">Outside-hours action</Label>
          <Select
            value={s.outsideHoursAction}
            onValueChange={(v) =>
              patch({ outsideHoursAction: v as BusinessHoursSettings["outsideHoursAction"] })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="voicemail">Send to voicemail</SelectItem>
              <SelectItem value="reject">Reject the call</SelectItem>
              <SelectItem value="rollover">Roll over to next campaign</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </AdvancedSettingShell>
  );
}

/* ─── 7. Greetings Message ─────────────────────────────────────── */

export function GreetingsMessageCard({ campaignId }: { campaignId: string }) {
  const [s, setS] = useSetting(campaignId, "greetingsMessage");
  const patch = (p: Partial<GreetingsMessageSettings>) => setS({ ...s, ...p });

  return (
    <AdvancedSettingShell
      icon={Speech}
      title="Greetings Message"
      description="Play a message to the caller. Usually used to notify the caller about call recording."
      enabled={s.enabled}
      onEnabledChange={(enabled) => patch({ enabled })}
    >
      <div className="grid gap-4">
        <div className="grid gap-1.5">
          <Label className="text-xs">Message (TTS)</Label>
          <Textarea
            rows={3}
            value={s.message}
            onChange={(e) => patch({ message: e.target.value })}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label className="text-xs">Voice</Label>
            <Select value={s.voice} onValueChange={(v) => patch({ voice: v as GreetingsMessageSettings["voice"] })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="male">Male</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ToggleRow
            label="Play before connecting"
            checked={s.playBeforeConnect}
            onChange={(playBeforeConnect) => patch({ playBeforeConnect })}
          />
        </div>
      </div>
    </AdvancedSettingShell>
  );
}

/* ─── 8. Voicemail ─────────────────────────────────────────────── */

export function VoicemailCard({ campaignId }: { campaignId: string }) {
  const [s, setS] = useSetting(campaignId, "voicemail");
  const patch = (p: Partial<VoicemailSettings>) => setS({ ...s, ...p });

  return (
    <AdvancedSettingShell
      icon={VoicemailIcon}
      title="Voicemail"
      description="Customize the campaign's voicemail for when you miss a call."
      enabled={s.enabled}
      onEnabledChange={(enabled) => patch({ enabled })}
    >
      <div className="grid gap-4">
        <div className="grid gap-1.5">
          <Label className="text-xs">Greeting</Label>
          <Textarea
            rows={2}
            value={s.greeting}
            onChange={(e) => patch({ greeting: e.target.value })}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <NumField
            label="Max recording length"
            value={s.maxLengthSec}
            onChange={(v) => patch({ maxLengthSec: v })}
            suffix="sec"
          />
          <div className="grid gap-1.5">
            <Label className="text-xs">Notification email</Label>
            <Input
              type="email"
              placeholder="ops@example.com"
              value={s.notificationEmail}
              onChange={(e) => patch({ notificationEmail: e.target.value })}
            />
          </div>
        </div>
      </div>
    </AdvancedSettingShell>
  );
}

/* ─── 9. Whisper Message ───────────────────────────────────────── */

export function WhisperMessageCard({ campaignId }: { campaignId: string }) {
  const [s, setS] = useSetting(campaignId, "whisperMessage");
  const patch = (p: Partial<WhisperMessageSettings>) => setS({ ...s, ...p });

  return (
    <AdvancedSettingShell
      icon={MessagesSquare}
      title="Whisper Message"
      description="Create customized messages for your destinations."
      enabled={s.enabled}
      onEnabledChange={(enabled) => patch({ enabled })}
    >
      <div className="grid gap-1.5">
        <Label className="text-xs">Whisper text (played to the buyer agent before connecting)</Label>
        <Textarea
          rows={3}
          value={s.message}
          onChange={(e) => patch({ message: e.target.value })}
        />
      </div>
    </AdvancedSettingShell>
  );
}

/* ─── 10. Cap Settings ─────────────────────────────────────────── */

export function CapSettingsCard({ campaignId }: { campaignId: string }) {
  const [s, setS] = useSetting(campaignId, "capSettings");
  const patch = (p: Partial<CapSettings>) => setS({ ...s, ...p });

  return (
    <AdvancedSettingShell
      icon={ListChecks}
      title="Cap Settings"
      description="Manage capacity limits for campaign."
      enabled={s.enabled}
      onEnabledChange={(enabled) => patch({ enabled })}
    >
      <div className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <NumField label="Hourly cap" value={s.hourlyCap} onChange={(v) => patch({ hourlyCap: v })} />
          <NumField label="Daily cap" value={s.dailyCap} onChange={(v) => patch({ dailyCap: v })} />
          <NumField label="Monthly cap" value={s.monthlyCap} onChange={(v) => patch({ monthlyCap: v })} />
        </div>
        <div className="grid gap-1.5">
          <Label className="text-xs">Scope</Label>
          <Select value={s.scope} onValueChange={(v) => patch({ scope: v as CapSettings["scope"] })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="campaign">Apply to entire campaign</SelectItem>
              <SelectItem value="destination">Apply to each destination</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-muted-foreground">
          Use <span className="font-mono">0</span> for unlimited on any field.
        </p>
      </div>
    </AdvancedSettingShell>
  );
}

/* ─── 11. Revenue Saver ────────────────────────────────────────── */

export function RevenueSaverCard({ campaignId }: { campaignId: string }) {
  const [s, setS] = useSetting(campaignId, "revenueSaver");
  const patch = (p: Partial<RevenueSaverSettings>) => setS({ ...s, ...p });

  return (
    <AdvancedSettingShell
      icon={Sparkles}
      title="Revenue Saver"
      description="Automatically reroutes short or dropped calls to recover revenue."
      enabled={s.enabled}
      onEnabledChange={(enabled) => patch({ enabled })}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <NumField
          label="Minimum revenue threshold"
          value={s.minRevenue}
          onChange={(v) => patch({ minRevenue: v })}
          suffix="$"
        />
        <div className="grid gap-1.5">
          <Label className="text-xs">Fallback action</Label>
          <Select
            value={s.fallback}
            onValueChange={(v) => patch({ fallback: v as RevenueSaverSettings["fallback"] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="deadEnd">Dead-end the call</SelectItem>
              <SelectItem value="voicemail">Send to voicemail</SelectItem>
              <SelectItem value="reroute">Reroute to another campaign</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {s.fallback === "reroute" && (
          <div className="grid gap-1.5 sm:col-span-2">
            <Label className="text-xs">Reroute campaign ID</Label>
            <Input
              placeholder="c_xxxxx"
              value={s.rerouteCampaignId}
              onChange={(e) => patch({ rerouteCampaignId: e.target.value })}
              className="font-mono"
            />
          </div>
        )}
      </div>
    </AdvancedSettingShell>
  );
}

/* ─── 12. Concurrency Settings ─────────────────────────────────── */

export function ConcurrencyCard({ campaignId }: { campaignId: string }) {
  const [s, setS] = useSetting(campaignId, "concurrency");
  const patch = (p: Partial<ConcurrencySettings>) => setS({ ...s, ...p });

  return (
    <AdvancedSettingShell
      icon={Timer}
      title="Concurrency Settings"
      description="Limit the quantity of concurrent calls."
      enabled={s.enabled}
      onEnabledChange={(enabled) => patch({ enabled })}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <NumField
          label="Max concurrent calls"
          value={s.maxConcurrent}
          onChange={(v) => patch({ maxConcurrent: v })}
        />
        <div className="grid gap-1.5">
          <Label className="text-xs">Overflow action</Label>
          <Select
            value={s.overflowAction}
            onValueChange={(v) =>
              patch({ overflowAction: v as ConcurrencySettings["overflowAction"] })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="queue">Queue the call</SelectItem>
              <SelectItem value="reject">Reject the call</SelectItem>
              <SelectItem value="voicemail">Send to voicemail</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </AdvancedSettingShell>
  );
}

/* ─── Aggregator ───────────────────────────────────────────────── */

export function AdvancedSettingsList({ campaignId }: { campaignId: string }) {
  return (
    <div className="space-y-2">
      <CallQueueCard campaignId={campaignId} />
      <AutoRecordCard campaignId={campaignId} />
      <SpamFilterCard campaignId={campaignId} />
      <FilterCard campaignId={campaignId} />
      <VoipShieldCard campaignId={campaignId} />
      <BusinessHoursCard campaignId={campaignId} />
      <GreetingsMessageCard campaignId={campaignId} />
      <VoicemailCard campaignId={campaignId} />
      <WhisperMessageCard campaignId={campaignId} />
      <CapSettingsCard campaignId={campaignId} />
      <RevenueSaverCard campaignId={campaignId} />
      <ConcurrencyCard campaignId={campaignId} />
    </div>
  );
}
