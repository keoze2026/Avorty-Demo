import { PageHeaderSkeleton } from "@/components/shared/loading-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function IntegrationsLoading() {
  return (
    <>
      <PageHeaderSkeleton width="11rem" />

      {/* Floor stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>

      {/* Connected section */}
      <section className="space-y-3">
        <div>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-1.5 h-3 w-44" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      </section>

      {/* Catalog */}
      <section className="space-y-3">
        <div>
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-1.5 h-3 w-56" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </section>

      {/* Webhooks */}
      <Skeleton className="h-56 w-full rounded-xl" />
    </>
  );
}
