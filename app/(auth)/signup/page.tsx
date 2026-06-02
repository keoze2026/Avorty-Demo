"use client";

import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";
import { useTranslation } from "@/hooks/use-translation";
import { ROUTES } from "@/lib/constants";

export default function SignupPage() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center">
      <AuthCard
        title={t("authUI.signup.pageTitle")}
        description={t("authUI.signup.pageDescription")}
        footer={
          <>
            {t("authUI.signup.footerHasAccount")}{" "}
            <Link href={ROUTES.login} className="text-accent hover:underline">
              {t("authUI.signup.footerSignIn")}
            </Link>
          </>
        }
      >
        <SignupForm />
      </AuthCard>
    </div>
  );
}
