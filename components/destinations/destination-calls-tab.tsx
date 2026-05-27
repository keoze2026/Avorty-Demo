"use client";

import { useMemo } from "react";

import { CallLogTable } from "@/components/reports/call-log-table";
import { MOCK_CALLS } from "@/lib/mock/calls";
import type { Destination } from "@/lib/types";

export function DestinationCallsTab({ destination }: { destination: Destination }) {
  const calls = useMemo(
    () => MOCK_CALLS.filter((c) => c.destinationNumber === destination.tfn),
    [destination.tfn],
  );

  return <CallLogTable calls={calls} limit={50} />;
}
