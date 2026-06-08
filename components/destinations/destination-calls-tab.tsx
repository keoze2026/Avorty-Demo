"use client";

import { useMemo } from "react";

import { CallLogTable } from "@/components/reports/call-log-table";
import { useCallsStore } from "@/lib/store/calls-store";
import type { Destination } from "@/lib/types";

export function DestinationCallsTab({ destination }: { destination: Destination }) {
  const recentCalls = useCallsStore((s) => s.recent);
  const calls = useMemo(
    () => recentCalls.filter((c) => c.destinationNumber === destination.tfn),
    [destination.tfn, recentCalls],
  );

  return <CallLogTable calls={calls} limit={50} />;
}
