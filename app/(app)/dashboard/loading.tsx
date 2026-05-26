import {
  BracketSkeleton,
  CardSkeleton,
  PageHeaderSkeleton,
} from "@/components/shared/loading-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <>
      <PageHeaderSkeleton width="10rem" />

      {/* Hero band */}
      <BracketSkeleton height="h-[18rem]">
        <div className="grid h-full grid-cols-1 gap-0 @5xl/main:grid-cols-12">
          <div className="p-7 @5xl/main:col-span-7 @5xl/main:border-r @5xl/main:border-border/60">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="mt-6 h-12 w-72" />
            <Skeleton className="mt-3 h-3 w-56" />
            <Skeleton className="mt-6 h-16 w-full rounded-lg" />
          </div>
          <div className="grid grid-cols-1 divide-y divide-border/60 @md/main:grid-cols-3 @md/main:divide-x @md/main:divide-y-0 @5xl/main:col-span-5 @5xl/main:grid-cols-1 @5xl/main:divide-x-0 @5xl/main:divide-y">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex flex-col gap-2 px-6 py-4">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-7 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </div>
      </BracketSkeleton>

      {/* Bento */}
      <div className="grid grid-cols-1 gap-4 @3xl/main:grid-cols-2 @6xl/main:grid-cols-12">
        <div className="min-w-0 @6xl/main:col-span-7">
          <CardSkeleton index={1} height="h-64" />
        </div>
        <div className="min-w-0 @6xl/main:col-span-5">
          <CardSkeleton index={2} height="h-64" />
        </div>
        <div className="min-w-0 @6xl/main:col-span-5">
          <CardSkeleton index={3} height="h-52" />
        </div>
        <div className="min-w-0 @6xl/main:col-span-4">
          <CardSkeleton index={4} height="h-52" />
        </div>
        <div className="min-w-0 @3xl/main:col-span-2 @6xl/main:col-span-3">
          <CardSkeleton index={5} height="h-52" />
        </div>
      </div>

      {/* Ticker */}
      <Skeleton className="h-12 w-full rounded-xl" />
    </>
  );
}
