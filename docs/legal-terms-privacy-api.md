# BetterSEQTA+ — Terms & Privacy API (extension client)

HTTP API for **Terms of Service** and **Privacy Policy** copy shown in the extension (startup popup, settings, or similar). Implemented on **betterseqta.org** (content site), not on `accounts.betterseqta.org`.

Human-readable pages:

- [https://betterseqta.org/terms](https://betterseqta.org/terms)
- [https://betterseqta.org/privacy](https://betterseqta.org/privacy)

The APIs return the **same body text** as those pages (rendered to HTML), plus a **`last_updated`** version string per document.

**Server source of truth:** `lib/legal/terms-document.ts`, `lib/legal/privacy-document.ts` (markdown). Responses are built in `lib/legal/legal-api-payload.ts`.

---

## Base URL

| Environment | Base URL |
|-------------|----------|
| Production | `https://betterseqta.org` |
| Dev/staging | Host from extension Advanced settings API base override |

Extension dev builds may still default to production unless overridden.

---

## Shared response shape

Both endpoints return JSON with the same fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `last_updated` | string | yes | Version id for that document. **ISO 8601 datetime** (e.g. `2026-10-29T00:00:00.000Z`). Compared via `Date.parse`; if parsing fails, compare as raw strings. |
| `whatsnew_html` | string | yes | Non-empty HTML fragment for the scroll region. Wrapped in `<div class="whatsnewTextContainer">…</div>`. Sanitize on the client (e.g. DOMPurify). |

Both fields must be non-empty strings or the client should treat the response as invalid.

**Success:** HTTP `200`, `Content-Type: application/json`

**Caching (server):** `Cache-Control: no-store`

**Client fetch:** Prefer `cache: "no-store"` and a reasonable timeout (e.g. 8 seconds).

---

## Terms of Service

### `GET /api/terms`

Returns the active **Terms of Service** HTML and version.

**Request**

- Method: `GET`
- No query parameters
- No authentication

**Example response**

```json
{
  "last_updated": "2026-10-29T00:00:00.000Z",
  "whatsnew_html": "<div class=\"whatsnewTextContainer\"><h3>1. Agreement</h3><p>…</p></div>"
}
```

**Example**

```bash
curl -sS 'https://betterseqta.org/api/terms' -H 'Accept: application/json'
```

### Versioning (terms acceptance)

When the user accepts the Terms of Service, store `last_updated` from **`GET /api/terms`** (not `/api/privacy`) in local settings, e.g. `termsOfServiceLastAccepted`.

Show the terms popup again when:

`Date.parse(api.last_updated) > Date.parse(storedAcceptance)`

—or when the strings differ if either value is not a valid date.

Bump `TERMS_LAST_UPDATED` in `lib/legal/terms-document.ts` when terms change materially (not for typos-only unless you want a re-prompt).

Legacy keys (`privacyStatementShown`, `privacyStatementLastUpdated`) may still exist on older installs; treat them as prior acceptance until the terms API version is newer.

---

## Privacy Policy

### `GET /api/privacy`

Returns the active **Privacy Policy** HTML and version.

**Request**

- Method: `GET`
- No query parameters
- No authentication

**Example response**

```json
{
  "last_updated": "2026-10-29T23:00:00.000Z",
  "whatsnew_html": "<div class=\"whatsnewTextContainer\"><h3>1. Introduction</h3><p>…</p></div>"
}
```

**Example**

```bash
curl -sS 'https://betterseqta.org/api/privacy' -H 'Accept: application/json'
```

Privacy and terms versions are **independent**. Use each endpoint’s `last_updated` only for the document that endpoint serves. If the extension needs a single “legal bundle” acceptance flow, define product rules (e.g. re-prompt when **either** version is newer than stored acceptance for that doc).

---

## Deprecated alias

| Endpoint | Notes |
|----------|--------|
| `GET /api/policy/privacy` | Same body as `GET /api/privacy`. Prefer `/api/privacy` for new clients. |

There is no deprecated alias for `/api/terms`.

---

## `whatsnew_html` format

Content is Markdown on the server, rendered to HTML for the API:

- Headings: `h3` / `h4` (from `###` / `####` in source)
- Paragraphs, lists, `strong`, `em`, `code`
- Links: absolute `https://betterseqta.org/…` or external URLs with `rel="noopener noreferrer"` where applicable

The extension may unwrap an outer `whatsnewTextContainer` and render the inner HTML inside its own scroll region.

**Avoid in client rendering**

- Executing `script`, `iframe`, embedded forms, remote stylesheets
- Relying on DOM ids for extension behaviour unless the client owns them

---

## CORS

`/api/*` responses include CORS headers suitable for extension origins (`chrome-extension://`, `moz-extension://`) and `https://betterseqta.org` / `https://dev.betterseqta.org` when the request sends a matching `Origin`.

---

## Error handling (recommended client behaviour)

| Server behaviour | Suggested client behaviour |
|------------------|----------------------------|
| Non-2xx status | Bundled fallback JSON or last-known-good copy |
| Invalid JSON or missing fields | Same fallback |
| Network / timeout | Same fallback; popup can still work offline |

Fixing the live API is required for up-to-date copy and correct version comparisons.

---

## Checklist for client implementers

- [ ] Terms popup loads `GET /api/terms` and stores `termsOfServiceLastAccepted` from `last_updated`
- [ ] Privacy UI (if separate) loads `GET /api/privacy` and tracks its own stored version if needed
- [ ] Responses validated: non-empty `last_updated` and `whatsnew_html`
- [ ] HTML sanitized before `innerHTML` / DOM insertion
- [ ] Human pages `/terms` and `/privacy` linked from modal intro where appropriate
- [ ] Staging base URL tested when using API override

---

## Related

- Feedback API: [bsplus-feedback-api.md](./bsplus-feedback-api.md)
- Website privacy content inventory (internal drafting notes): maintain alongside `lib/legal/privacy-document.ts`
