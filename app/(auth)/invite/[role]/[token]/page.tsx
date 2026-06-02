"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AuthCard } from "@/components/auth/auth-card";
import { InviteForm } from "@/components/auth/invite-form";
import { useTranslation } from "@/hooks/use-translation";
import { ROUTES } from "@/lib/constants";

const VALID_ROLES = new Set(["buyer", "publisher"]);

interface PageProps {
  params: Promise<{ role: string; token: string }>;
}

export default function InvitePage({ params }: PageProps) {
  const { role, token } = use(params);
  const { t } = useTranslation();

  if (!VALID_ROLES.has(role)) notFound();

  const roleLabel =
    role === "buyer"
      ? t("authUI.invite.roleBuyer")
      : t("authUI.invite.rolePublisher");
  const roleLower =
    role === "buyer"
      ? t("authUI.invite.roleBuyerLower")
      : t("authUI.invite.rolePublisherLower");

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center">
      <AuthCard
        title={t("authUI.invite.pageTitleTemplate").replace("{role}", roleLabel)}
        description={t("authUI.invite.pageDescriptionTemplate")
          .replace("{role}", roleLabel)
          .replace("{roleLower}", roleLower)}
        footer={
          <>
            {t("authUI.invite.footerHasAccount")}{" "}
            <Link href={ROUTES.login} className="text-accent hover:underline">
              {t("authUI.invite.footerSignIn")}
            </Link>
          </>
        }
      >
        <InviteForm role={role as "buyer" | "publisher"} token={token} />
      </AuthCard>
    </div>
  );
}
