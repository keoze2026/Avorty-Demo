import {
  BracketSkeleton,
  PageHeaderSkeleton,
} from "@/components/shared/loading-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function BillingLoading() {
  return (
    <>
      <PageHeaderSkeleton width="8rem" />

      {/* Subscription hero */}
      <BracketSkeleton height="h-48">
        <div className="grid h-full grid-cols-1 gap-0 @3xl/main:grid-cols-12">
          <div className="p-6 @3xl/main:col-span-7 @3xl/main:border-r @3xl/main:border-border/60">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-4 h-10 w-40" />
            <Skeleton className="mt-3 h-3 w-56" />
            <Skeleton className="mt-5 h-8 w-32 rounded-md" />
          </div>
          <div className="flex flex-col justify-center gap-3 p-6 @3xl/main:col-span-5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </BracketSkeleton>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          <Skeleton className="h-4 w-32" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>

      {/* Invoices */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <div className="overflow-hidden rounded-xl border border-border">
          <Skeleton className="h-10 w-full rounded-none" />
          <div className="space-y-px">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-11 w-full rounded-none" />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
