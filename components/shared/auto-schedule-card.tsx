"use client";

/**
 * AutoScheduleCard — opt-in daily play / pause schedule for a single
 * campaign, buyer, or destination. Values are stored in the auto-schedule
 * store and evaluated by the schedule runtime every minute against the
 * portal's configured timezone.
 */

import * as React from "react";
import { Clock, Globe2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  PORTAL_TIMEZONES,
  formatTime12,
  to12h,
  to24h,
  type AutoSchedule,
  type ScheduleTarget,
} from "@/lib/store/auto-schedule-store";
import { useAutoScheduleStore } from "@/lib/store/auto-schedule-store";

interface Props {
  target: ScheduleTarget;
  id: string;
  /** Optional label tweak for the description text ("campaign" / "buyer" / "destination"). */
  entityLabel?: string;
}

const HOURS_12 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export function AutoScheduleCard({ target, id, entityLabel }: Props) {
  const schedule = useAutoScheduleStore((s) =>
    target === "campaign"
      ? s.campaignSchedules[id]
      : target === "buyer"
        ? s.buyerSchedules[id]
        : s.destinationSchedules[id],
  ) ?? { enabled: false, playHour: 8, pauseHour: 17 };
  const portalTimezone = useAutoScheduleStore((s) => s.portalTimezone);
  const setSchedule = useAutoScheduleStore((s) => s.setSchedule);

  const update = (patch: Partial<AutoSchedule>) => {
    setSchedule(target, id, { ...schedule, ...patch });
  };

  const play = to12h(schedule.playHour);
  const pause = to12h(schedule.pauseHour);

  const labelNoun = entityLabel ?? target;
  const tzLabel =
    PORTAL_TIMEZONES.find((t) => t.iana === portalTimezone)?.label ?? portalTimezone;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-foreground">
            <Clock className="mr-1.5 inline h-3 w-3 text-accent" />
            Auto schedule
          </h3>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Automatically play and pause this {labelNoun} based on the portal time zone.
          </p>
        </div>
        <Switch
          checked={schedule.enabled}
          onCheckedChange={(v) => update({ enabled: Boolean(v) })}
          aria-label="Enable auto schedule"
        />
      </div>

      <div className="my-4 h-px w-full bg-border" />

      <div
        className={
          schedule.enabled
            ? ""
            : "pointer-events-none select-none opacity-50"
        }
        aria-disabled={!schedule.enabled}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Play time */}
          <TimeField
            label="Play at"
            hint={`Switch this ${labelNoun} to active`}
            hour={play.hour}
            period={play.period}
            onChange={(h, p) => update({ playHour: to24h(h, p) })}
          />
          {/* Pause time */}
          <TimeField
            label="Pause at"
            hint={`Switch this ${labelNoun} to paused`}
            hour={pause.hour}
            period={pause.period}
            onChange={(h, p) => update({ pauseHour: to24h(h, p) })}
          />
        </div>

        <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-secondary/40 px-3 py-2">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Globe2 className="h-3 w-3" />
            Portal time zone
          </span>
          <span className="text-xs font-medium text-foreground">{tzLabel}</span>
        </div>

        <p className="mt-2 text-[11px] text-muted-foreground">
          Currently scheduled: <span className="font-medium text-foreground">{formatTime12(schedule.playHour)}</span>
          {" → "}
          <span className="font-medium text-foreground">{formatTime12(schedule.pauseHour)}</span>
          {schedule.playHour === schedule.pauseHour && (
            <span className="ml-1 text-destructive">(play and pause times must differ)</span>
          )}
        </p>
      </div>
    </Card>
  );
}

/* ─── 12-hour time field (hour Select + AM/PM Select) ────────────────── */

function TimeField({
  label,
  hint,
  hour,
  period,
  onChange,
}: {
  label: string;
  hint: string;
  hour: number;
  period: "AM" | "PM";
  onChange: (hour: number, period: "AM" | "PM") => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      <p className="text-[11px] text-muted-foreground">{hint}</p>
      <div className="mt-1 flex items-center gap-2">
        <Select
          value={String(hour)}
          onValueChange={(v) => onChange(Number(v), period)}
        >
          <SelectTrigger className="h-9 w-20 tabular-nums">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {HOURS_12.map((h) => (
              <SelectItem key={h} value={String(h)}>
                {h}:00
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={period}
          onValueChange={(v) => onChange(hour, v as "AM" | "PM")}
        >
          <SelectTrigger className="h-9 w-16">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AM">AM</SelectItem>
            <SelectItem value="PM">PM</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
