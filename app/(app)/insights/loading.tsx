import {
  BracketSkeleton,
  CardSkeleton,
  PageHeaderSkeleton,
} from "@/components/shared/loading-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function InsightsLoading() {
  return (
    <>
      <PageHeaderSkeleton width="10rem" />

      {/* Briefing hero */}
      <BracketSkeleton height="h-44">
        <div className="grid h-full grid-cols-1 gap-0 @4xl/main:grid-cols-12">
          <div className="p-6 @4xl/main:col-span-7 @4xl/main:border-r @4xl/main:border-border/60">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="mt-4 h-8 w-72" />
            <Skeleton className="mt-3 h-3 w-60" />
          </div>
          <div className="grid grid-cols-1 divide-y divide-border/60 @sm/main:grid-cols-3 @sm/main:divide-x @sm/main:divide-y-0 @4xl/main:col-span-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex flex-col gap-2 px-6 py-4">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
            ))}
          </div>
        </div>
      </BracketSkeleton>

      {/* Recommendation deck */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-7 w-56" />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Anomaly stream + chat */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <CardSkeleton index={1} height="h-80" />
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>

      {/* Autopilot */}
      <CardSkeleton index={2} height="h-40" />
    </>
  );
}
