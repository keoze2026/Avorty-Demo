"use client";

import * as React from "react";
import { FileSpreadsheet, FileText } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/hooks/use-translation";
import type { ExportFormat } from "@/lib/export";

interface ExportMenuProps {
  /** The trigger element (e.g. a Button). Rendered via Radix `asChild`. */
  children: React.ReactNode;
  onExport: (format: ExportFormat) => void;
  align?: "start" | "center" | "end";
}

/**
 * Dropdown surfaced behind every "Export" button in the panel. Two formats
 * only — CSV (universal, plain-text) and XLSX (Excel-native, preserves
 * numeric typing).
 */
export function ExportMenu({ children, onExport, align = "end" }: ExportMenuProps) {
  const { t } = useTranslation();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-44">
        <DropdownMenuItem onSelect={() => onExport("csv")}>
          <FileText className="h-4 w-4" /> {t("sharedUI.exportMenu.csv")}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onExport("xlsx")}>
          <FileSpreadsheet className="h-4 w-4" /> {t("sharedUI.exportMenu.xlsx")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
