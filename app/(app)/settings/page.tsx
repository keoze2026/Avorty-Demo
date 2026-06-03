"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { ApiKeysSection } from "@/components/settings/api-keys-section";
import { NotificationsSection } from "@/components/settings/notifications-section";
import { ProfileSection } from "@/components/settings/profile-section";
import { ScheduledReportsSection } from "@/components/settings/scheduled-reports-section";
import { SecuritySection } from "@/components/settings/security-section";
import { SessionsSection } from "@/components/settings/sessions-section";
import { SettingsRail, type SettingsSection } from "@/components/settings/settings-rail";
import { PageHeader } from "@/components/shared/page-header";
import { useTranslation } from "@/hooks/use-translation";

export default function SettingsPage() {
  const { t } = useTranslation();
  const [section, setSection] = useState<SettingsSection>("profile");

  return (
    <>
      <PageHeader
        title={t("page.settings.title")}
        description={t("page.settings.description")}
      />

      <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-[5.5rem] lg:self-start">
          <SettingsRail active={section} onSelect={setSection} />
        </div>

        <div className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {section === "profile" && <ProfileSection />}
              {section === "security" && <SecuritySection />}
              {section === "api-keys" && <ApiKeysSection />}
              {section === "notifications" && <NotificationsSection />}
              {section === "sessions" && <SessionsSection />}
              {section === "scheduled-reports" && <ScheduledReportsSection />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
