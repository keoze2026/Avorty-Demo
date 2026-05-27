import { PageHeaderSkeleton } from "@/components/shared/loading-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function CampaignsLoading() {
  return (
    <>
      <PageHeaderSkeleton width="11rem" />

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border">
        <Skeleton className="h-12 w-full rounded-none" />
        <div className="space-y-px">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-none" />
          ))}
        </div>
      </div>
    </>
  );
}
