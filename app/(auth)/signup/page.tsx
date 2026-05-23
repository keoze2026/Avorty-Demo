import Link from "next/link";
import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = { title: "Create your workspace" };

export default function SignupPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center">
      <AuthCard
        title="Start with Vortyx"
        description="Spin up your call intelligence workspace in seconds."
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
