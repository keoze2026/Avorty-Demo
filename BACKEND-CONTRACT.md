# Backend API Contract — Avortyx Frontend

**Audience:** Backend developer
**Author:** Frontend team
**Date:** 2026-06-12
**Status:** This document is the source of truth for what the frontend sends and expects. Where backend behaviour disagrees with this document, **the backend must change**.

---

## 0. How to read this document

This is split into four parts:

1. **Global conventions** (§1) — Auth, case conversion, pagination, errors, dates. These apply to *every* endpoint. Read this first.
2. **Known issues — must fix** (§2) — Concrete bugs the frontend has hit this week, with the exact change required.
3. **Per-resource schemas** (§3) — Field-level shape definitions for every resource (Buyer, Campaign, Destination, etc.) showing what the frontend writes and reads.
4. **Endpoint catalog** (§4) — Every URL the frontend calls. 22 services, ~168 endpoints.

If you're short on time, **§1 and §2 are the highest-impact reads**. They cover ~80% of the bugs we've been hitting.

---

## 1. Global conventions

These rules apply to every request and response. Inconsistencies here cause silent breakage across the whole app.

### 1.1 Authentication

- All endpoints require `Authorization: Bearer <access_token>` **unless explicitly marked anonymous**.
- Token TTL: **1 hour** for access tokens.
- On `401`, the frontend automatically POSTs `/api/accounts/refresh` with the refresh token, gets a new access token, and retries the original request once.
- If refresh fails, the frontend clears tokens and bounces the user to `/login`.
- **A missing or expired token must return `401`, never `500`.** If your handler crashes during auth check, that's a 500 and we can't auto-recover.

### 1.2 Case conversion (camelCase ↔ snake_case)

The frontend uses camelCase everywhere; the backend should use snake_case on the wire. The frontend's HTTP client converts both directions automatically:

- **Request body**: camelCase fields → snake_case on the wire (e.g. `buyerId` → `buyer_id`, `payoutAmount` → `payout_amount`).
- **Response body**: snake_case fields → camelCase on the frontend (e.g. `payout_amount` → `payoutAmount`).
- **Query strings**: same rule — `pageSize` becomes `?page_size=…`.
- **URL path**: NEVER converted. `/api/access-requests/{id}/` is sent as-is.

**Rule:** if you ship a field in snake_case on the wire, the frontend will read it. If you ship in camelCase on the wire, it'll get the wrong key after conversion.

### 1.3 Pagination

The default paginated envelope is:

```json
{
  "items": [...],
  "total": 209,
  "page": 1,
  "page_size": 50,
  "pages": 5
}
```

- Query params: `?page=1&page_size=50`. Pages are **1-indexed**.
- The frontend tolerates a few legacy shapes (plain array, `{items: []}` without metadata) for endpoints we wrapped defensively, but **new endpoints should use the full envelope above**.

**Exception:** `GET /api/analytics/calls` uses `offset` / `limit` instead of `page` / `page_size` (legacy). Keep it that way for now, but flag it.

### 1.4 Errors

The frontend understands these shapes; please standardize on one of them.

**Validation errors (Django Ninja style):**
```json
{
  "detail": [
    { "loc": ["body", "email"], "msg": "Invalid email" }
  ]
}
```

**Single-message errors:**
```json
{ "detail": "Request is already approved" }
```

**Custom errors with codes:**
```json
{ "message": "Token expired", "code": "token_expired" }
```

**Rules:**
- `400` → bad request (malformed input the client can fix)
- `401` → auth missing/invalid (frontend will refresh + retry once)
- `403` → auth valid but lacks permission (don't retry)
- `404` → resource not found
- `409` → conflict (e.g. "already approved", "already exists")
- `422` → validation error (use this for field-level validation; do **not** use 500)
- `500` → unhandled server exception. **A 500 is always a backend bug.** If validation fails, return 422. If a record is in the wrong state, return 409.
- **Idempotent operations should be idempotent.** Re-approving an already-approved request should return `200` with the current record, not `400` "already approved". (Already fixed for access-requests; please apply same pattern to other state-transition endpoints.)
- **Never return HTML error pages.** A JSON API must return JSON for every error response, even 500s. We're currently getting Django's default debug HTML on some 500s, which forces the frontend to display raw HTML in toast messages.

### 1.5 Dates and times

- **Datetimes on the wire:** ISO-8601 strings with timezone, e.g. `"2026-06-12T10:00:00Z"`. Frontend parses with `Date.parse`.
- **Times of day (no date):** `"HH:MM"` (24-hour, no seconds). Don't use `"HH:MM:SS"` on write endpoints — if your GET returns `"HH:MM:SS"` but your POST validator rejects it, that's a bug. **Pick one format and use it both ways.**
- **Dates only:** `"YYYY-MM-DD"`.
- **Timestamps in responses where TZ doesn't matter:** still send the timezone (`Z` for UTC). Don't send naive datetimes.

### 1.6 Decimals and money

The frontend accepts both `number` and string-encoded `decimal` (e.g. `"35.00"`) for money fields. **Prefer strings** for amounts to avoid float precision drift. The frontend converts them via `Number(...)` internally.

### 1.7 Enums

- Enums are **lowercase snake_case strings**, e.g. `"per_qualified"`, `"round_robin"`, `"in_progress"`.
- If the frontend writes a value the backend doesn't recognize, the backend should return `422` with a clear field error — not `500`.
- Conversely, if the backend ships an unknown enum value, the frontend falls back to a safe default. Please **don't change enum values silently** — they're a public contract.

### 1.8 IDs

- All primary IDs are UUID v4 strings. **Don't use integer IDs**; the frontend assumes string everywhere.
- Foreign keys are also UUIDs: `buyer_id`, `campaign_id`, `user_id`, etc.

### 1.9 Optional vs required fields

- A field listed in the schema below as `Type?` (with `?`) is **optional** on write and may be missing on read.
- A field without `?` is **required on write** and **must always be present on read**. If your model has a NOT NULL column with no default and the API omits it, the frontend will crash. Either give the column a DB-level default, or always populate it in the serializer.

---

## 2. Known issues — must fix

The frontend has hit these specific bugs this week. They block production usability. Please fix all of them before the next deploy.

### 2.1 `GET /api/spam/blacklist` returns 500

- The frontend hydrates this on every authenticated app mount via `useBlockedNumbersStore.fetch()`.
- Every signed-in session sees a 500 in DevTools because of this.
- Likely causes: missing migration, pagination edge case on an empty table, or serializer choking on a null field.
- **Action:** check server logs for the traceback, fix root cause, confirm `GET /api/spam/blacklist?page=1&page_size=500` returns `200` with the standard paginated envelope.
- Also check `GET /api/spam/whitelist` — same pattern, same risk.

### 2.2 `POST /api/destinations/` returns 500

- The frontend sends a valid body:
  ```json
  {
    "buyer_id": "<uuid>",
    "tfn": "+12341412411",
    "name": "123",
    "concurrency_cap": 10,
    "daily_cap": 100,
    "monthly_cap": 2500,
    "enabled": true
  }
  ```
- Response is your default Django HTML error page (not JSON).
- **Likely causes:**
  1. The `buyer_id` FK doesn't resolve because dev DB isn't seeded with the buyers our dropdown lists.
  2. A field you claimed had a default (e.g. `forward_type`, `ring_duration_sec`, `hourly_cap`, `global_cap`) actually has `NOT NULL` with no DB default and the insert fails.
- **Action:** share the traceback, fix the underlying constraint, and confirm `POST /api/destinations/` works with the minimal body above.

### 2.3 Campaign POST: time format asymmetry

- `POST /api/campaigns/` validator requires `"HH:MM"` for `schedules[].open_time` / `close_time`.
- `GET /api/campaigns/{id}` returns the same fields as `"HH:MM:SS"`.
- The frontend now strips the seconds before sending. **Please align**: either accept `"HH:MM:SS"` on write, or return `"HH:MM"` on read. Pick one.

### 2.4 Campaign default status on create

- Backend currently defaults new campaigns to `"active"`.
- The frontend wizard's UX is "create as draft → operator activates when ready". The frontend now sends `status: "paused"` explicitly to force this.
- **Action:** prefer `paused` as the server-side default too. Live campaigns shouldn't be created via the wizard without the operator explicitly clicking Activate.

### 2.5 `?status=pending` filter (access requests) — fixed, please verify

- This was returning approved requests too. Backend dev confirmed fix. Please add a smoke test to prevent regression: `GET /api/accounts/access-requests/?status=pending` must return only `status == "pending"` rows.

### 2.6 Approve/reject idempotency — apply pattern broadly

- Access-requests' approve now returns `200` instead of `400` when called on an already-approved request. Good.
- Please apply the same pattern to **every state-transition endpoint**:
  - `POST /api/buyers/{id}/activate` — should return `200` if already active
  - `POST /api/buyers/{id}/pause` — should return `200` if already paused
  - `POST /api/campaigns/{id}/activate` — same
  - `POST /api/campaigns/{id}/pause` — same
  - `POST /api/publishers/{id}/activate` — same
  - `POST /api/publishers/{id}/pause` — same
  - `POST /api/spam/blacklist/{id}/deactivate` — same
  - `POST /api/analytics/reports/{id}/activate` and `/pause/` — same
- Generally: state transitions should be **idempotent**. Calling them on an entity already in the target state should succeed with `200`, not error.

### 2.7 AI service returning rows with null fields

- `GET /api/ai/recommendations` and `GET /api/ai/anomalies` occasionally return rows where `action`, `category`, or `metric` is `null`.
- The frontend used to crash with `Cannot read properties of undefined (reading 'toLowerCase')` — now patched defensively, but **the backend shouldn't send these as null at all**.
- **Action:** ensure these fields are always populated (or omit the row).

### 2.8 Email send blocks the approve endpoint

- `POST /api/accounts/access-requests/{id}/approve/` sends the setup email synchronously.
- If email delivery fails (Gmail rejects, SMTP misconfig, rate limit), the whole approve call returns `500` and the request stays in `pending`.
- **Action:** wrap email send in `try/except`. Approve should always succeed on the DB side if the request is valid; failed email goes to a retry queue. Return a partial success response if needed (`{ status: "approved", email_sent: false, email_error: "..." }`) so the admin UI can show "Approved, but couldn't send the email — here's the setup link to share manually."

### 2.9 No 500 should ever return HTML

- Multiple endpoints have returned Django's default HTML error page on 500. The frontend then tries to parse that as JSON, fails, and ends up showing raw `<!doctype html>...` in toast messages.
- **Action:** configure the JSON error handler globally so even unhandled exceptions return:
  ```json
  { "detail": "Internal server error", "code": "internal_error" }
  ```
  …with `Content-Type: application/json`.

### 2.10 Missing role/permission endpoints

- The Workspace > Roles page hardcodes the list of roles (`admin`, `manager`, `agent`, `buyer`, `publisher`, `viewer`) and their descriptions.
- This is acknowledged as frontend-only for now. **Future:** add `GET /api/accounts/workspace/roles/` returning `{ slug, name, description, permission_count, total_permissions, member_count }`. See §3.12 for the proposed shape.

### 2.11 Document upload endpoint asymmetry

- `POST /api/kyc/documents/upload` accepts multipart and returns `{ url }`. **Confirmed working.**
- For consistency, please use the same pattern for any other file uploads we add later (account avatar already follows it at `POST /api/accounts/me/avatar`).

---

## 3. Per-resource schemas

For each resource, the canonical field set as the frontend sees it. Wire is snake_case; everything below is shown in camelCase for readability — the backend should snake_case-ify on the wire.

### 3.1 User

| Field | Type | Required | Notes |
|---|---|---|---|
| id | uuid | ✓ | |
| email | string | ✓ | |
| firstName | string | ✓ | |
| lastName | string | ✓ | |
| role | enum (`admin` \| `manager` \| `agent` \| `buyer` \| `publisher` \| `viewer`) | ✓ | |
| phoneNumber | string? | – | E.164 |
| organizationId | uuid? | – | |
| organizationName | string? | – | Echoed for display |
| avatarUrl | string? | – | Uploaded via `POST /api/accounts/me/avatar` |
| mfaEnabled | bool? | – | |
| isEmailVerified | bool? | – | |
| isSuperuser | bool | ✓ | **NEW.** Required for admin bypass of KYC + balance gates. Default `false`. |

### 3.2 Workspace

| Field | Type | Required | Notes |
|---|---|---|---|
| id | uuid | ✓ | |
| name | string | ✓ | |
| slug | string | ✓ | |
| isActive | bool | ✓ | |
| createdAt | datetime | ✓ | |
| memberCount | int? | – | |
| planTier | string? | – | |

### 3.3 Member

| Field | Type | Required | Notes |
|---|---|---|---|
| id (or userId) | uuid | ✓ | Either name accepted by frontend |
| name | string? | – | Falls back to email local-part |
| email | string | ✓ | |
| role | enum (see User.role) | ✓ | |
| status | enum (`active` \| `suspended`) | ✓ | Note: no `invited` — invited members appear as `active` immediately |
| invitedAt | datetime? | – | |
| joinedAt | datetime? | – | |
| lastActiveAt | datetime? | – | |

### 3.4 Access Request

| Field | Type | Required | Notes |
|---|---|---|---|
| id | uuid | ✓ | |
| name | string | ✓ | |
| company | string | ✓ | |
| email | string | ✓ | |
| phone | string | ✓ | |
| useCase | string | ✓ | |
| status | enum (`pending` \| `approved` \| `rejected`) | ✓ | |
| createdAt | datetime | ✓ | |
| reviewedAt | datetime? | – | |
| reviewedBy | uuid? | – | User ID of approver |
| rejectionReason | string? | – | |
| setupLink | string? | – | **Returned on approve response only**; the URL the user clicks in the email to set their password |

### 3.5 KYC Submission

| Field | Type | Required | Notes |
|---|---|---|---|
| id | uuid | ✓ | |
| kycType | enum (`individual` \| `company`) | ✓ | |
| status | enum (`draft` \| `submitted` \| `approved` \| `rejected` \| `expired`) | ✓ | |
| rejectionReason | string? | – | |
| country | string | ✓ | ISO 3166 country name or code |
| address | string | ✓ | Multi-line free-text |
| phoneNumber | string | ✓ | |
| fullLegalName | string? | individual only | |
| dateOfBirth | date? | individual only | |
| governmentIdUrl | string? | individual only | URL returned by `/api/kyc/documents/upload` |
| companyLegalName | string? | company only | |
| businessRegistrationNumber | string? | company only | |
| taxId | string? | company only | |
| directorName | string? | company only | |
| businessRegistrationDocUrl | string? | company only | URL returned by `/api/kyc/documents/upload` |
| submittedAt | datetime? | – | |
| reviewedAt | datetime? | – | |

### 3.6 Billing Account

| Field | Type | Required | Notes |
|---|---|---|---|
| id | uuid | ✓ | |
| balance | decimal | ✓ | Frontend renders as currency |
| creditLimit | decimal | ✓ | |
| lowBalanceThreshold | decimal | ✓ | 0 = alert disabled |
| autoRecharge | bool | ✓ | |
| autoRechargeAmount | decimal | ✓ | |
| autoRechargeThreshold | decimal | ✓ | |
| currency | string? | – | ISO 4217 |
| status | string? | – | |
| plan.tier | string? | – | Nested plan object, omit if not on a paid plan |
| plan.monthlyCost | decimal? | – | |
| plan.callsIncluded | int? | – | |
| plan.overageRatePerCall | decimal? | – | |
| plan.renewsAt | datetime? | – | |

### 3.7 Buyer

| Field | Type | Required | Notes |
|---|---|---|---|
| id | uuid | ✓ | |
| name | string | ✓ | |
| description | string? | – | |
| status | enum (`active` \| `paused` \| `capped` \| `pending`) | ✓ | |
| routingType | enum (`priority` \| `round_robin` \| `weighted` \| `rtb`) | ✓ | |
| phoneNumber | string | ✓ | E.164 |
| payoutAmount | decimal | ✓ | |
| sipEndpoint | string? | – | |
| minCallDuration | int? | – | Seconds |
| maxConcurrency | int? | – | 0 = unlimited |
| dupWindowDays | int? | – | |
| qualityScore | int? | – | 0–100 |
| cap.maxCallsDaily | int? | – | Nested cap object |
| cap.maxCallsMonthly | int? | – | |
| cap.maxCallsGlobal | int? | – | |
| cap.maxConcurrency | int? | – | |
| campaigns | uuid[] | – | Attached campaign IDs |
| createdAt | datetime | ✓ | |

### 3.8 Campaign

The most complete schema. Already confirmed against backend.

| Field | Type | Required | Notes |
|---|---|---|---|
| id | uuid | ✓ | |
| name | string | ✓ | |
| description | string? | – | |
| status | enum (`active` \| `paused` \| `archived`) | ✓ | **No `draft`.** Default new campaigns to `paused`. |
| routingType | enum (`priority` \| `round_robin` \| `weighted` \| `rtb`) | ✓ | |
| vertical | enum (`health` \| `auto` \| `home` \| `finance` \| `legal` \| `insurance` \| `other`) | ✓ | |
| payoutModel | enum (`per_call` \| `per_qualified` \| `per_minute`) | ✓ | |
| payoutAmount | decimal | ✓ | What publisher receives |
| revenueAmount | decimal | ✓ | What buyer pays |
| minCallDuration | int | – | Seconds, default 30 |
| duplicateCallBlock | bool | – | Default false |
| duplicateCallBlockHours | int | – | Default 24 |
| bidFloor | decimal? | – | RTB only |
| rtbTimeoutSeconds | int? | – | Default 5 |
| recordingEnabled | bool | – | Default true |
| greetingEnabled | bool | – | Default false |
| greetingMessage | string? | – | |
| whisperEnabled | bool | – | Default false |
| whisperMessage | string? | – | |
| autoSmsEnabled | bool | – | Default false |
| autoSmsMessage | string? | – | |
| queueEnabled | bool | – | Default false |
| queueMaxSize | int? | – | Default 10 |
| queueMaxWaitSeconds | int? | – | Default 300 |
| queueMusicUrl | string? | – | |
| queueMessage | string? | – | |
| cap.maxCallsDaily | int | – | Default 0 |
| cap.maxCallsMonthly | int | – | Default 0 |
| cap.maxCallsGlobal | int | – | Default 0 |
| cap.maxConcurrency | int | – | Default 0 |
| schedules[].dayOfWeek | int (0=Mon..6=Sun) | ✓ per schedule | |
| schedules[].openTime | `"HH:MM"` | ✓ per schedule | **Not** HH:MM:SS — see §2.3 |
| schedules[].closeTime | `"HH:MM"` | ✓ per schedule | |
| schedules[].isClosed | bool | ✓ per schedule | When true, this day is off regardless of times |
| organizationId | uuid | ✓ | Auto-set from caller's org |
| createdById | uuid | ✓ | Auto-set from caller |
| createdAt | datetime | ✓ | |
| updatedAt | datetime | ✓ | |

### 3.9 Destination

| Field | Type | Required | Notes |
|---|---|---|---|
| id | uuid | ✓ | |
| buyerId | uuid | ✓ | FK to Buyer |
| buyerName | string | – | Read-only echo from FK |
| tfn | string | ✓ | E.164 phone OR SIP URI depending on `forwardType` |
| name | string | ✓ | Operator-friendly label |
| forwardType | enum (`number` \| `sip`) | – | Default `number` |
| concurrencyCap | int | – | Default 0 (unlimited) |
| hourlyCap | int | – | Default 0 |
| dailyCap | int | – | Default 0 |
| monthlyCap | int | – | Default 0 |
| globalCap | int | – | Default 0 |
| enabled | bool | – | Default true |
| ringDurationSec | int | – | Default 25 |
| timezone | string? | – | IANA, null = use org TZ |
| liveCalls | int | – | **Read-only.** Current ringing/in-progress count |
| hourlyCalls | int | – | **Read-only.** This hour |
| dailyCalls | int | – | **Read-only.** Today |
| monthlyCalls | int | – | **Read-only.** This month |
| globalCalls | int | – | **Read-only.** Lifetime |
| filterEnabled | bool | – | Default false |
| filterGroups[].id | uuid | – | |
| filterGroups[].conditions[].id | uuid | – | |
| filterGroups[].conditions[].parameter | string | – | |
| filterGroups[].conditions[].operator | string | – | |
| filterGroups[].conditions[].value | string | – | |
| businessHoursEnabled | bool | – | Default false |
| businessHourSlots[].id | uuid | – | |
| businessHourSlots[].days | string[] (`mon`..`sun`) | – | **3-letter lowercase**, not integers |
| businessHourSlots[].from | `"HH:MM"` | – | |
| businessHourSlots[].to | `"HH:MM"` | – | |
| createdAt | datetime | ✓ | |
| updatedAt | datetime | ✓ | |

**Stats endpoint** (`GET /api/destinations/stats/`):

| Field | Type | Notes |
|---|---|---|
| activeLive | int | Count of destinations with `live_calls > 0` AND `enabled` |
| totalLive | int | Sum of `live_calls` across all destinations |
| totalCc | int | Sum of `concurrency_cap` across `enabled` destinations |
| activeTfns | int | Count of destinations where `enabled = true` |
| vacantCc | int | `total_cc - total_live` |

### 3.10 Publisher

| Field | Type | Required | Notes |
|---|---|---|---|
| id | uuid | ✓ | |
| name | string | ✓ | |
| description | string? | – | |
| status | enum (`active` \| `paused` \| `pending`) | ✓ | |
| email | string | ✓ | |
| phoneNumber | string? | – | |
| payoutAmount | decimal | ✓ | |
| uniqueId | string | ✓ | Tracking handle for DNI |
| cap.* | int | – | Same nested shape as Buyer |
| campaigns | uuid[] | – | |
| createdAt | datetime | ✓ | |

### 3.11 Phone Number / Pool

**Number:**

| Field | Type | Required | Notes |
|---|---|---|---|
| id | uuid | ✓ | |
| number | string | ✓ | E.164 |
| type | enum (`local` \| `toll_free` \| `mobile` \| `international`) | ✓ | |
| status | enum (`active` \| `paused` \| `released`) | ✓ | |
| campaignId | uuid? | – | |
| campaignName | string? | – | |
| poolId | uuid? | – | |
| poolName | string? | – | |
| state | string? | – | US state code |
| city | string? | – | |
| monthlyCost | decimal | ✓ | |
| callsToday | int | – | Read-only |
| callsMonthly | int | – | Read-only |
| conversionRate | decimal | – | Read-only |
| provisionedAt | datetime | ✓ | |
| lastCallAt | datetime? | – | Read-only |

**Pool** (DNI):

| Field | Type | Required | Notes |
|---|---|---|---|
| id | uuid | ✓ | |
| name | string | ✓ | |
| campaignId | uuid | ✓ | |
| campaignName | string? | – | Read-only echo |
| rotationStrategy | enum (`random` \| `priority` \| `least_used`) | ✓ | |
| numberCount | int | – | Read-only |
| callsToday | int | – | Read-only |
| active | bool | ✓ | |
| country | string? | – | |
| closedBrowserDelaySec | int? | – | |
| idleTimeSec | int? | – | |
| autoBuy | bool? | – | |
| attachedNumberIds | uuid[] | – | |

### 3.12 Roles (proposed — does not exist yet)

For the Workspace > Roles tab. The frontend currently hardcodes this.

**`GET /api/accounts/workspace/roles/`:**
```json
{
  "items": [
    {
      "slug": "admin",
      "name": "Admin",
      "description": "Full access. Can manage members and billing.",
      "is_builtin": true,
      "permission_count": 55,
      "total_permissions": 55,
      "member_count": 1
    },
    ...
  ]
}
```

Slugs: `admin`, `manager`, `agent`, `buyer`, `publisher`, `viewer`.

### 3.13 Call Record (CDR)

| Field | Type | Required | Notes |
|---|---|---|---|
| id | uuid | ✓ | |
| callSid | string? | – | Telco-side ID |
| callerNumber | string | ✓ | E.164 |
| destinationNumber | string | ✓ | E.164 |
| campaignId | uuid? | – | |
| buyerId | uuid? | – | |
| publisherId | uuid? | – | |
| status | enum (`ringing` \| `in_progress` \| `completed` \| `missed` \| `rejected` \| `failed`) | ✓ | |
| durationSec | int | – | |
| revenue | decimal | – | |
| payout | decimal | – | |
| isConverted | bool | – | |
| startedAt | datetime | ✓ | |
| endedAt | datetime? | – | |

---

## 4. Endpoint catalog

Every URL the frontend calls. Use this as a checklist — every row must respond correctly.

### 4.1 Authentication (`/api/accounts/`)

| Method | Path | Anon? | Notes |
|---|---|---|---|
| POST | `/api/accounts/login` | ✓ | |
| POST | `/api/accounts/register` | ✓ | |
| POST | `/api/accounts/refresh` | ✓ | Used by frontend's auto-retry |
| POST | `/api/accounts/logout` | | |
| GET | `/api/accounts/me` | | Must include `isSuperuser` |
| PATCH | `/api/accounts/me` | | |
| POST | `/api/accounts/change-password` | | |
| POST | `/api/accounts/password-reset/request` | ✓ | |
| POST | `/api/accounts/password-reset/confirm` | ✓ | |
| POST | `/api/accounts/me/avatar` | | Multipart |

### 4.2 Access Requests (`/api/accounts/access-requests/`)

| Method | Path | Anon? | Notes |
|---|---|---|---|
| POST | `/api/accounts/access-requests/` | ✓ | Rate-limit 5/min by IP |
| GET | `/api/accounts/access-requests/?status=pending` | | Admin only |
| POST | `/api/accounts/access-requests/{id}/approve/` | | Idempotent (return 200 if already approved) |
| POST | `/api/accounts/access-requests/{id}/reject/` | | Idempotent |
| POST | `/api/accounts/set-password/` | ✓ | Returns login-shape tokens |

### 4.3 Workspace (`/api/accounts/workspace/`)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/accounts/workspace` | |
| PATCH | `/api/accounts/workspace` | |
| GET | `/api/accounts/workspace/members` | |
| POST | `/api/accounts/workspace/members/invite` | |
| PATCH | `/api/accounts/workspace/members/{userId}/role` | Body can also patch `status` |
| DELETE | `/api/accounts/workspace/members/{userId}` | |
| **TODO** | `/api/accounts/workspace/roles/` | See §3.12 |

### 4.4 KYC (`/api/kyc/`)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/kyc/` | 404 if no submission yet |
| POST | `/api/kyc/` | Individual |
| POST | `/api/kyc/company/` | Company |
| POST | `/api/kyc/documents/upload` | Multipart, returns `{ url }` |

### 4.5 Billing (`/api/billing/`)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/billing/account` | |
| PATCH | `/api/billing/account` | |
| GET | `/api/billing/expenses` | |
| GET | `/api/billing/invoices` | Paginated |
| GET | `/api/billing/transactions` | Paginated |
| GET | `/api/billing/payment-methods` | |
| POST | `/api/billing/payment-methods` | |
| DELETE | `/api/billing/payment-methods/{id}` | |
| POST | `/api/billing/deposit` | Returns Stripe `client_secret` |
| POST | `/api/billing/deposit/confirm` | |
| POST | `/api/billing/deposit/capitalist?amount=&currency=` | Query params, NOT body |
| POST | `/api/billing/deposit/coingate` | Body |

### 4.6 Campaigns (`/api/campaigns/`)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/campaigns/` | Paginated |
| GET | `/api/campaigns/{id}` | |
| POST | `/api/campaigns/` | See §3.8 for full body |
| PATCH | `/api/campaigns/{id}` | |
| DELETE | `/api/campaigns/{id}` | |
| POST | `/api/campaigns/{id}/activate` | Idempotent |
| POST | `/api/campaigns/{id}/pause` | Idempotent |
| PATCH | `/api/campaigns/{id}/cap` | Nested cap fields |
| PUT | `/api/campaigns/{id}/schedules` | Replaces full schedule array |

### 4.7 Buyers (`/api/buyers/`)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/buyers/` | Paginated |
| GET | `/api/buyers/{id}` | |
| POST | `/api/buyers/` | |
| PATCH | `/api/buyers/{id}` | |
| DELETE | `/api/buyers/{id}` | |
| POST | `/api/buyers/{id}/activate` | Idempotent |
| POST | `/api/buyers/{id}/pause` | Idempotent |
| PATCH | `/api/buyers/{id}/cap` | |
| GET | `/api/buyers/{id}/stats` | |
| POST | `/api/buyers/{id}/campaigns` | Attach campaign |
| DELETE | `/api/buyers/{id}/campaigns/{campaignId}` | Detach |

### 4.8 Destinations (`/api/destinations/`)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/destinations/?page=&page_size=&status=&buyer_id=&search=` | Paginated |
| GET | `/api/destinations/stats/` | Aggregate, see §3.9 |
| GET | `/api/destinations/{id}/` | |
| POST | `/api/destinations/` | Currently 500 — see §2.2 |
| PATCH | `/api/destinations/{id}/` | Also toggles enabled via `{ enabled }` |
| DELETE | `/api/destinations/{id}/` | |

### 4.9 Publishers (`/api/publishers/`)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/publishers/` | Paginated |
| GET | `/api/publishers/{id}` | |
| POST | `/api/publishers/` | |
| PATCH | `/api/publishers/{id}` | |
| DELETE | `/api/publishers/{id}` | |
| POST | `/api/publishers/{id}/activate` | Idempotent |
| POST | `/api/publishers/{id}/pause` | Idempotent |
| PATCH | `/api/publishers/{id}/cap` | |
| POST | `/api/publishers/{id}/campaigns` | |
| DELETE | `/api/publishers/{id}/campaigns/{campaignId}` | |
| GET | `/api/publishers/{id}/payouts` | |

### 4.10 Numbers & DNI Pools

| Method | Path | Notes |
|---|---|---|
| GET | `/api/numbers/` | Paginated |
| GET | `/api/numbers/{id}` | |
| PATCH | `/api/numbers/{id}` | |
| DELETE | `/api/numbers/{id}/release` | |
| POST | `/api/numbers/search` | Twilio-like search by area code |
| POST | `/api/numbers/purchase` | |
| POST | `/api/numbers/import` | |
| POST | `/api/numbers/{id}/assign` | |
| GET | `/api/dni/pools` | Paginated |
| GET | `/api/dni/pools/{id}` | |
| POST | `/api/dni/pools` | |
| PATCH | `/api/dni/pools/{id}` | |
| DELETE | `/api/dni/pools/{id}` | |
| POST | `/api/dni/pools/{poolId}/numbers` | Attach number |
| DELETE | `/api/dni/pools/{poolId}/numbers/{numberId}` | Detach |

### 4.11 Routing (`/api/routing/rules`)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/routing/rules` | Paginated |
| GET | `/api/routing/rules/{id}` | |
| POST | `/api/routing/rules` | |
| PATCH | `/api/routing/rules/{id}` | |
| DELETE | `/api/routing/rules/{id}` | |
| POST | `/api/routing/rules/{ruleId}/conditions` | |
| POST | `/api/routing/rules/{ruleId}/destinations` | This is the routing-weight destination, NOT the Destination resource in §4.8 |

### 4.12 IVR (`/api/ivr/`)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/ivr/flows` | |
| GET | `/api/ivr/flows/{id}` | |
| POST | `/api/ivr/flows` | |
| PATCH | `/api/ivr/flows/{id}` | |
| DELETE | `/api/ivr/flows/{id}` | |
| POST | `/api/ivr/flows/{flowId}/nodes` | |
| POST | `/api/ivr/flows/{flowId}/transitions` | |

### 4.13 Queue (`/api/queue/`)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/queue/` | |

### 4.14 Spam & Shields (`/api/spam/`)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/spam/blacklist` | **Currently 500** — see §2.1 |
| GET | `/api/spam/blacklist/{id}` | |
| POST | `/api/spam/blacklist` | |
| PATCH | `/api/spam/blacklist/{id}` | |
| POST | `/api/spam/blacklist/{id}/deactivate` | |
| DELETE | `/api/spam/blacklist/{id}` | |
| GET | `/api/spam/whitelist` | Same pattern as blacklist |
| GET | `/api/spam/whitelist/{id}` | |
| POST | `/api/spam/whitelist` | |
| PATCH | `/api/spam/whitelist/{id}` | |
| DELETE | `/api/spam/whitelist/{id}` | |
| GET | `/api/spam/reports` | |
| GET | `/api/spam/check?number=` | |
| GET | `/api/spam/anonymous-block` | |
| POST | `/api/spam/anonymous-block` | |
| PATCH | `/api/spam/anonymous-block/{campaignId}` | |
| GET | `/api/spam/shields/?shield_type=voip|tcpa` | |
| GET | `/api/spam/shields/{id}/` | |
| POST | `/api/spam/shields/` | |
| PATCH | `/api/spam/shields/{id}/` | |
| DELETE | `/api/spam/shields/{id}/` | |

### 4.15 Calls (`/api/routing/calls/`)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/routing/calls` | Paginated |
| GET | `/api/routing/calls/{id}` | Detail incl. transcription |
| GET | `/api/routing/calls/live` | Streaming the live ones |

### 4.16 Analytics (`/api/analytics/`)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/analytics/dashboard` | KPI roll-up |
| GET | `/api/analytics/time-series` | Charting |
| GET | `/api/analytics/calls` | Uses `offset`/`limit` not pages |
| GET | `/api/analytics/live` | |
| GET | `/api/analytics/campaigns` | |
| GET | `/api/analytics/buyers` | |
| GET | `/api/analytics/publishers` | |
| GET | `/api/analytics/caller-profile/{callerNumber}` | |
| GET | `/api/analytics/calls/{callId}/recording` | |
| GET | `/api/analytics/calls/export` | Returns CSV |

### 4.17 Scheduled Reports (`/api/analytics/reports/`)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/analytics/reports/` | |
| GET | `/api/analytics/reports/{id}/` | |
| POST | `/api/analytics/reports/` | |
| PATCH | `/api/analytics/reports/{id}/` | |
| DELETE | `/api/analytics/reports/{id}/` | |
| POST | `/api/analytics/reports/{id}/pause/` | Idempotent |
| POST | `/api/analytics/reports/{id}/activate/` | Idempotent |

### 4.18 Notifications (`/api/notifications/`)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/notifications/rules` | |
| GET | `/api/notifications/rules/{id}` | |
| POST | `/api/notifications/rules` | |
| PATCH | `/api/notifications/rules/{id}` | |
| DELETE | `/api/notifications/rules/{id}` | |
| POST | `/api/notifications/test` | Send test message |
| GET | `/api/notifications/logs` | |

### 4.19 Webhooks (`/api/webhooks/`)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/webhooks/` | |
| GET | `/api/webhooks/{id}` | |
| POST | `/api/webhooks/` | |
| PATCH | `/api/webhooks/{id}` | |
| DELETE | `/api/webhooks/{id}` | |
| POST | `/api/webhooks/{id}/test` | Send test webhook |
| GET | `/api/webhooks/{id}/deliveries` | |
| GET | `/api/webhooks/pixels/` | |
| GET | `/api/webhooks/pixels/{id}` | |
| POST | `/api/webhooks/pixels/` | |
| PATCH | `/api/webhooks/pixels/{id}/` | |
| DELETE | `/api/webhooks/pixels/{id}/` | |

### 4.20 AI Insights (`/api/ai/`)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/ai/recommendations/` | See §2.7 |
| GET | `/api/ai/anomalies/` | See §2.7 |
| GET | `/api/ai/autopilot/config/` | |
| PATCH | `/api/ai/autopilot/config/` | |
| POST | `/api/ai/autopilot/` | Trigger a pass |

### 4.21 Marketplace / RTB (`/api/rtb/`)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/rtb/auctions` | |
| GET | `/api/rtb/auctions/{id}` | |
| GET | `/api/rtb/auctions/{auctionId}/bids` | |
| POST | `/api/rtb/bid` | |

### 4.22 White Label (`/api/white-label/`)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/white-label/` | 404 if not configured |
| PATCH | `/api/white-label/` | |
| GET | `/api/white-label/config?domain=` | |
| POST | `/api/white-label/domains` | |
| DELETE | `/api/white-label/domains/{id}` | |
| POST | `/api/white-label/domains/{id}/verify` | |

---

## 5. Action checklist for backend

In priority order:

### Blocker bugs (fix today)

- [ ] §2.1 — `GET /api/spam/blacklist` must stop returning 500
- [ ] §2.2 — `POST /api/destinations/` must stop returning 500 (likely buyer FK or required field issue)
- [ ] §2.9 — No endpoint should ever return HTML on error; switch to JSON-only error handler

### High priority (fix this week)

- [ ] §2.3 — Pick one time format (`HH:MM` or `HH:MM:SS`) and use it consistently for read AND write
- [ ] §2.4 — Default campaign status on create should be `paused`, not `active`
- [ ] §2.6 — Make every state-transition endpoint idempotent (activate/pause/approve/etc.)
- [ ] §2.7 — AI service should never return rows with null `action`/`category`/`metric`
- [ ] §2.8 — Wrap email send in try/except so SMTP failures don't 500 the approve endpoint

### Medium priority

- [ ] Seed dev DB with realistic test data for buyers, campaigns, destinations, publishers — so FK validation passes during E2E testing
- [ ] §3.12 — Add `GET /api/accounts/workspace/roles/` so we can drop hardcoded role list
- [ ] §2.5 — Add regression test for `?status=` filter on access requests

### Convention cleanup (any time)

- [ ] Verify every endpoint follows §1.1–1.9 conventions
- [ ] Add OpenAPI spec generation so this contract doc can be auto-checked
- [ ] Confirm `GET /api/accounts/me` includes `is_superuser`

---

## 6. Questions for the backend dev

Please answer these inline and return:

1. What is the refresh token TTL? (Access token is 1 hour; what's the refresh token's lifetime?)
2. Do you have OpenAPI / Swagger docs we can point to as the canonical contract? If not, would you set one up?
3. The `vertical` and `payout_model` enums for campaigns — do their backend column types match the documented values exactly?
4. For routing rules: what does `destination_type: "buyer"` resolve to — a `buyer_id` foreign key or a free-text string?
5. Are there endpoints we're not aware of that you've already built (queue management, IVR node editor, RTB bidding) that we should plug into?
6. Is there a per-org timezone field we should be reading? Multiple resources (campaigns, schedules) refer to "org timezone" but I don't see it in the workspace or account schema.

---

**End of document.** Please respond with status per checklist item in §5 and answers to §6.
