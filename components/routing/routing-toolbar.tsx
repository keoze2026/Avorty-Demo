"use client";

import { ArrowLeft, BookOpen, Loader2, PlayCircle, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LiveBadge } from "@/components/shared/live-badge";
import { ROUTES } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/format";
import type { RoutingPlan } from "@/lib/types";

interface Props {
  plan: RoutingPlan;
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onPublishToggle: () => void;
  onDelete: () => void;
  onTest: () => void;
}

export function RoutingToolbar({ plan, dirty, saving, onSave, onPublishToggle, onDelete, onTest }: Props) {
  const router = useRouter();
  const published = plan.status === "published";

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-1 h-8 text-muted-foreground"
        onClick={() => router.push(ROUTES.routing)}
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All plans
      </Button>
      <div className="mx-1 h-5 w-px bg-border" />

      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate text-sm font-semibold">{plan.name}</span>
        <Badge variant={published ? "success" : "outline"} className="capitalize">
          {published && <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-current" />}
          {plan.status}
        </Badge>
        {dirty && (
          <Badge variant="warning">
            <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-current" />
            Unsaved
          </Badge>
        )}
        {!dirty && <LiveBadge label={`Saved ${formatRelativeTime(plan.updatedAt)}`} className="hidden md:inline-flex" />}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onTest}>
          <PlayCircle className="h-3.5 w-3.5" /> Test call
        </Button>
        <Button variant="outline" size="sm" onClick={onDelete} className="text-destructive">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
        <Button variant={dirty ? "default" : "outline"} size="sm" onClick={onSave} disabled={saving || !dirty}>
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Save
        </Button>
        <Button size="sm" onClick={onPublishToggle} className="gap-1">
          <BookOpen className="h-3.5 w-3.5" />
          {published ? "Unpublish" : "Publish"}
        </Button>
      </div>
    </div>
  );
}
