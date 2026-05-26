import { CheckCircle2, Phone, PhoneIncoming, PhoneMissed, XCircle, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { CallStatus } from "@/lib/types";

const META: Record<CallStatus, {
  icon: LucideIcon;
  variant: React.ComponentProps<typeof Badge>["variant"];
  label: string;
}> = {
  ringing: { icon: PhoneIncoming, variant: "default", label: "Ringing" },
  "in-progress": { icon: Phone, variant: "default", label: "Live" },
  completed: { icon: CheckCircle2, variant: "success", label: "Won" },
  missed: { icon: PhoneMissed, variant: "warning", label: "Missed" },
  rejected: { icon: XCircle, variant: "destructive", label: "Rejected" },
  failed: { icon: XCircle, variant: "destructive", label: "Failed" },
};

export function CallStatusBadge({ status }: { status: CallStatus }) {
  const meta = META[status];
  const Icon = meta.icon;
  const live = status === "ringing" || status === "in-progress";
  return (
    <Badge variant={meta.variant} className="gap-1">
      {live ? (
        <span className="relative inline-flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-70" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      ) : (
        <Icon className="h-3 w-3" />
      )}
      {meta.label}
    </Badge>
  );
}
