import { Badge } from "@/components/ui/badge";
import type { NumberStatus } from "@/lib/types";

const VARIANT: Record<NumberStatus, React.ComponentProps<typeof Badge>["variant"]> = {
  active: "success",
  paused: "warning",
  pending: "outline",
  expired: "secondary",
};

const LABEL: Record<NumberStatus, string> = {
  active: "Active",
  paused: "Paused",
  pending: "Pending",
  expired: "Expired",
};

export function NumberStatusBadge({ status }: { status: NumberStatus }) {
  return (
    <Badge variant={VARIANT[status]} className="capitalize">
      {LABEL[status]}
    </Badge>
  );
}
