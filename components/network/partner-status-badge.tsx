/**
 * Shared status badge for buyers + publishers.
 * Handles every status union we have today.
 */

import { Badge } from "@/components/ui/badge";
import type { BuyerStatus, PublisherStatus } from "@/lib/types";

type AnyStatus = BuyerStatus | PublisherStatus;

const VARIANT: Record<AnyStatus, React.ComponentProps<typeof Badge>["variant"]> = {
  active: "success",
  paused: "warning",
  capped: "warning",
  pending: "outline",
};

const LABEL: Record<AnyStatus, string> = {
  active: "Active",
  paused: "Paused",
  capped: "Capped",
  pending: "Pending",
};

export function PartnerStatusBadge({ status, className }: { status: AnyStatus; className?: string }) {
  return (
    <Badge variant={VARIANT[status]} className={className}>
      {status === "active" && (
        <span className="relative inline-flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-70" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      )}
      {LABEL[status]}
    </Badge>
  );
}
