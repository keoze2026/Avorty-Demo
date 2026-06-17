/**
 * Guest identity for unauthenticated visitors who chat with the support
 * widget. We need *something* for the backend's `name` + `email` fields,
 * and we want it stable across page reloads so the operator can correlate
 * follow-up messages with the original session in Telegram.
 *
 * The identity is generated lazily on the first call from the browser and
 * cached in localStorage. SSR-safe (returns a placeholder on the server,
 * the real identity is materialized client-side on first interaction).
 */

const STORAGE_KEY = "avortyx.support.guest";
const SESSION_KEY = "avortyx.support.sessionId";

export interface GuestIdentity {
  name: string;
  email: string;
}

function randomId(): string {
  return Math.random().toString(36).slice(2, 8);
}

/**
 * Read or generate the visitor's guest identity. Safe to call from a
 * client component; on the server it just returns a placeholder that
 * never reaches the wire (the chat widget only calls this on submit).
 */
export function getGuestIdentity(): GuestIdentity {
  if (typeof window === "undefined") {
    return { name: "Website visitor", email: "guest@avortyx.io" };
  }
  let id: string | null = null;
  try {
    id = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    /* localStorage disabled (private window, quota, etc.) — fall through to ephemeral. */
  }
  if (!id) {
    id = randomId();
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  }
  return {
    name: `Visitor ${id.toUpperCase()}`,
    email: `visitor.${id}@guest.avortyx.io`,
  };
}

/**
 * Persist the active support session id so a refresh restores the
 * conversation instead of starting a new one. Keyed by the agent the
 * visitor picked so each (agent, visitor) pair has its own thread.
 */
export function getStoredSessionId(agentId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(`${SESSION_KEY}:${agentId}`);
  } catch {
    return null;
  }
}

export function storeSessionId(agentId: string, sessionId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`${SESSION_KEY}:${agentId}`, sessionId);
  } catch {
    /* ignore */
  }
}

export function clearStoredSessionId(agentId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(`${SESSION_KEY}:${agentId}`);
  } catch {
    /* ignore */
  }
}
