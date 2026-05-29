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
  Shield,
  ShieldX,
  Sparkles,
  Speech,
  Timer,
  Voicemail as VoicemailIcon,
} from "lucide-react";

import { AdvancedSettingShell } from "./advanced-setting-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
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
  FilterSettings,
  GreetingsMessageSettings,
  RevenueSaverSettings,
  SpamFilterSettings,
  VoicemailSettings,
  VoipShieldSettings,
  WhisperMessageSettings,
} from "@/lib/types";

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

export function FilterCard({ campaignId }: { campaignId: string }) {
  const [s, setS] = useSetting(campaignId, "filter");
  const patch = (p: Partial<FilterSettings>) => setS({ ...s, ...p });

  return (
    <AdvancedSettingShell
      icon={FilterIcon}
      title="Filter"
      description="Set filter to deliver targeted audience."
      enabled={s.enabled}
      onEnabledChange={(enabled) => patch({ enabled })}
    >
      <div className="grid gap-4">
        <div className="grid gap-1.5">
          <Label className="text-xs">Rule expression</Label>
          <Textarea
            rows={3}
            placeholder='e.g. caller.state in ["TX","CA"] && caller.duration > 60'
            value={s.rule}
            onChange={(e) => patch({ rule: e.target.value })}
            className="font-mono text-xs"
          />
        </div>
        <div className="grid gap-1.5">
          <Label className="text-xs">When the rule fails</Label>
          <Select value={s.onFail} onValueChange={(v) => patch({ onFail: v as FilterSettings["onFail"] })}>
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
      </div>
    </AdvancedSettingShell>
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
