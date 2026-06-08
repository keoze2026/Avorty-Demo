/**
 * Normalized error surface for the API client.
 *
 * Every non-2xx response becomes an `ApiError`. Consumers can branch on
 *   - `status` for HTTP status (401, 404, 422, 429, 500…)
 *   - `code` for backend-supplied error code (when present)
 *   - `fieldErrors` for per-field validation errors (Django Ninja shape)
 *   - `message` for a user-displayable message (fallback: HTTP status text)
 *
 * Django Ninja typically returns one of:
 *   { "detail": "..." }
 *   { "detail": [{ "loc": ["body","email"], "msg": "..." }, ...] }
 *   { "message": "...", "code": "..." }   (custom error handlers)
 */

export interface FieldError {
  field: string;
  message: string;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  fieldErrors?: FieldError[];
  /** Raw response body, kept around for debugging. */
  body?: unknown;

  constructor(opts: {
    status: number;
    message: string;
    code?: string;
    fieldErrors?: FieldError[];
    body?: unknown;
  }) {
    super(opts.message);
    this.name = "ApiError";
    this.status = opts.status;
    this.code = opts.code;
    this.fieldErrors = opts.fieldErrors;
    this.body = opts.body;
  }

  /** True for 401 / 403 — caller can decide to bounce to login. */
  get isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  /** True for 5xx — caller can decide to retry / show "server error". */
  get isServerError(): boolean {
    return this.status >= 500;
  }
}

interface DjangoNinjaDetailItem {
  loc?: unknown[];
  msg?: string;
  message?: string;
}

/** Parse an error response body into an `ApiError`. Tolerant of shape variance. */
export function normalizeErrorBody(
  status: number,
  statusText: string,
  body: unknown,
): ApiError {
  // String body — assume the body IS the message.
  if (typeof body === "string" && body.length > 0) {
    return new ApiError({ status, message: body, body });
  }

  if (body && typeof body === "object") {
    const obj = body as Record<string, unknown>;

    // Django Ninja validation: detail is an array of {loc, msg}.
    if (Array.isArray(obj.detail)) {
      const items = obj.detail as DjangoNinjaDetailItem[];
      const fieldErrors: FieldError[] = items.map((it) => {
        const loc = Array.isArray(it.loc) ? it.loc : [];
        // Strip the leading 'body' / 'query' / 'path' kind.
        const field = loc
          .slice(1)
          .filter((p) => typeof p === "string" || typeof p === "number")
          .join(".");
        return {
          field: field || "_",
          message: it.msg ?? it.message ?? "Invalid",
        };
      });
      return new ApiError({
        status,
        message: fieldErrors[0]?.message ?? statusText,
        fieldErrors,
        body,
      });
    }

    // Single-message detail: { detail: "..." }
    if (typeof obj.detail === "string") {
      return new ApiError({ status, message: obj.detail, body });
    }

    // Custom { message, code }
    if (typeof obj.message === "string") {
      return new ApiError({
        status,
        message: obj.message,
        code: typeof obj.code === "string" ? obj.code : undefined,
        body,
      });
    }
  }

  return new ApiError({ status, message: statusText || `HTTP ${status}`, body });
}
