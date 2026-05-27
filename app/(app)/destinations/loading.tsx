import { PageHeaderSkeleton } from "@/components/shared/loading-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function DestinationsLoading() {
  return (
    <>
      <PageHeaderSkeleton width="11rem" />

      {/* Stats strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-9 w-56" />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border">
        <Skeleton className="h-12 w-full rounded-none" />
        <div className="space-y-px">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-none" />
          ))}
        </div>
      </div>
    </>
  );
}
