import Link from "next/link";
import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center">
      <AuthCard
        title="Reset password"
        description="We'll send you a secure link to set a new one."
        footer={
          <Link href={ROUTES.login} className="text-accent hover:underline">
            Back to sign in
          </Link>
        }
      >
        <ForgotPasswordForm />
      </AuthCard>
    </div>
  );
}
