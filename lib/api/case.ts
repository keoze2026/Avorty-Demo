/**
 * Bidirectional snake_case ↔ camelCase converters for API payloads.
 *
 * The backend speaks snake_case (Django convention); the frontend types and
 * stores are camelCase. These transformers run at the HTTP-client boundary
 * so the rest of the app never has to think about it.
 *
 * Skips types that should not be recursed into — Date, File, Blob, FormData,
 * ArrayBuffer, ArrayBufferView. Preserves arrays, plain objects, and primitives.
 */

function isPlainObject(v: unknown): v is Record<string, unknown> {
  if (v === null || typeof v !== "object") return false;
  if (Array.isArray(v)) return false;
  if (v instanceof Date) return false;
  if (typeof File !== "undefined" && v instanceof File) return false;
  if (typeof Blob !== "undefined" && v instanceof Blob) return false;
  if (typeof FormData !== "undefined" && v instanceof FormData) return false;
  if (v instanceof ArrayBuffer) return false;
  if (ArrayBuffer.isView(v)) return false;
  // Reject objects that aren't from the Object prototype chain (Map, Set, etc.).
  const proto = Object.getPrototypeOf(v);
  return proto === Object.prototype || proto === null;
}

function snakeToCamelKey(k: string): string {
  return k.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}

function camelToSnakeKey(k: string): string {
  return k.replace(/([A-Z])/g, (_, c: string) => "_" + c.toLowerCase());
}

export function snakeToCamel<T = unknown>(input: unknown): T {
  if (Array.isArray(input)) {
    return input.map((v) => snakeToCamel(v)) as unknown as T;
  }
  if (isPlainObject(input)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input)) {
      out[snakeToCamelKey(k)] = snakeToCamel(v);
    }
    return out as T;
  }
  return input as T;
}

export function camelToSnake<T = unknown>(input: unknown): T {
  if (Array.isArray(input)) {
    return input.map((v) => camelToSnake(v)) as unknown as T;
  }
  if (isPlainObject(input)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input)) {
      out[camelToSnakeKey(k)] = camelToSnake(v);
    }
    return out as T;
  }
  return input as T;
}
