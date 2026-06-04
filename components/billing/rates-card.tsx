"use client";

/**
 * Rates — per-country price card.
 *
 * Shows the tariff Avortyx charges for each metered line item (number rentals,
 * per-minute usage, recording, shield checks, etc.) for the selected country.
 * Switching the country in the dropdown swaps the rate tiles below.
 *
 * Numbers are mocked but realistic; the structure mirrors what an admin would
 * see on a real billing portal.
 */

import * as React from "react";
import {
  AudioLines,
  Cable,
  Mic,
  PhoneIncoming,
  PhoneOff,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/hooks/use-translation";

const PhoneStop = PhoneOff;

interface RateRow {
  key: string;
  label: string;
  amount: number;
  /** Suffix — "/number", "/minute", "/call". */
  unit: string;
  icon: React.ElementType;
  decimals: number;
}

const COUNTRIES = [
  { code: "US", label: "United States" },
  { code: "CA", label: "Canada" },
  { code: "UK", label: "United Kingdom" },
  { code: "AU", label: "Australia" },
];

/** Tariff lookup keyed by ISO code. Values are the displayed dollar amount. */
const RATES_BY_COUNTRY: Record<string, RateRow[]> = {
  US: [
    { key: "rent-local", label: "Rent Local Number", amount: 3.0, unit: "/number", icon: PhoneIncoming, decimals: 4 },
    { key: "rent-tf", label: "Rent Toll Free Number", amount: 1.0, unit: "/number", icon: PhoneIncoming, decimals: 4 },
    { key: "min-local", label: "Minute Local Number", amount: 0.04, unit: "/minute", icon: AudioLines, decimals: 4 },
    { key: "min-tf", label: "Minute Toll Free Number", amount: 0.035, unit: "/minute", icon: AudioLines, decimals: 4 },
    { key: "min-byoc", label: "Minute BYOC Number", amount: 0.045, unit: "/minute", icon: Cable, decimals: 4 },
    { key: "rec", label: "Minute Call Recording", amount: 0.0025, unit: "/minute", icon: Mic, decimals: 4 },
    { key: "voip", label: "VoIP Shield", amount: 0.01, unit: "/call", icon: ShieldCheck, decimals: 4 },
    { key: "reject", label: "Rejected Call", amount: 0.015, unit: "/call", icon: PhoneStop, decimals: 4 },
    { key: "identity", label: "Caller Identity", amount: 0.14, unit: "/call", icon: UserCheck, decimals: 4 },
  ],
  CA: [
    { key: "rent-local", label: "Rent Local Number", amount: 3.5, unit: "/number", icon: PhoneIncoming, decimals: 4 },
    { key: "rent-tf", label: "Rent Toll Free Number", amount: 1.25, unit: "/number", icon: PhoneIncoming, decimals: 4 },
    { key: "min-local", label: "Minute Local Number", amount: 0.045, unit: "/minute", icon: AudioLines, decimals: 4 },
    { key: "min-tf", label: "Minute Toll Free Number", amount: 0.04, unit: "/minute", icon: AudioLines, decimals: 4 },
    { key: "min-byoc", label: "Minute BYOC Number", amount: 0.05, unit: "/minute", icon: Cable, decimals: 4 },
    { key: "rec", label: "Minute Call Recording", amount: 0.0025, unit: "/minute", icon: Mic, decimals: 4 },
    { key: "voip", label: "VoIP Shield", amount: 0.012, unit: "/call", icon: ShieldCheck, decimals: 4 },
    { key: "reject", label: "Rejected Call", amount: 0.018, unit: "/call", icon: PhoneStop, decimals: 4 },
    { key: "identity", label: "Caller Identity", amount: 0.15, unit: "/call", icon: UserCheck, decimals: 4 },
  ],
  UK: [
    { key: "rent-local", label: "Rent Local Number", amount: 4.0, unit: "/number", icon: PhoneIncoming, decimals: 4 },
    { key: "rent-tf", label: "Rent Toll Free Number", amount: 1.5, unit: "/number", icon: PhoneIncoming, decimals: 4 },
    { key: "min-local", label: "Minute Local Number", amount: 0.05, unit: "/minute", icon: AudioLines, decimals: 4 },
    { key: "min-tf", label: "Minute Toll Free Number", amount: 0.045, unit: "/minute", icon: AudioLines, decimals: 4 },
    { key: "min-byoc", label: "Minute BYOC Number", amount: 0.055, unit: "/minute", icon: Cable, decimals: 4 },
    { key: "rec", label: "Minute Call Recording", amount: 0.003, unit: "/minute", icon: Mic, decimals: 4 },
    { key: "voip", label: "VoIP Shield", amount: 0.014, unit: "/call", icon: ShieldCheck, decimals: 4 },
    { key: "reject", label: "Rejected Call", amount: 0.02, unit: "/call", icon: PhoneStop, decimals: 4 },
    { key: "identity", label: "Caller Identity", amount: 0.17, unit: "/call", icon: UserCheck, decimals: 4 },
  ],
  AU: [
    { key: "rent-local", label: "Rent Local Number", amount: 3.75, unit: "/number", icon: PhoneIncoming, decimals: 4 },
    { key: "rent-tf", label: "Rent Toll Free Number", amount: 1.4, unit: "/number", icon: PhoneIncoming, decimals: 4 },
    { key: "min-local", label: "Minute Local Number", amount: 0.048, unit: "/minute", icon: AudioLines, decimals: 4 },
    { key: "min-tf", label: "Minute Toll Free Number", amount: 0.042, unit: "/minute", icon: AudioLines, decimals: 4 },
    { key: "min-byoc", label: "Minute BYOC Number", amount: 0.052, unit: "/minute", icon: Cable, decimals: 4 },
    { key: "rec", label: "Minute Call Recording", amount: 0.0028, unit: "/minute", icon: Mic, decimals: 4 },
    { key: "voip", label: "VoIP Shield", amount: 0.013, unit: "/call", icon: ShieldCheck, decimals: 4 },
    { key: "reject", label: "Rejected Call", amount: 0.017, unit: "/call", icon: PhoneStop, decimals: 4 },
    { key: "identity", label: "Caller Identity", amount: 0.16, unit: "/call", icon: UserCheck, decimals: 4 },
  ],
};

export function RatesCard() {
  const { t } = useTranslation();
  const [country, setCountry] = React.useState("US");
  const rates = RATES_BY_COUNTRY[country] ?? RATES_BY_COUNTRY.US;

  return (
    <Card className="p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight">{t("billing.rates")}</h2>
        <Select value={country} onValueChange={setCountry}>
          <SelectTrigger className="w-[12rem]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((c) => {
              const key = `billing.countries.${c.code}`;
              const resolved = t(key);
              return (
                <SelectItem key={c.code} value={c.code}>
                  {resolved === key ? c.label : resolved}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <ul className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
          {rates.map((r, i) => (
            <RateTile
              key={r.key}
              row={r}
              borderClass={borderFor(i, rates.length)}
              t={t}
            />
          ))}
        </ul>
      </div>
    </Card>
  );
}

/* ─── Per-tile presentation ──────────────────────────────────────────── */

function RateTile({
  row,
  borderClass,
  t,
}: {
  row: RateRow;
  borderClass: string;
  t: (key: string) => string;
}) {
  const Icon = row.icon;
  const key = `billing.rateRows.${row.key}`;
  const resolved = t(key);
  const label = resolved === key ? row.label : resolved;
  return (
    <li className={`flex flex-col gap-1 p-4 ${borderClass}`}>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-accent" />
        {label}
      </div>
      <div className="flex items-baseline gap-0.5 font-mono text-lg font-semibold tabular-nums">
        ${row.amount.toFixed(row.decimals)}
        <span className="text-xs font-normal text-muted-foreground">
          {row.unit}
        </span>
      </div>
    </li>
  );
}

/* Pick the right inner-border classes for the responsive grid so tiles read
 * as a clean matrix on every breakpoint (1 / 2 / 4 columns). */
function borderFor(index: number, total: number): string {
  // 4-col grid on lg: right border except last col + bottom border except last row.
  const lg = `lg:border-r lg:border-border ${
    (index + 1) % 4 === 0 ? "lg:!border-r-0" : ""
  } ${index < total - (total % 4 === 0 ? 4 : total % 4) ? "lg:border-b" : ""}`;
  // 2-col grid on sm: right border on left column + bottom border except last row.
  const sm = `sm:border-r sm:border-border ${
    (index + 1) % 2 === 0 ? "sm:!border-r-0" : ""
  } ${index < total - (total % 2 === 0 ? 2 : 1) ? "sm:border-b" : ""}`;
  return `${sm} ${lg}`;
}
