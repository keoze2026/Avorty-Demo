import {
  BracketSkeleton,
  PageHeaderSkeleton,
} from "@/components/shared/loading-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function CampaignsLoading() {
  return (
    <>
      <PageHeaderSkeleton width="11rem" />

      {/* Atlas overview band */}
      <BracketSkeleton height="h-44">
        <div className="grid h-full grid-cols-1 @4xl/main:grid-cols-12">
          <div className="p-6 @4xl/main:col-span-5 @4xl/main:border-r @4xl/main:border-border/60">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="mt-4 h-14 w-44" />
            <Skeleton className="mt-4 h-1.5 w-full rounded-full" />
          </div>
          <div className="grid grid-cols-1 @sm/main:grid-cols-3 @4xl/main:col-span-7">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex flex-col gap-2 px-6 py-4">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-7 w-24" />
              </div>
            ))}
          </div>
        </div>
      </BracketSkeleton>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-44" />
        <Skeleton className="h-9 w-72" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 @sm/main:grid-cols-2 @5xl/main:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-72 rounded-xl" />
        ))}
      </div>
    </>
  );
}
