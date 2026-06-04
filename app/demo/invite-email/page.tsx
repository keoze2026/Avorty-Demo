import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";

import { EmailBody, SubjectLine } from "./email-content";

export const metadata: Metadata = { title: "Invite email preview" };

/**
 * Static preview of the invite email Avortyx would send to a Buyer / Publisher
 * after an admin invites them. Renders the actual email HTML inside a fake
 * client chrome so it reads like a real Gmail / Outlook preview. The "Accept
 * invitation" button links to the role-scoped invite page in the demo.
 */
export default function InviteEmailPreviewPage() {
  return (
    <div className="min-h-screen bg-[#0F1117] py-10 px-4 text-foreground">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold tracking-tight text-white">
            Demo · Invite email preview
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            What a freshly-invited Buyer / Publisher would receive in their
            inbox.
          </p>
        </div>

        {/* Role switcher — drives the ?role= query param the client reads. */}
        <div className="mb-4 flex justify-center gap-2 text-xs">
          <Link
            href="?role=buyer"
            className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 font-medium text-zinc-300 hover:bg-zinc-800"
          >
            Buyer invite
          </Link>
          <Link
            href="?role=publisher"
            className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 font-medium text-zinc-300 hover:bg-zinc-800"
          >
            Publisher invite
          </Link>
        </div>

        {/* Email "inbox" chrome — mimics a Gmail message header */}
        <Suspense fallback={null}>
          <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-white text-zinc-800 shadow-2xl">
            <div className="border-b border-zinc-200 bg-zinc-50 px-6 py-4">
              <div className="text-[15px] font-semibold text-zinc-900">
                <SubjectLine />
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                <strong className="font-medium text-zinc-700">
                  Avortyx &lt;invites@avortyx.io&gt;
                </strong>
                <span>·</span>
                <span>to you</span>
                <span className="ml-auto">Today · 9:14 AM</span>
              </div>
            </div>

            {/* === Email body — plain HTML email styled inline-only === */}
            <EmailBody />
          </div>
        </Suspense>

        <p className="mt-6 text-center text-[11px] text-zinc-500">
          This is a static preview. Real sends go through the Avortyx
          transactional mailer.
        </p>
      </div>
    </div>
  );
}
