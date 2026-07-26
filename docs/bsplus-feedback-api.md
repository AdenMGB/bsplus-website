# BetterSEQTA+ extension feedback API

HTTP API for in-extension user feedback (bugs, feature requests, general comments).

**Base URL:** `https://betterseqta.org`  
**Prefix:** `/api/bsplus/feedback`

## Auth

| Actor | Auth |
|-------|------|
| Extension → `POST` | None (anonymous). Rate-limited. |
| Extension → `GET …/status` | None. Caller must know `installId` (and optionally feedback `id`). |
| Admin triage → `GET` / `PATCH` | Staff session via `requireAdmin` (`admin_level >= 1`). |

## Submit feedback

### `POST /api/bsplus/feedback`

Accepts JSON (`schemaVersion: 1`). Returns **201**:

```json
{
  "id": "fb_01JABCDEFGHJKLMNPQRSTUVWX",
  "created_at": "2026-07-26T05:51:01.234Z",
  "status": "received"
}
```

Errors use a flat body:

```json
{
  "error": "message",
  "code": "VALIDATION_ERROR"
}
```

| HTTP | Code |
|------|------|
| 400 | `VALIDATION_ERROR` (malformed JSON) |
| 413 | `PAYLOAD_TOO_LARGE` (max 32 KB) |
| 422 | `VALIDATION_ERROR` / `UNSUPPORTED_SCHEMA` |
| 429 | `RATE_LIMITED` (+ `Retry-After` seconds) |
| 500 | unexpected |

### Rate limits

| Limit | Window | Scope |
|-------|--------|--------|
| 5 | 1 hour | per `installId` |
| 20 | 1 hour | per client IP (stored as salted hash) |
| 50 | 24 hours | per `installId` |

### Example

```bash
curl -X POST 'https://betterseqta.org/api/bsplus/feedback' \
  -H 'Content-Type: application/json' \
  -d '{
    "schemaVersion": 1,
    "installId": "550e8400-e29b-41d4-a716-446655440000",
    "category": "feature",
    "subject": "Export timetable to ICS",
    "message": "Would love a one-click ICS export from the timetable page.",
    "extension": {
      "version": "3.7.3",
      "browser": "firefox",
      "browserVersion": "128.0",
      "os": "macOS",
      "channel": "stable"
    },
    "contact": { "include": false },
    "instance": { "include": false },
    "context": { "page": "timetable", "locale": "en-AU", "darkMode": true },
    "clientSubmittedAt": "2026-07-26T05:51:00.000Z"
  }'
```

## Check status / response (extension client)

### `GET /api/bsplus/feedback/status`

No login. Access is capability-based via the anonymous `installId` UUID stored in the extension.

| Query | Required | Notes |
|-------|----------|--------|
| `installId` | Yes | RFC 4122 UUID |
| `id` | No | Feedback ref (`fb_…`). When set, returns one item (404 if not found **or** not owned by this install). |
| `limit` | No | List mode only. 1–20, default 10. |

**Single item** (`?installId=…&id=fb_…`):

```json
{
  "id": "fb_01JABCDEFGHJKLMNPQRSTUVWX",
  "status": "resolved",
  "category": "bug",
  "subject": "Assessments average missing",
  "created_at": "2026-07-26T05:51:01.234Z",
  "updated_at": "2026-07-26T08:10:00.000Z",
  "has_response": true,
  "response": "Thanks — this should be fixed in 3.7.4.",
  "responded_at": "2026-07-26T08:10:00.000Z"
}
```

**List** (`?installId=…`):

```json
{
  "install_id": "550e8400-e29b-41d4-a716-446655440000",
  "count": 1,
  "items": [ { "...": "same shape as single item" } ]
}
```

Does **not** return contact details, instance hostname, internal notes, IP, or user agent.

```bash
curl 'https://betterseqta.org/api/bsplus/feedback/status?installId=550e8400-e29b-41d4-a716-446655440000&id=fb_01JABCDEFGHJKLMNPQRSTUVWX'
```

## Admin triage (staff only)

UI: [`/admin/feedback`](https://betterseqta.org/admin/feedback) (requires `admin_level >= 1`).

- `GET /api/bsplus/feedback` — query: `status`, `category`, `installId`, `from`, `to`, `q`, `cursor`, `limit`
- `GET /api/bsplus/feedback/stats` — open/received/awaiting-reply counts
- `GET /api/bsplus/feedback/:id`
- `PATCH /api/bsplus/feedback/:id` — body: `{ "status", "internal_notes", "admin_response" }`

Statuses: `received` → `triaged` → `in_progress` → `resolved` → `wontfix` → `spam`.

Saving `admin_response` records `responded_at` / `responded_by`. Outbound email is not sent by the API yet — the admin UI opens a `mailto:` draft when contact details were opted in.

## Database

Migrations:

- `server/database/migrations/012_feedback_submissions.sql`
- `server/database/migrations/013_feedback_admin_response.sql`

Apply with Wrangler:

```bash
pnpm exec wrangler d1 execute bsplus-db --remote --file=server/database/migrations/012_feedback_submissions.sql
pnpm exec wrangler d1 execute bsplus-db --remote --file=server/database/migrations/013_feedback_admin_response.sql
```

For local D1, omit `--remote` (or use your usual local execute flow).

Optional env: `FEEDBACK_IP_SALT` — salt for IP hashing used only for abuse limits.

## Privacy

Contact name/email and instance hostname are **opt-in only**. See [/privacy](https://betterseqta.org/privacy) §6 Extension Feedback.
