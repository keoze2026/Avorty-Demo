"use client";

/**
 * Request access page — Avortyx is invite-only, so the public "sign up"
 * route is actually a contact form. Existing accounts use /login.
 */

import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";
import { ROUTES } from "@/lib/constants";

export default function SignupPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center">
      <AuthCard
        title="Request access"
        description="Avortyx is invite-only. Tell us about your business and we'll get you onboarded."
        footer={
          <>
            Already have an account?{" "}
            <Link href={ROUTES.login} className="text-accent hover:underline">
              Sign in
            </Link>
          </>
        }
      >
        <SignupForm />
      </AuthCard>
    </div>
  );
}
