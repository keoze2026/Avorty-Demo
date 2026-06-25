/**
 * Typed fetch wrapper for the Avortyx backend.
 *
 *   await http.get<Buyer[]>("/api/buyers/")
 *   await http.post<UserOut>("/api/accounts/login", { body: { email, password }, anonymous: true })
 *   await http.patch("/api/campaigns/123", { body: { dailyCap: 500 } })
 *
 * Responsibilities:
 *   - Build full URL (API_BASE_URL + path) + serialize query string
 *   - camelCase ↔ snake_case for request body and response
 *   - Inject `Authorization: Bearer <access>` unless { anonymous: true }
 *   - On 401, attempt one refresh, then retry the original request once.
 *     Concurrent 401s coalesce into a single refresh call.
 *   - Normalize non-2xx into `ApiError`
 *
 * Phase 0 lays the plumbing. Stores will adopt it during Phase 1.
 */

import { snakeToCamel, camelToSnake } from "./case";
import { API_BASE_URL } from "./env";
import { ApiError, normalizeErrorBody } from "./errors";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setTokens,
} from "./tokens";
import type { HttpMethod, RequestOptions } from "./types";
import { isDemoMode } from "../demo/flag";
import { handleDemoRequest } from "../demo/http-router";

const REFRESH_PATH = "/api/accounts/refresh";

/** Build a full URL with optional query string. */
function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const base = API_BASE_URL;
  const url = path.startsWith("http") ? path : `${base}${path}`;
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === null || v === undefined) continue;
    // camelCase → snake_case on the wire.
    params.append(k.replace(/([A-Z])/g, (_, c: string) => "_" + c.toLowerCase()), String(v));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

/** Single-flight refresh promise so a burst of concurrent 401s triggers exactly one refresh. */
let refreshInFlight: Promise<string | null> | null = null;

async function performRefresh(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  try {
    const res = await fetch(`${API_BASE_URL}${REFRESH_PATH}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) {
      // Only invalidate the session when the backend definitively rejects
      // the refresh token (401/403/400). Transient failures — 5xx, 429,
      // network blips — must NOT clear localStorage; otherwise a server
      // burp or a momentary 429 on a page-refresh storm logs the user out.
      if (res.status === 400 || res.status === 401 || res.status === 403) {
        clearTokens();
      }
      return null;
    }
    // Backend uses Simple JWT with refresh-token rotation: each refresh call
    // returns a NEW refresh alongside the new access, and the OLD refresh is
    // blacklisted. We MUST save the rotated refresh too, otherwise the next
    // refresh attempt sends a blacklisted token and the user is logged out.
    // If the backend ever runs without rotation, `refresh` will be absent and
    // we just save the access alone — the branch below is no-op in that case.
    const json = (await res.json()) as { access?: string; refresh?: string };
    if (typeof json.access !== "string") {
      clearTokens();
      return null;
    }
    if (typeof json.refresh === "string" && json.refresh.length > 0) {
      setTokens({ access: json.access, refresh: json.refresh });
    } else {
      setAccessToken(json.access);
    }
    return json.access;
  } catch {
    // Network error / parse error — tokens are likely still valid on the
    // backend. Leave localStorage alone so the user can retry instead of
    // being bounced to login on a flaky connection.
    return null;
  }
}

function refreshOnce(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = performRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

async function parseBody(res: Response, rawResponse: boolean): Promise<unknown> {
  // 204 No Content → return null without trying to parse.
  if (res.status === 204) return null;
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("json")) {
    // Non-JSON (text, file, etc.) — hand back the raw text. Callers using
    // { rawResponse: true } can override the type at the call site.
    return await res.text();
  }
  const text = await res.text();
  if (text.length === 0) return null;
  try {
    const parsed: unknown = JSON.parse(text);
    return rawResponse ? parsed : snakeToCamel(parsed);
  } catch {
    return text;
  }
}

interface DoRequestArgs {
  method: HttpMethod;
  path: string;
  options?: RequestOptions;
  /** Internal — set after a refresh has already been attempted. */
  alreadyRetried?: boolean;
}

/**
 * In-flight POST dedupe map. The backend doesn't accept Idempotency-Key yet,
 * so if the same POST body is fired twice in a row (double-click on a Create
 * button, retry-on-network-blip, etc.) we'd create duplicates. We coalesce
 * concurrent identical POSTs into one network call. Cleared as soon as the
 * request resolves so legitimate sequential creates still work.
 */
const inFlightPosts = new Map<string, Promise<unknown>>();

function postFingerprint(path: string, body: unknown): string {
  let bodyKey: string;
  try {
    bodyKey = body === undefined ? "" : JSON.stringify(body);
  } catch {
    bodyKey = String(body);
  }
  return `${path}::${bodyKey}`;
}

async function doRequest<T>({
  method,
  path,
  options = {},
  alreadyRetried = false,
}: DoRequestArgs): Promise<T> {
  // Demo mode — route every request through the in-memory mock router and
  // never touch the network. The router returns snake_case wire shapes;
  // we still run them through `snakeToCamel` below to mirror the real path.
  if (isDemoMode()) {
    const stringQuery: Record<string, string> = {};
    if (options.query) {
      for (const [k, v] of Object.entries(options.query)) {
        if (v === null || v === undefined) continue;
        const snake = k.replace(/([A-Z])/g, (_, c: string) => "_" + c.toLowerCase());
        stringQuery[snake] = String(v);
      }
    }
    const raw = await handleDemoRequest<unknown>({
      method,
      path,
      query: stringQuery,
      body: options.body,
      anonymous: !!options.anonymous,
    });
    if (options.rawResponse) return raw as T;
    return snakeToCamel(raw) as T;
  }

  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.headers) Object.assign(headers, options.headers);

  // Auth header.
  if (!options.anonymous) {
    const token = getAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  // Body serialization.
  let body: BodyInit | undefined;
  if (options.body !== undefined && options.body !== null) {
    if (options.rawBody) {
      body = options.body as BodyInit;
    } else if (typeof FormData !== "undefined" && options.body instanceof FormData) {
      body = options.body;
      // Let the browser set the multipart boundary; do not set Content-Type.
    } else {
      headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
      body = JSON.stringify(camelToSnake(options.body));
    }
  }

  const res = await fetch(buildUrl(path, options.query), {
    method,
    headers,
    body,
    signal: options.signal,
    credentials: "omit",
  });

  // Refresh-on-401 retry. Skip for the refresh endpoint itself and for explicit anonymous requests.
  if (
    res.status === 401 &&
    !alreadyRetried &&
    !options.anonymous &&
    !path.endsWith(REFRESH_PATH)
  ) {
    const newAccess = await refreshOnce();
    if (newAccess) {
      return doRequest<T>({ method, path, options, alreadyRetried: true });
    }
  }

  if (!res.ok) {
    const errBody = await parseBody(res, true); // raw — preserve original snake_case for error parsing
    throw normalizeErrorBody(res.status, res.statusText, errBody);
  }

  const parsed = await parseBody(res, Boolean(options.rawResponse));
  return parsed as T;
}

export const http = {
  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return doRequest<T>({ method: "GET", path, options });
  },
  post<T>(path: string, options?: RequestOptions): Promise<T> {
    // Coalesce concurrent identical POSTs into one network call. FormData and
    // anonymous (login/register) requests bypass dedupe so the user can retry
    // a failed login intentionally.
    const body = options?.body;
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    if (options?.anonymous || isFormData) {
      return doRequest<T>({ method: "POST", path, options });
    }
    const key = postFingerprint(path, body);
    const existing = inFlightPosts.get(key) as Promise<T> | undefined;
    if (existing) return existing;
    const promise = doRequest<T>({ method: "POST", path, options }).finally(() => {
      inFlightPosts.delete(key);
    });
    inFlightPosts.set(key, promise);
    return promise;
  },
  patch<T>(path: string, options?: RequestOptions): Promise<T> {
    return doRequest<T>({ method: "PATCH", path, options });
  },
  put<T>(path: string, options?: RequestOptions): Promise<T> {
    return doRequest<T>({ method: "PUT", path, options });
  },
  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return doRequest<T>({ method: "DELETE", path, options });
  },
};

export { ApiError };
