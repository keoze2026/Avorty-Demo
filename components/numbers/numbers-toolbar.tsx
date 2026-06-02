"use client";

import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/hooks/use-translation";
import type { NumberStatus, NumberType } from "@/lib/types";

interface Props {
  query: string;
  onQuery: (q: string) => void;
  type: "all" | NumberType;
  onType: (t: Props["type"]) => void;
  status: "all" | NumberStatus;
  onStatus: (s: Props["status"]) => void;
  /** Right-side label (e.g. "8 of 36") */
  countLabel?: string;
}

export function NumbersToolbar({ query, onQuery, type, onType, status, onStatus, countLabel }: Props) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={t("trafficUI.numbers.toolbar.searchPlaceholder")}
          className="h-9 w-72 pl-8"
        />
        {query && (
          <button
            type="button"
            onClick={() => onQuery("")}
            aria-label={t("trafficUI.common.clearSearch")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <Select value={type} onValueChange={(v) => onType(v as Props["type"])}>
        <SelectTrigger size="sm" className="h-9 w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("trafficUI.numbers.statusOptions.allTypes")}</SelectItem>
          <SelectItem value="local">{t("trafficUI.numbers.typeOptions.local")}</SelectItem>
          <SelectItem value="tollfree">{t("trafficUI.numbers.typeOptions.tollfree")}</SelectItem>
          <SelectItem value="international">{t("trafficUI.numbers.typeOptions.international")}</SelectItem>
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={(v) => onStatus(v as Props["status"])}>
        <SelectTrigger size="sm" className="h-9 w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("trafficUI.numbers.statusOptions.allStatuses")}</SelectItem>
          <SelectItem value="active">{t("trafficUI.numbers.statusOptions.active")}</SelectItem>
          <SelectItem value="paused">{t("trafficUI.numbers.statusOptions.paused")}</SelectItem>
          <SelectItem value="pending">{t("trafficUI.numbers.statusOptions.pending")}</SelectItem>
          <SelectItem value="expired">{t("trafficUI.numbers.statusOptions.expired")}</SelectItem>
        </SelectContent>
      </Select>

      {countLabel && (
        <span className="ml-auto text-[11px] font-mono text-muted-foreground">{countLabel}</span>
      )}
    </div>
  );
}
