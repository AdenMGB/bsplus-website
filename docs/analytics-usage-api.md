# BetterSEQTA Cloud Analytics Usage API

This document describes the API for receiving daily usage reports from the DesQTA app. DesQTA implements the client; BetterSEQTA Cloud (betterseqta.org) implements this receiving endpoint.

---

## 1. Endpoint

**URL:** `POST https://betterseqta.org/api/analytics/usage`

**Base URL (dev):** `https://dev.betterseqta.org/api/analytics/usage`

---

## 2. Authentication

The endpoint supports two modes:

| Mode | Description |
|------|-------------|
| **Option A (anonymous)** | No auth required. Client sends `client_id` in the request body (from DesQTA's reserved OAuth client). Server accepts and stores; no user linkage. Used for deduplication and device identification. |
| **Option B (authenticated)** | Send `Authorization: Bearer <token>` when the user is logged in. Server associates the report with the user ID for analytics dashboards; data remains anonymized per privacy policy. |

If a Bearer token is provided but invalid/expired, the request is processed as anonymous.

---

## 3. Request

### Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Content-Type` | Yes | Must be `application/json` |
| `Authorization` | No | `Bearer <token>` — optional, for user association |

### Body (JSON)

```json
{
  "date": "2025-02-25",
  "sessions_count": 3,
  "cloud_signed_in": true,
  "app_version": "1.2.3",
  "platform": "windows",
  "client_id": "reserved-client-id-from-desqta-oauth-flow"
}
```

### Field Reference

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `date` | string | Yes | ISO date (YYYY-MM-DD) for the day this report covers |
| `sessions_count` | number | Yes | Number of app sessions (launches) that day |
| `cloud_signed_in` | boolean | Yes | Whether user was signed into BetterSEQTA Cloud |
| `app_version` | string | No | DesQTA app version (e.g. `1.2.3`) |
| `platform` | string | No | One of: `windows`, `macos`, `linux`, `android`, `ios` |
| `client_id` | string | No | DesQTA's reserved client ID (from OAuth flow). Used for deduplication and device identification when no auth. Same ID the app uses for auth. |

---

## 4. Response

### Success

**Status:** `200 OK` or `201 Created`

**Body:**
```json
{
  "ok": true
}
```

### Error

**Status:** `4xx` or `5xx`

**Body:** Error message (plain text or JSON depending on error type)

| Status | Description |
|--------|-------------|
| `400 Bad Request` | Invalid body, missing required fields, or invalid field values |
| `405 Method Not Allowed` | Request method is not POST |
| `500 Internal Server Error` | Server/database error. Client should retry later (e.g. next hour) |

---

## 5. Error Response Examples

**Missing required field:**
```json
{
  "statusCode": 400,
  "message": "date is required (ISO date YYYY-MM-DD)"
}
```

**Invalid date format:**
```json
{
  "statusCode": 400,
  "message": "date must be ISO format YYYY-MM-DD"
}
```

**Invalid platform:**
```json
{
  "statusCode": 400,
  "message": "platform must be one of: windows, macos, linux, android, ios"
}
```

---

## 6. Client Behavior

- **Retry:** On 4xx/5xx, the client should retry later (e.g. next hour or on next app launch).
- **Idempotency:** Each report is stored as a separate row. Multiple reports per day per device are acceptable (e.g. hourly batches).
- **Batching:** Client may send one report per day or multiple reports (e.g. hourly) — server accepts both.

---

## 7. Optional Future Fields (Phase 2)

These fields may be added in a future version. Clients can include them; server will ignore unknown fields for now.

| Field | Type | Description |
|-------|------|-------------|
| `features_used` | object | Counts of feature usage per day, e.g. `{ "dashboard": 1, "study": 2, "analytics": 1 }` |
| `theme` | string | `dark` \| `light` \| `system` — for theme adoption stats |
| `language` | string | Locale code, e.g. `en` — for locale distribution |

---

## 8. Example Requests

### cURL (anonymous)

```bash
curl -X POST "https://betterseqta.org/api/analytics/usage" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-02-25",
    "sessions_count": 3,
    "cloud_signed_in": true,
    "app_version": "1.2.3",
    "platform": "windows",
    "client_id": "desqta-reserved-client-id"
  }'
```

### cURL (authenticated)

```bash
curl -X POST "https://betterseqta.org/api/analytics/usage" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "date": "2025-02-25",
    "sessions_count": 5,
    "cloud_signed_in": true,
    "app_version": "1.2.3",
    "platform": "windows"
  }'
```

---

## 9. Summary

| Item | Value |
|------|-------|
| Endpoint | `POST /api/analytics/usage` |
| Auth | Optional: Bearer token for user association; anonymous with `client_id` supported |
| Storage | Payloads persisted to `app_usage_analytics` for aggregation |
| Success | `200`/`201` with `{ "ok": true }` |
| Errors | `400` (validation), `500` (server) — client retries on failure |
