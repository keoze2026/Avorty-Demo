/**
 * Backwards-compatible alias — the toolbar moved to
 * `components/shared/table-toolbar.tsx` so non-suppression list pages
 * (Track Numbers etc.) can reuse it without a confusing import path.
 */

export {
  TableToolbar as SuppressionToolbar,
  PAGE_SIZE_OPTIONS,
  type ColumnOption,
  type FilterOption,
  type PageSize,
  type SortOption,
} from "@/components/shared/table-toolbar";
