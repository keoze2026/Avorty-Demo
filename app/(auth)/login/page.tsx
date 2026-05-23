import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = { title: "Sign in" };

function LoginFormFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center">
      <AuthCard
        title="Welcome back"
        description="Sign in to your Vortyx workspace."
        footer={
          <>
            New here?{" "}
            <Link href={ROUTES.signup} className="text-accent hover:underline">
              Create an account
            </Link>
          </>
        }
      >
        {/* useSearchParams() inside LoginForm requires a Suspense boundary. */}
        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>
      </AuthCard>
    </div>
  );
}
