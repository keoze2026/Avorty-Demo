"use client";

import { useEffect, useReducer, useRef } from "react";

import { subscribeToCallStream } from "@/lib/mock/socket";
import type { Call, CallEvent } from "@/lib/types";

interface State {
  /** Calls currently active (ringing or in-progress), newest first. */
  inFlight: Call[];
  /** Recently completed/missed/rejected, newest first (capped). */
  history: Call[];
  totals: {
    started: number;
    completed: number;
    missed: number;
    revenue: number;
  };
}

const INITIAL: State = {
  inFlight: [],
  history: [],
  totals: { started: 0, completed: 0, missed: 0, revenue: 0 },
};

const HISTORY_CAP = 25;
const INFLIGHT_CAP = 12;

function reducer(state: State, ev: CallEvent): State {
  switch (ev.kind) {
    case "call:incoming": {
      const inFlight = [ev.call, ...state.inFlight].slice(0, INFLIGHT_CAP);
      return {
        ...state,
        inFlight,
        totals: { ...state.totals, started: state.totals.started + 1 },
      };
    }
    case "call:progress": {
      return {
        ...state,
        inFlight: state.inFlight.map((c) =>
          c.id === ev.id ? { ...c, durationSec: ev.durationSec, status: ev.status } : c,
        ),
      };
    }
    case "call:completed": {
      const settling = state.inFlight.find((c) => c.id === ev.id);
      const inFlight = state.inFlight.filter((c) => c.id !== ev.id);
      const completed = settling
        ? {
            ...settling,
            durationSec: ev.durationSec,
            payout: ev.payout,
            revenue: ev.revenue,
            status: (ev.payout > 0 ? "completed" : "missed") as Call["status"],
          }
        : null;
      const history = completed ? [completed, ...state.history].slice(0, HISTORY_CAP) : state.history;
      return {
        ...state,
        inFlight,
        history,
        totals: {
          ...state.totals,
          completed: state.totals.completed + (ev.payout > 0 ? 1 : 0),
          missed: state.totals.missed + (ev.payout > 0 ? 0 : 1),
          revenue: state.totals.revenue + ev.revenue,
        },
      };
    }
    default:
      return state;
  }
}

interface UseMockSocketOptions {
  /** ms between new incoming calls */
  intervalMs?: number;
  /** start paused */
  paused?: boolean;
}

export function useMockSocket(opts: UseMockSocketOptions = {}) {
  const { intervalMs = 2400, paused = false } = opts;
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    if (paused) return;
    const unsub = subscribeToCallStream((ev) => {
      if (pausedRef.current) return;
      dispatch(ev);
    }, intervalMs);
    return unsub;
  }, [intervalMs, paused]);

  return state;
}

/**
 * A monotonic "now" tick used for in-call duration counters etc.
 * Returns Date.now() values that update on a 1s interval.
 */
export function useNow(ms = 1000) {
  const [, force] = useReducer((x: number) => x + 1, 0);
  useEffect(() => {
    const id = setInterval(force, ms);
    return () => clearInterval(id);
  }, [ms]);
  return Date.now();
}
