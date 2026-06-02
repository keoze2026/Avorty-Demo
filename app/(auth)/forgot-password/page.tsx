"use client";

import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { useTranslation } from "@/hooks/use-translation";
import { ROUTES } from "@/lib/constants";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center">
      <AuthCard
        title={t("authUI.forgot.pageTitle")}
        description={t("authUI.forgot.pageDescription")}
        footer={
          <Link href={ROUTES.login} className="text-accent hover:underline">
            {t("authUI.forgot.backToSignIn")}
          </Link>
        }
      >
        <ForgotPasswordForm />
      </AuthCard>
    </div>
  );
}
