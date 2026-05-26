import { PageHeaderSkeleton } from "@/components/shared/loading-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function MarketplaceLoading() {
  return (
    <>
      <PageHeaderSkeleton width="11rem" />

      {/* Floor stats */}
      <div className="grid grid-cols-2 gap-3 @2xl/main:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>

      {/* Ticker */}
      <Skeleton className="h-10 w-full rounded-xl" />

      {/* Featured + my positions */}
      <div className="grid grid-cols-1 gap-4 @6xl/main:grid-cols-3">
        <div className="@6xl/main:col-span-2">
          <Skeleton className="h-[26rem] rounded-2xl" />
        </div>
        <Skeleton className="h-[26rem] rounded-xl" />
      </div>

      {/* Vertical heat */}
      <Skeleton className="h-32 w-full rounded-xl" />

      {/* Listings + tape */}
      <div className="grid grid-cols-1 gap-4 @6xl/main:grid-cols-3">
        <div className="@6xl/main:col-span-2 space-y-3">
          <Skeleton className="h-10 w-full rounded-md" />
          <div className="grid grid-cols-1 gap-3 @md/main:grid-cols-2 @5xl/main:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-xl" />
            ))}
          </div>
        </div>
        <Skeleton className="h-[28rem] rounded-xl" />
      </div>
    </>
  );
}
