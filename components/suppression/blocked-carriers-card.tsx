"use client";

import * as React from "react";
import { Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { COMMON_CARRIERS } from "@/lib/mock/suppression";
import {
  PAGE_SIZE_OPTIONS,
  type PageSize,
} from "@/components/suppression/suppression-toolbar";
import { useTranslation } from "@/hooks/use-translation";

interface Props {
  carriers: string[];
  onBlock: (carrier: string) => void;
  onUnblock: (carrier: string) => void;
}

/** Card showing the carriers currently blocked by this shield. */
export function BlockedCarriersCard({ carriers, onBlock, onUnblock }: Props) {
  const { t } = useTranslation();
  const [query, setQuery] = React.useState("");
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [pageSize, setPageSize] = React.useState<PageSize>(PAGE_SIZE_OPTIONS[1]);
  const [blockOpen, setBlockOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return carriers;
    return carriers.filter((c) => c.toLowerCase().includes(q));
  }, [carriers, query]);

  const visible = filtered.slice(0, pageSize);
  const allChecked = visible.length > 0 && visible.every((c) => selected.has(c));

  const toggle = (c: string) =>
    setSelected((curr) => {
      const next = new Set(curr);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });

  const toggleAll = () =>
    setSelected((curr) => {
      const next = new Set(curr);
      if (allChecked) visible.forEach((c) => next.delete(c));
      else visible.forEach((c) => next.add(c));
      return next;
    });

  const handleUnblock = (carrier: string) => {
    onUnblock(carrier);
    setSelected((curr) => {
      const next = new Set(curr);
      next.delete(carrier);
      return next;
    });
    toast.success(t("toolsUI.suppression.blockedCarriers.toastUnblocked").replace("{carrier}", carrier));
  };

  return (
    <Card className="p-5">
      <div className="mb-1">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-foreground">
          {t("toolsUI.suppression.blockedCarriers.title")}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">{t("toolsUI.suppression.blockedCarriers.description")}</p>
      </div>

      <div className="my-4 h-px w-full bg-border" />

      <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
        {searchOpen || query ? (
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("toolsUI.suppression.blockedCarriers.searchPlaceholder")}
              className="h-9 w-56 pl-7 pr-7 text-xs"
            />
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSearchOpen(false);
              }}
              aria-label={t("toolsUI.suppression.aria.closeSearch")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground"
            aria-label={t("toolsUI.suppression.aria.search")}
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-4 w-4" />
          </Button>
        )}

        <Select
          value={String(pageSize)}
          onValueChange={(v) => setPageSize(Number(v) as PageSize)}
        >
          <SelectTrigger size="sm" className="h-9 w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {PAGE_SIZE_OPTIONS.map((n) => (
              <SelectItem key={n} value={String(n)}>
                {t("toolsUI.suppression.onPage").replace("{n}", String(n))}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button size="sm" className="h-9" onClick={() => setBlockOpen(true)}>
          {t("toolsUI.suppression.blockedCarriers.blockCta")}
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4 w-10 text-left">
                <Checkbox
                  checked={allChecked}
                  onCheckedChange={toggleAll}
                  aria-label={t("toolsUI.suppression.aria.selectAll")}
                />
              </TableHead>
              <TableHead className="text-left">{t("toolsUI.suppression.columns.blockedCarrier")}</TableHead>
              <TableHead className="pr-4">{t("toolsUI.suppression.columns.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={3} className="py-8 text-center text-xs text-muted-foreground">
                  {t("toolsUI.suppression.noData")}
                </TableCell>
              </TableRow>
            ) : (
              visible.map((c) => (
                <TableRow key={c}>
                  <TableCell className="pl-4 text-left">
                    <Checkbox
                      checked={selected.has(c)}
                      onCheckedChange={() => toggle(c)}
                      aria-label={t("toolsUI.suppression.aria.selectRow").replace("{label}", c)}
                    />
                  </TableCell>
                  <TableCell className="text-left font-medium">{c}</TableCell>
                  <TableCell className="pr-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      aria-label={t("toolsUI.suppression.aria.unblockRow").replace("{label}", c)}
                      onClick={() => handleUnblock(c)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <BlockCarrierDialog
        open={blockOpen}
        onOpenChange={setBlockOpen}
        existing={carriers}
        onBlock={(carrier) => {
          onBlock(carrier);
          toast.success(t("toolsUI.suppression.blockedCarriers.toastBlocked").replace("{carrier}", carrier));
        }}
      />
    </Card>
  );
}

/* ─── Block Carrier dialog ────────────────────────────────────────────── */

interface BlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Already-blocked carriers — used to grey out duplicates in the picker. */
  existing: string[];
  onBlock: (carrier: string) => void;
}

function BlockCarrierDialog({ open, onOpenChange, existing, onBlock }: BlockDialogProps) {
  const { t } = useTranslation();
  const [custom, setCustom] = React.useState("");
  const [selected, setSelected] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      setCustom("");
      setSelected(null);
    }
  }, [open]);

  const existingSet = React.useMemo(() => new Set(existing), [existing]);
  const carrier = selected ?? custom.trim();
  const disabled = !carrier || existingSet.has(carrier);

  const onSubmit = () => {
    if (disabled) return;
    onBlock(carrier);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("toolsUI.suppression.blockedCarriers.dialogTitle")}</DialogTitle>
          <DialogDescription>
            {t("toolsUI.suppression.blockedCarriers.dialogDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-2">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {t("toolsUI.suppression.blockedCarriers.commonCarriers")}
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_CARRIERS.map((c) => {
                const alreadyBlocked = existingSet.has(c);
                const isSelected = selected === c;
                return (
                  <button
                    key={c}
                    type="button"
                    disabled={alreadyBlocked}
                    onClick={() => {
                      setSelected(c);
                      setCustom("");
                    }}
                    className={
                      "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium transition-colors " +
                      (alreadyBlocked
                        ? "cursor-not-allowed border-border bg-muted/40 text-muted-foreground/60 line-through"
                        : isSelected
                          ? "border-accent/50 bg-accent/15 text-foreground"
                          : "border-border bg-card text-muted-foreground hover:bg-secondary/40")
                    }
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-carrier">{t("toolsUI.suppression.blockedCarriers.customCarrier")}</Label>
            <Input
              id="custom-carrier"
              value={custom}
              onChange={(e) => {
                setCustom(e.target.value);
                setSelected(null);
              }}
              placeholder={t("toolsUI.suppression.blockedCarriers.customPlaceholder")}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSubmit();
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("toolsUI.suppression.blockedCarriers.cancel")}
          </Button>
          <Button onClick={onSubmit} disabled={disabled}>
            {t("toolsUI.suppression.blockedCarriers.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
