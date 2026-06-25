/**
 * Tiny localStorage-backed table store for demo mutations.
 *
 * Each "table" is a JSON-serializable array keyed by id. The fixture
 * generators seed the table on first read; subsequent reads return the
 * stored snapshot so user edits survive reloads.
 *
 * Why not just use the existing Zustand stores? Because those stores call
 * services that call http, which in demo mode comes back through this
 * router. Persisting at the demo layer keeps the data flow one-directional
 * and lets us call `reset()` from the user menu to wipe everything.
 *
 * Storage key prefix: `vortyx.demo.*` — easy to namespace-clear on reset.
 */

const PREFIX = "vortyx.demo.";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function readTable<T>(name: string, seed: () => T[]): T[] {
  if (!isBrowser()) return seed();
  const key = PREFIX + name;
  const raw = window.localStorage.getItem(key);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as T[];
    } catch {
      // Corrupted — fall through to reseed.
    }
  }
  const seeded = seed();
  window.localStorage.setItem(key, JSON.stringify(seeded));
  return seeded;
}

export function writeTable<T>(name: string, rows: T[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(PREFIX + name, JSON.stringify(rows));
}

export function readObject<T>(name: string, seed: () => T): T {
  if (!isBrowser()) return seed();
  const key = PREFIX + name;
  const raw = window.localStorage.getItem(key);
  if (raw) {
    try {
      return JSON.parse(raw) as T;
    } catch {
      /* fall through */
    }
  }
  const seeded = seed();
  window.localStorage.setItem(key, JSON.stringify(seeded));
  return seeded;
}

export function writeObject<T>(name: string, value: T): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(PREFIX + name, JSON.stringify(value));
}

/**
 * Wipe every demo-owned key. Used by the "Reset demo data" action in the
 * user dropdown. Also clears the auth + tokens entries so the user lands
 * back on the login screen with a fresh fixture set.
 */
export function resetDemoStorage(): void {
  if (!isBrowser()) return;
  const ls = window.localStorage;
  const toRemove: string[] = [];
  for (let i = 0; i < ls.length; i++) {
    const k = ls.key(i);
    if (!k) continue;
    if (
      k.startsWith(PREFIX) ||
      // Also clear the app-level stores so they re-hydrate from fresh fixtures.
      k.startsWith("vortyx.") ||
      k === "avortyx.tokens"
    ) {
      toRemove.push(k);
    }
  }
  for (const k of toRemove) ls.removeItem(k);
}

/** Stable, deterministic id generator — counter is in-memory so each
 *  session gives unique-feeling ids without persisting a counter. */
let _idCounter = 0;
export function demoId(prefix: string): string {
  _idCounter += 1;
  const stamp = Date.now().toString(36);
  return `${prefix}_demo_${stamp}_${_idCounter.toString(36)}`;
}
