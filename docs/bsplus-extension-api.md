# BetterSEQTA+ extension API (`betterseqta.org`)

Specification for **website / API** developers on `betterseqta.org`. Covers install registration, remote config, and theme store routes used by the BetterSEQTA+ extension.

**Related**

- Accounts install linking — `POST …/installs/link` on `accounts.betterseqta.org` (accounts service docs)
- Remote config detail — [BetterSEQTA+ remote config API](./bsplus-remote-config-api.md)
- Theme store detail — [Extension Themes API](./extension-themes-api.md)
- Feedback — [BetterSEQTA+ extension feedback API](./bsplus-feedback-api.md)

## Base URL

`https://betterseqta.org` (extension dev builds may override via session dev API base)

## Shared client identifiers

Each profile has a persistent **`installId`** UUID (`bsplus_install_id` in `chrome.storage.local`).

When the user is signed into BetterSEQTA Cloud, the client may also send:

- Query param **`userId`** — `bsplus_user.id`
- Header **`Authorization: Bearer <token>`** — on register, theme download, and optional catalog calls

OAuth tokens are **not** sent in theme query strings; Bearer is used when a token exists.

### Query parameters (remote config + themes)

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `extensionVersion` | string (semver) | Recommended | Manifest version, e.g. `3.7.0` |
| `channel` | `stable` \| `nightly` \| `unknown` | Recommended | Update channel (`dev` also accepted server-side) |
| `installId` | UUID | Recommended | Anonymous install id |
| `userId` | UUID | Optional | When signed in |
| `hostname` | string | Optional | Last SEQTA hostname (remote config) |

On **`GET /api/bsplus/remote-config`**, `installId`, `extensionVersion`, and `channel` are **required** (422 if missing or invalid). Optional `userId` is accepted; **`Authorization: Bearer`** resolves the cloud user when signed in.

On **theme catalog** routes, the same params are optional; invalid values are ignored. Theme list/search also accept legacy **`compatible_version`**; when both are sent, **`extensionVersion`** is preferred for semver gating.

### JSON `extension` object (install register body)

```json
{
  "version": "3.7.0",
  "channel": "stable",
  "browser": "chrome"
}
```

---

## `POST /api/bsplus/installs/register`

Called after a successful **primary** remote-config fetch (24h throttle unless forced). Re-called on cloud auth storage changes when remote config last succeeded.

**Headers**

- `Content-Type: application/json`
- `Authorization: Bearer <token>` — when signed in

**Body**

```json
{
  "installId": "uuid",
  "extension": { "version": "3.7.0", "channel": "stable", "browser": "chrome" },
  "userId": "cloud-user-uuid-or-omitted",
  "lastSeenAt": "2026-11-02T00:00:00.000Z",
  "hostname": "learn.example.edu.au"
}
```

**Server expectations**

- Upsert by `installId`
- When Bearer is valid, associate install with that user (body `userId` is supplementary)
- Users may have many install ids

**Implementation:** `server/api/bsplus/installs/register.post.ts`

---

## `GET /api/bsplus/remote-config`

**Query params (extension sends)**

- `installId`, `extensionVersion`, `channel`
- `userId` when signed in
- `hostname` when known

Supports **`If-None-Match` / `ETag`** (304 + cached snapshot on client).

**Server expectations**

- **`GET /api/bsplus/remote-config`** returns a **personalized** snapshot: audience rules on campaigns, feature gates, and remote theme; then per-install / per-user overrides from `bsplus_remote_config_overrides`.
- Response **`ETag`** is per client context (`private` cache). **`If-None-Match`** still returns **304** when the personalized payload is unchanged.
- Published snapshot in D1 remains the global baseline; GitHub mirror stays unpersonalized.

**Audience rule shape** (`targeting` on campaigns/features, `remoteThemeTargeting` on global):

```json
{
  "channels": ["stable", "nightly"],
  "minExtensionVersion": "3.6.0",
  "maxExtensionVersion": "4.0.0",
  "hostnameSuffixes": ["example.edu.au"],
  "installIds": ["uuid"],
  "userIds": ["uuid"],
  "denyInstallIds": [],
  "denyUserIds": [],
  "percentage": 25
}
```

**Override kinds** (admin `POST /api/bsplus/admin/remote-config/overrides`): `feature`, `feature_allow`, `campaign_force_include`, `campaign_force_exclude`, `global`, `remote_theme`.

**Theme analytics**

- Download rows: `bsplus_theme_download_events` (official + community download routes).
- Catalog rows: `bsplus_theme_catalog_events` (`list`, `detail`, `search`, `totm`) when extension query context is present.
- Admin summary: `GET /api/bsplus/admin/theme-analytics/summary?days=30`

**Implementation:** `server/api/bsplus/remote-config.get.ts`, `server/utils/bsplusRemoteConfigTargeting.ts`

---

## Theme APIs — query + download

### Official store

| Route | Method | Query params (extension) | Auth |
|-------|--------|----------------------------|------|
| `/api/themes` | GET | `type`, `limit`, `extensionVersion`, `channel`, `installId`, `userId` if signed in | Bearer optional |
| `/api/themes/{id}` | GET | `extensionVersion`, `channel`, `installId`, `userId` if signed in | Bearer optional |
| `/api/themes/{id}/download` | GET | Same as detail | Bearer when signed in |
| `/api/themes/{id}/favorite` | POST/DELETE | (unchanged) | Bearer required |

### Community custom themes

| Route | Method | Query params | Auth |
|-------|--------|--------------|------|
| `/api/custom-themes` | GET | `type`, `page`, `limit`, `extensionVersion`, `channel`, `installId`, `userId` | Optional |
| `/api/custom-themes/search` | GET | Same + `q` | Optional |
| `/api/custom-themes/{id}/download` | GET | `extensionVersion`, `channel`, `installId`, `userId` | Bearer when signed in |

### Theme of the month

| Route | Method | Query params |
|-------|--------|--------------|
| `/api/theme-of-the-month/current` | GET | `extensionVersion`, `channel`, `installId`, `userId` |

### Server expectations (themes)

- **`extensionVersion`** — semver gating via `compatibility_min` on list/search when provided
- **`installId` / `userId`** — rollouts and entitlements without mandatory auth on read-only catalog
- **`…/download`** — increments theme `download_count`, writes **`bsplus_theme_download_events`**, updates **`bsplus_installs`** when registered; Bearer is source of truth for `user_id`

---

## Client behaviour summary (`betterseqta.org`)

| Event | Client action |
|-------|----------------|
| Remote config refresh (primary OK) | `POST /api/bsplus/installs/register`; if signed in, also accounts link |
| Sign-in / token / user change | Force register when remote config last OK |
| Theme list / detail / download / TOTM | Client query params via extension client context helper |
| Logout | `userId` omitted from queries; `installId` unchanged |

GitHub fallbacks for themes when API fails are unchanged (no client context on fallback URLs).
