import {
  BracketSkeleton,
  CardSkeleton,
  PageHeaderSkeleton,
  RowsSkeleton,
  SectionLabelSkeleton,
} from "@/components/shared/loading-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function LiveLoading() {
  return (
    <>
      <PageHeaderSkeleton width="12rem" />

      {/* Radar hero */}
      <BracketSkeleton height="h-[20rem]">
        <div className="grid h-full grid-cols-1 @5xl/main:grid-cols-12">
          {/* Radar disc */}
          <div className="flex items-center justify-center border-b border-border/60 p-6 @5xl/main:col-span-5 @5xl/main:border-b-0 @5xl/main:border-r">
            <Skeleton className="h-56 w-56 rounded-full" />
          </div>
          {/* Telemetry */}
          <div className="flex flex-col gap-3 p-6 @5xl/main:col-span-7">
            <Skeleton className="h-4 w-32" />
            <div className="grid grid-cols-2 gap-2 @sm/main:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        </div>
      </BracketSkeleton>

      {/* Stream + sidebar */}
      <div className="grid grid-cols-1 gap-4 @4xl/main:grid-cols-12">
        <div className="space-y-4 @4xl/main:col-span-8">
          <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5">
            <SectionLabelSkeleton index={1} />
            <RowsSkeleton rows={4} rowHeight="h-16" />
          </div>
        </div>
        <div className="space-y-4 @4xl/main:col-span-4">
          <CardSkeleton index={3} height="h-48" />
          <CardSkeleton index={4} height="h-40" />
        </div>
      </div>
    </>
  );
}
