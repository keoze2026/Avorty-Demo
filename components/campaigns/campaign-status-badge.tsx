import { Badge } from "@/components/ui/badge";
import type { CampaignStatus } from "@/lib/types";

const VARIANT: Record<CampaignStatus, React.ComponentProps<typeof Badge>["variant"]> = {
  active: "success",
  paused: "warning",
  draft: "outline",
  archived: "secondary",
};

const LABEL: Record<CampaignStatus, string> = {
  active: "Active",
  paused: "Paused",
  draft: "Draft",
  archived: "Archived",
};

interface Props {
  status: CampaignStatus;
  className?: string;
}

export function CampaignStatusBadge({ status, className }: Props) {
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
