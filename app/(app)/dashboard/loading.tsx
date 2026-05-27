import { PageHeaderSkeleton } from "@/components/shared/loading-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <>
      <PageHeaderSkeleton width="9rem" />

      {/* Row 1 — Calls chart (left) + KPIs over donut (right) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-96 rounded-xl lg:col-span-2" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>

      {/* Row 2 — Top campaigns + Revenue */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-96 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>

      {/* Row 3 — Campaign summary table */}
      <div className="overflow-hidden rounded-xl border border-border">
        <Skeleton className="h-16 w-full rounded-none" />
        <Skeleton className="h-12 w-full rounded-none" />
        <div className="space-y-px">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-none" />
          ))}
        </div>
      </div>
    </>
  );
}
