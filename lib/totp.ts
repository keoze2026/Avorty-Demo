/**
 * TOTP helpers — generate a base32 secret + the otpauth URL that Google
 * Authenticator scans.
 *
 * Note: this is the secret + URL plumbing only. In production the server
 * validates the 6-digit code against RFC 6238 (HMAC-SHA1 of the current
 * 30 s window). For the demo we accept any 6-digit code so the operator
 * can exercise the flow without having a real authenticator paired.
 */

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/** Generate a random base32-encoded secret (160 bits → 32 chars). */
export function generateTotpSecret(): string {
  if (typeof crypto === "undefined" || typeof crypto.getRandomValues !== "function") {
    // SSR fallback — deterministic-but-different per render is fine, the
    // user is going to overwrite it on the client anyway.
    return Array.from({ length: 32 }, () =>
      BASE32_ALPHABET[Math.floor(Math.random() * BASE32_ALPHABET.length)],
    ).join("");
  }
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  return base32Encode(bytes);
}

/** Pretty-print the secret as four 4-char groups for manual entry. */
export function formatSecretForDisplay(secret: string): string {
  return (secret.match(/.{1,4}/g) ?? [secret]).join(" ");
}

/**
 * Build the otpauth URL Google Authenticator (and 1Password, Authy, etc.)
 * understands.
 *
 *   otpauth://totp/Avortyx:user@example.com?secret=...&issuer=Avortyx&algorithm=SHA1&digits=6&period=30
 */
export function buildOtpauthUrl({
  issuer = "Avortyx",
  account,
  secret,
}: {
  issuer?: string;
  account: string;
  secret: string;
}): string {
  const label = encodeURIComponent(`${issuer}:${account}`);
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: "SHA1",
    digits: "6",
    period: "30",
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}

/**
 * Validate a 6-digit code against a secret.
 *
 * In production this would compute the TOTP for the current and adjacent
 * 30 s windows and constant-time-compare. For the demo: accept any
 * exactly-6-digit number. Codes containing non-digits or wrong length fail
 * so the entry-field UX still reads as a real challenge.
 */
export function verifyTotpCode(_secret: string, code: string): boolean {
  return /^\d{6}$/.test(code.trim());
}

/* ─── base32 encoder (RFC 4648) ─────────────────────────────────── */

function base32Encode(bytes: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let output = "";
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  return output;
}
