"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Users } from "lucide-react";

import { PublisherDetailHeader } from "@/components/publishers/publisher-detail-header";
import { PublisherSettingsTab } from "@/components/publishers/publisher-settings-tab";
import { EmptyState } from "@/components/shared/empty-state";
import { useBreadcrumbOverride } from "@/hooks/use-breadcrumb-override";
import { useTranslation } from "@/hooks/use-translation";
import { usePublishersStore } from "@/lib/store/publishers-store";

export default function PublisherDetailPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const publisher = usePublishersStore((s) => s.getById(params.id));

  useBreadcrumbOverride(publisher?.name);

  useEffect(() => {
    if (!publisher) {
      const t = setTimeout(() => router.replace("/publishers"), 600);
      return () => clearTimeout(t);
    }
  }, [publisher, router]);

  if (!publisher) {
    return (
      <EmptyState
        icon={Users}
        tone="violet"
        title={t("networkUI.publishers.empty.notFound")}
        description={t("networkUI.publishers.empty.notFoundDesc")}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-[928px] space-y-6">
      <PublisherDetailHeader publisher={publisher} />
      <PublisherSettingsTab publisher={publisher} />
    </div>
  );
}
