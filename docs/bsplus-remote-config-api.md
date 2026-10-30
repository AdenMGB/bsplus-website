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
| `POST` | `/api/bsplus/admin/remote-config/publish` | Rebuild snapshot, bump `configVersion` + `etag`, push BS-Status GitHub mirror |
| `POST` | `/api/bsplus/admin/remote-config/sync-github` | Force push draft config to GitHub (backfill; keeps published `configVersion`) |
| `GET` | `/api/bsplus/admin/installs/stats` | Install registry counts |

### Global `PATCH` body (partial)

| Field | Extension effect |
|-------|------------------|
| `mode` | `on` \| `off` — kill switch |
| `allowLocalOverride` | “Run locally anyway” when off or hostname blocked |
| `statusMessage` | Settings strip when kill switch off |
| `maintenance` | `{ title?, body? }` — status strip (title/body) |
| `minExtensionVersion` | Semver — blocks plugins / shows update strip |
| `forceUpdateUrl` | Appended to min-version message |
| `hostnamePolicy` | `{ mode: "allowlist"\|"denylist", suffixes: string[] }` — per-SEQTA-site enablement |
| `disableCloudSync` | Stops cloud settings sync |
| `disableThemeStore` | Hides/disables theme store |
| `disableFeedbackSubmit` | Blocks feedback API from extension |

### Feature catalog

**`GET /api/bsplus/admin/remote-config/catalog`** — all known `page.*`, `plugin.*`, and `settings.*` keys from BetterSEQTA+ (also included on global GET as `catalog`).

Built-in plugin keys: `plugin.themes`, `plugin.global-search`, `plugin.grade-analytics`, … (see catalog response).

Settings keys include `settings.nav.cloud`, `settings.section.*`, `settings.control.onoff`.

### Campaign fields

Includes `minVersion` / `maxVersion` (semver window), `requireAcknowledge`, `omitBodyFromSnapshot`, hero `image`|`video`, button actions `dismiss` \| `url` \| `openSettingsSection`.

---

## Database

Migration **`022_bsplus_remote_config.sql`**: global row, feature gates, campaigns, install registry, published snapshot meta, rate-limit buckets.

Apply locally:

```bash
pnpm db:migrate:local
```

Includes **`022_bsplus_remote_config.sql`** and **`023_bsplus_remote_config_extension_fields.sql`** (hostname policy + campaign version bounds).

Production:

```bash
pnpm db:migrate:remote
```

After deploy, use **Publish** once so `configVersion` / `etag` reflect live data (bootstrap row is replaced on first publish or first successful public fetch).

### GitHub mirror (BS-Status)

On every **Publish**, the worker updates [BetterSEQTA/BS-Status](https://github.com/BetterSEQTA/BS-Status) under `config/`:

- `manifest.json`, `global.json`, `features.json`, `campaigns.json`

**Order of operations:** Publish always writes **`bsplus_remote_config_meta.snapshot_json` in D1 first** (what `GET /api/bsplus/remote-config` serves). GitHub is updated **after**, using that **same published snapshot** for `global.json`, `features.json`, and `campaigns.json` so fallback clients stay aligned with the API.

**Force GitHub mirror sync** rebuilds from **draft tables** (same rules as the next publish) but does **not** change D1 — use **Publish** to update live API clients.

**Worker secret** (required for GitHub push):

```bash
wrangler secret put GITHUB_BS_STATUS_TOKEN
# Fine-grained or classic PAT: Contents read/write on BetterSEQTA/BS-Status only
```

Optional vars (defaults shown):

| Var | Default |
|-----|---------|
| `GITHUB_BS_STATUS_OWNER` | `BetterSEQTA` |
| `GITHUB_BS_STATUS_REPO` | `BS-Status` |
| `GITHUB_BS_STATUS_BRANCH` | `main` |
| `GITHUB_BS_STATUS_PATH` | `config` |

**Force GitHub mirror sync** (`POST .../sync-github`): pushes **current admin draft** (global, features, full campaign bodies) using the **existing published `configVersion`** — use after backfilling publishes that ran before GitHub sync existed. Does not bump API `configVersion`.

Publish still succeeds if GitHub fails; check `github` in the publish response or server logs.

---

## Related

- [BetterSEQTA+ Admin Theme Preview API](./bsplus-admin-themes-api.md)
- Extension client: BetterSEQTA-Plus repo (service worker polling, GitHub fallback)
