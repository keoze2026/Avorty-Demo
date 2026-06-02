"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  PhoneCall,
  Settings as SettingsIcon,
  Target,
} from "lucide-react";

import { DestinationBuilder } from "@/components/destinations/destination-builder";
import { DestinationCallsTab } from "@/components/destinations/destination-calls-tab";
import { DestinationDetailHeader } from "@/components/destinations/destination-detail-header";
import { DestinationOverviewTab } from "@/components/destinations/destination-overview-tab";
import { DestinationSettingsTab } from "@/components/destinations/destination-settings-tab";
import { DestinationStatsRow } from "@/components/destinations/destination-stats-row";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useBreadcrumbOverride } from "@/hooks/use-breadcrumb-override";
import { useTranslation } from "@/hooks/use-translation";
import { ROUTES } from "@/lib/constants";
import { useDestinationsStore } from "@/lib/store/destinations-store";

export default function DestinationDetailPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const destination = useDestinationsStore((s) => s.getById(params.id));

  const [builderOpen, setBuilderOpen] = useState(false);

  useBreadcrumbOverride(destination?.name);

  useEffect(() => {
    if (!destination) {
      const t = setTimeout(() => router.replace(ROUTES.destinations), 600);
      return () => clearTimeout(t);
    }
  }, [destination, router]);

  if (!destination) {
    return (
      <EmptyState
        icon={Target}
        tone="cyan"
        title={t("networkUI.destinations.empty.notFound")}
        description={t("networkUI.destinations.empty.notFoundDesc")}
      />
    );
  }

  return (
    <>
      <DestinationDetailHeader
        destination={destination}
        onEdit={() => setBuilderOpen(true)}
      />
      <DestinationStatsRow destination={destination} />

      <Tabs defaultValue="overview" className="gap-4">
        <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
          <TabsTrigger value="overview">
            <LayoutDashboard className="h-3.5 w-3.5" /> {t("networkUI.destinations.tabs.overview")}
          </TabsTrigger>
          <TabsTrigger value="calls">
            <PhoneCall className="h-3.5 w-3.5" /> {t("networkUI.destinations.tabs.calls")}
          </TabsTrigger>
          <TabsTrigger value="settings">
            <SettingsIcon className="h-3.5 w-3.5" /> {t("networkUI.destinations.tabs.settings")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <DestinationOverviewTab destination={destination} />
        </TabsContent>
        <TabsContent value="calls">
          <DestinationCallsTab destination={destination} />
        </TabsContent>
        <TabsContent value="settings">
          <DestinationSettingsTab
            destination={destination}
            onEdit={() => setBuilderOpen(true)}
          />
        </TabsContent>
      </Tabs>

      <DestinationBuilder
        open={builderOpen}
        onOpenChange={setBuilderOpen}
        editId={destination.id}
      />
    </>
  );
}
