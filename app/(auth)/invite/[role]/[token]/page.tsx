import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/auth-card";
import { InviteForm } from "@/components/auth/invite-form";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = { title: "Accept invitation" };

const VALID_ROLES = new Set(["buyer", "publisher"]);

interface PageProps {
  params: Promise<{ role: string; token: string }>;
}

export default async function InvitePage({ params }: PageProps) {
  const { role, token } = await params;
  if (!VALID_ROLES.has(role)) notFound();

  const roleLabel = role === "buyer" ? "Buyer" : "Publisher";

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center">
      <AuthCard
        title={`Join Vortyx as a ${roleLabel}`}
        description={`Accept your invitation and set a password to access the ${roleLabel.toLowerCase()} workspace.`}
        footer={
          <>
            Already have an account?{" "}
            <Link href={ROUTES.login} className="text-accent hover:underline">
              Sign in
            </Link>
          </>
        }
      >
        <InviteForm role={role as "buyer" | "publisher"} token={token} />
      </AuthCard>
    </div>
  );
}
