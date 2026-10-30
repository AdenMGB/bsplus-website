# BetterSEQTA+ remote status & config API

HTTP API for **remote control** of the BetterSEQTA+ extension. Implemented on **betterseqta.org** under `/api/bsplus/…`. The extension falls back to the [BS-Status](https://github.com/BetterSEQTA/BS-Status) GitHub mirror when the origin is unreachable.

---

## Public endpoints

### `GET /api/bsplus/remote-config`

| Query | Required | Notes |
|-------|----------|--------|
| `installId` | yes | RFC 4122 UUID (`bsplus_install_id`) |
| `extensionVersion` | yes | Manifest version (max 32 chars) |
| `channel` | recommended | `stable` \| `dev` \| `nightly` \| `unknown` |
| `hostname` | optional | SEQTA hostname only (no path) |

**Headers:** `If-None-Match: "<etag>"` → **304** when unchanged.

**Response:** Standard site envelope (`success`, `data`, `error`, `meta`). `data` includes `configVersion`, `etag`, `source: "api"`, `global`, `features`, `campaigns`. Published snapshot is capped at **32 KB** (large campaign bodies may be omitted from the snapshot; use the campaign detail route).

**Rate limit:** ~600 requests / hour / IP (429 + `Retry-After`).

### `POST /api/bsplus/installs/register`

Register or refresh an anonymous install. Call **only** when the primary API was reached (not GitHub fallback).

Optional `Authorization: Bearer …` — when present, cloud `userId` is taken from the session (body `userId` ignored).

**Rate limit:** ~120 / hour / `installId`, ~300 / hour / IP.

### `GET /api/bsplus/remote-config/campaigns/{id}`

Full campaign payload (including sanitized `bodyHtml`) when omitted from the snapshot.

---

## Admin endpoints (staff session, `admin_level >= 1`)

Draft edits do **not** affect extensions until **publish**.

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/bsplus/admin/remote-config/global` | Draft global settings + last published meta |
| `PATCH` | `/api/bsplus/admin/remote-config/global` | Update kill switch, flags, messages |
| `GET` | `/api/bsplus/admin/remote-config/features` | List feature gates |
| `POST` | `/api/bsplus/admin/remote-config/features` | Create / upsert feature gate |
| `PATCH` | `/api/bsplus/admin/remote-config/features/{key}` | Update gate (`key` URL-encoded) |
| `DELETE` | `/api/bsplus/admin/remote-config/features/{key}` | Remove gate |
| `GET` | `/api/bsplus/admin/remote-config/campaigns` | List campaigns |
| `POST` | `/api/bsplus/admin/remote-config/campaigns` | Create campaign |
| `PATCH` | `/api/bsplus/admin/remote-config/campaigns/{id}` | Update campaign |
| `DELETE` | `/api/bsplus/admin/remote-config/campaigns/{id}` | Delete campaign |
| `POST` | `/api/bsplus/admin/remote-config/publish` | Rebuild snapshot, bump `configVersion` + `etag` |
| `GET` | `/api/bsplus/admin/installs/stats` | Install registry counts |

### Global `PATCH` body (partial)

`mode` (`on` \| `off`), `allowLocalOverride`, `statusMessage`, `maintenance`, `minExtensionVersion`, `forceUpdateUrl`, `disableCloudSync`, `disableThemeStore`, `disableFeedbackSubmit`.

### Feature gate body

`feature_key` (or path key): `page.*`, `plugin.*`, or `settings.*`.  
`mode`: `allow` \| `hide` \| `banner` \| `block` \| `greyout` \| `temp_hide`.  
Optional `message`: `{ title?, body, severity? }`.

### Campaign body

`header` (`title`, optional `subtitle`), `activeFrom` / `activeTo` (ISO-8601), `bodyHtml` (sanitized server-side), optional `hero`, `buttons`, `priority`, `requireAcknowledge`, `omitBodyFromSnapshot`, `enabled`.

---

## Database

Migration **`022_bsplus_remote_config.sql`**: global row, feature gates, campaigns, install registry, published snapshot meta, rate-limit buckets.

Apply locally:

```bash
pnpm db:migrate:local
```

Production:

```bash
pnpm db:migrate:remote
```

After deploy, use **Publish** once so `configVersion` / `etag` reflect live data (bootstrap row is replaced on first publish or first successful public fetch).

---

## Related

- [BetterSEQTA+ Admin Theme Preview API](./bsplus-admin-themes-api.md)
- Extension client: BetterSEQTA-Plus repo (service worker polling, GitHub fallback)
