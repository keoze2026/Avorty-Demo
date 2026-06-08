/**
 * Tiny JWT token persistence layer used by the HTTP client.
 *
 * Stored in localStorage so the user stays signed in across reloads. Phase 1
 * will wire the auth store's login/logout/refresh flows into these setters;
 * for now the module exists as a stable contract the HTTP client can read.
 *
 * Why a separate module instead of using the Zustand auth store?
 *   - The HTTP client needs synchronous, non-React access to tokens.
 *   - Zustand's vanilla store works for that, but a dedicated module keeps
 *     the API layer decoupled from the auth feature so it can be unit-tested
 *     and re-used in non-React contexts later.
 */

const STORAGE_KEY = "avortyx.tokens";

interface TokenBundle {
  access: string;
  refresh: string;
}

let memory: TokenBundle | null = null;

function readFromStorage(): TokenBundle | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<TokenBundle>;
    if (
      parsed &&
      typeof parsed.access === "string" &&
      typeof parsed.refresh === "string"
    ) {
      return { access: parsed.access, refresh: parsed.refresh };
    }
  } catch {
    // Corrupt payload — fall through and clear.
  }
  return null;
}

function writeToStorage(bundle: TokenBundle | null) {
  if (typeof window === "undefined") return;
  try {
    if (bundle === null) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bundle));
  } catch {
    // Storage quota / private mode — ignore; memory copy still serves the session.
  }
}

/** Hydrate the in-memory copy from localStorage. Idempotent; safe to call often. */
function ensureLoaded() {
  if (memory !== null) return;
  memory = readFromStorage();
}

export function getAccessToken(): string | null {
  ensureLoaded();
  return memory?.access ?? null;
}

export function getRefreshToken(): string | null {
  ensureLoaded();
  return memory?.refresh ?? null;
}

export function setTokens(bundle: TokenBundle) {
  memory = bundle;
  writeToStorage(bundle);
}

/** Update only the access token (used after a refresh). */
export function setAccessToken(access: string) {
  ensureLoaded();
  const refresh = memory?.refresh ?? "";
  memory = { access, refresh };
  writeToStorage(memory);
}

export function clearTokens() {
  memory = null;
  writeToStorage(null);
}

export function hasTokens(): boolean {
  ensureLoaded();
  return memory !== null;
}
