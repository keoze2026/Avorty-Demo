import { PageHeaderSkeleton } from "@/components/shared/loading-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function CallsLoading() {
  return (
    <>
      <PageHeaderSkeleton width="9rem" />

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-9 w-28" />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border">
        <Skeleton className="h-10 w-full rounded-none" />
        <div className="space-y-px">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-none" />
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-end">
        <Skeleton className="h-8 w-48" />
      </div>
    </>
  );
}
