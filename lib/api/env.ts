/**
 * Typed, validated access to the backend env vars.
 *
 *   API_BASE_URL — Origin of the Django Ninja REST API (no trailing slash).
 *   WS_BASE_URL  — Origin of the WebSocket channel (wss://…).
 *
 * IMPORTANT: Next.js only inlines `process.env.NEXT_PUBLIC_*` when the key
 * is referenced **literally** (statically) in source — `process.env[name]`
 * with a dynamic key is left as a runtime lookup and resolves to `undefined`
 * in the browser, regardless of `.env*` file contents. That's why this file
 * reads each var by its literal name and then validates.
 */

function validate(name: string, raw: string | undefined): string {
  if (typeof raw !== "string" || raw.length === 0) {
    if (process.env.NODE_ENV === "production") {
      // In production we don't want to crash the whole app — but we do want
      // a visible console warning that something is wrong.
      console.warn(`[env] ${name} is not set. Backend calls will fail.`);
      return "";
    }
    throw new Error(
      `[env] Missing ${name}. Add it to .env.local (see .env.local.example).`,
    );
  }
  return raw.replace(/\/+$/, ""); // strip trailing slash
}

// LITERAL references — required for Next.js to inline the value into the
// client bundle at build time.
export const API_BASE_URL = validate(
  "NEXT_PUBLIC_API_BASE_URL",
  process.env.NEXT_PUBLIC_API_BASE_URL,
);
export const WS_BASE_URL = validate(
  "NEXT_PUBLIC_WS_BASE_URL",
  process.env.NEXT_PUBLIC_WS_BASE_URL,
);
