import {
  BracketSkeleton,
  PageHeaderSkeleton,
} from "@/components/shared/loading-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function RoutingLoading() {
  return (
    <>
      <PageHeaderSkeleton width="9rem" />

      {/* Topology overview band */}
      <BracketSkeleton height="h-48">
        <div className="grid h-full grid-cols-1 @4xl/main:grid-cols-12">
          <div className="p-6 @4xl/main:col-span-4 @4xl/main:border-r @4xl/main:border-border/60">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="mt-4 h-12 w-32" />
            <Skeleton className="mt-3 h-1.5 w-full" />
          </div>
          <div className="flex items-center justify-center border-y border-border/60 p-6 @4xl/main:col-span-3 @4xl/main:border-x @4xl/main:border-y-0">
            <Skeleton className="h-32 w-32 rounded-full" />
          </div>
          <div className="grid grid-cols-2 @4xl/main:col-span-5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-2 border-b border-r border-border/60 px-5 py-4">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-7 w-16" />
              </div>
            ))}
          </div>
        </div>
      </BracketSkeleton>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-48" />
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 gap-4 @md/main:grid-cols-2 @5xl/main:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[22rem] rounded-xl" />
        ))}
      </div>
    </>
  );
}
