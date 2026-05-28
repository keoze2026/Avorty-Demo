/**
 * Generic export helpers — feed any row set + column definitions and get a
 * CSV or XLSX download. Both formats share one column shape so individual
 * tables don't have to maintain two parallel mappings.
 */

import { toXLSX, type ExportColumn } from "./export-xlsx";

export type ExportFormat = "csv" | "xlsx";
export type { ExportColumn } from "./export-xlsx";

/* ===========================================================
   CSV
   =========================================================== */

function escapeCsv(value: unknown): string {
  if (value === undefined || value === null) return "";
  const s = typeof value === "string" ? value : String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function toCSV<T>(columns: ExportColumn<T>[], rows: T[]): string {
  const header = columns.map((c) => escapeCsv(c.label)).join(",");
  const body = rows
    .map((row) => columns.map((c) => escapeCsv(c.value(row))).join(","))
    .join("\n");
  return body ? `${header}\n${body}` : header;
}

/* ===========================================================
   Browser download
   =========================================================== */

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Slug-safe filename stem with today's ISO date appended. */
export function dateStamped(stem: string): string {
  return `${stem}-${new Date().toISOString().slice(0, 10)}`;
}

/**
 * Export `rows` as CSV or XLSX using the provided column definitions.
 * The filename should NOT include the extension — it's added based on format.
 */
export function downloadRows<T>(
  format: ExportFormat,
  columns: ExportColumn<T>[],
  rows: T[],
  filenameStem: string,
  sheetName = "Sheet1",
) {
  if (format === "csv") {
    const blob = new Blob([toCSV(columns, rows)], {
      type: "text/csv;charset=utf-8;",
    });
    triggerDownload(blob, `${filenameStem}.csv`);
  } else {
    const blob = toXLSX(columns, rows, sheetName);
    triggerDownload(blob, `${filenameStem}.xlsx`);
  }
}
