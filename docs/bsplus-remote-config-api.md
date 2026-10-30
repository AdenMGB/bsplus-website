# BetterSEQTA+ remote config API

Operator-controlled configuration for extension installs: kill switch, feature gates, campaigns, and optional **remote theme packages**. The extension reads a **snapshot** from the primary API (preferred) or a **GitHub mirror** when the API is unavailable.

**Base URL (production):** `https://api.betterseqta.org` — same host family as accounts. Dev builds may use `DEV_API_URL` / `api.dev.betterseqta.org`. The marketing site (`betterseqta.org`) serves the admin UI; extension traffic should target the API host.

---

## Primary endpoints

### `GET /api/bsplus/remote-config`

| Query | Required | Description |
|-------|----------|-------------|
| `installId` | yes | Anonymous install id (RFC 4122 UUID) |
| `extensionVersion` | yes | Manifest version (max 32 chars) |
| `channel` | yes | `stable`, `dev`, `nightly`, or `unknown` |
| `hostname` | no | Last SEQTA page hostname (no path) |

**Headers:** `Accept: application/json`, `If-None-Match: <etag>` → **304** when unchanged.

**Response:** Standard envelope (`success`, `data`, …). `data` includes `configVersion`, `etag`, `source: "api"`, `global`, `features`, `campaigns`, `remoteTheme` (directive or `null`).

### `POST /api/bsplus/installs/register`

Heartbeat after a successful **primary** fetch (not GitHub fallback). JSON body: `installId`, `extension.version`, `extension.channel`, `extension.browser`, optional `userId`, optional `hostname`, optional `lastSeenAt` ISO.

Optional `Authorization: Bearer …` — cloud `userId` from session when present.

### `GET /api/bsplus/remote-config/campaigns/{id}`

Full campaign payload when omitted from the snapshot.

### `GET /api/bsplus/remote-theme-packages/{packageId}`

Query: `extensionVersion`, `channel`, optional `hostname`.

Response `data`:

```json
{
  "packageId": "school-brand-2026",
  "version": "3",
  "contentType": "application/json",
  "downloadUrl": "https://api.betterseqta.org/api/bsplus/remote-theme-packages/school-brand-2026/bundle.json",
  "sha256": "…",
  "theme": { "id": "…", "name": "…", "CustomCSS": "…" }
}
```

`theme` is omitted when the bundle is large; clients fetch `downloadUrl` (HTTPS on `*.betterseqta.org`).

### `GET /api/bsplus/remote-theme-packages/{packageId}/bundle.json`

Raw ThemeContent JSON (same shape as custom theme install).

---

## Snapshot: `remoteTheme`

```json
{
  "packageId": "school-brand-2026",
  "packageVersion": "3",
  "mode": "optional",
  "activeFrom": "2026-04-01T00:00:00.000Z",
  "activeTo": "2026-12-31T23:59:59.999Z",
  "message": { "title": "School theme", "body": "…" },
  "allowUserOptOut": true
}
```

| `mode` | Client behaviour |
|--------|------------------|
| `off` | End remote theme; restore user snapshot |
| `optional` | Install/apply; user may turn off |
| `forced` | Install/apply; disable conflicting theme picker until directive ends |

Directive identity: `{ configVersion, packageId, packageVersion, mode }`.

---

## GitHub mirror (BS-Status)

Fallback: `https://raw.githubusercontent.com/BetterSEQTA/BS-Status/main/config/manifest.json`

Manifest includes `configVersion`, `updatedAt`, and files: `global.json`, `features.json`, `campaigns.json`, `remoteTheme.json`. Schemas match API snapshot slices; theme **binaries** stay on `api.betterseqta.org`.

---

## Feature gates (`features`)

Keys: `{domain}.{id}` — `page.*`, `ui.*` (via catalog), `plugin.*`, `settings.*`. Modes: `allow` (default), `hide`, `banner`, `block`, `greyout`, `temp_hide`.

See admin catalog: `GET /api/bsplus/admin/remote-config/catalog`.

---

## Admin (staff session)

Draft edits apply only after **Publish** (`POST /api/bsplus/admin/remote-config/publish`).

| Method | Path | Purpose |
|--------|------|---------|
| GET/PATCH | `/api/bsplus/admin/remote-config/global` | Global flags + `remoteTheme` directive (PATCH `remoteTheme`) |
| GET/PATCH/DELETE | `/api/bsplus/admin/remote-config/features/{key}` | Feature gates |
| CRUD | `/api/bsplus/admin/remote-config/campaigns` | Campaigns |
| GET/POST | `/api/bsplus/admin/remote-theme-packages` | List / create packages |
| GET/PATCH/DELETE | `/api/bsplus/admin/remote-theme-packages/{packageId}` | Package detail |
| POST | `/api/bsplus/admin/remote-config/sync-github` | Force GitHub mirror (draft tables) |

---

## Database

Migrations **`022_bsplus_remote_config.sql`**, **`023_bsplus_remote_config_extension_fields.sql`**, **`024_bsplus_remote_theme.sql`**.

```bash
pnpm db:migrate:local   # dev
pnpm db:migrate:remote  # production
```

**Publish order:** D1 snapshot first (`GET /api/bsplus/remote-config`), then BS-Status GitHub push (same published slices + `remoteTheme.json`).

**Secrets:** `wrangler secret put GITHUB_BS_STATUS_TOKEN`

| Var | Default |
|-----|---------|
| `NUXT_PUBLIC_API_URL` | `https://api.betterseqta.org` |
| `GITHUB_BS_STATUS_OWNER` | `BetterSEQTA` |
| `GITHUB_BS_STATUS_REPO` | `BS-Status` |
| `GITHUB_BS_STATUS_PATH` | `config` |

---

## Client storage (extension, local only)

| Key | Purpose |
|-----|---------|
| `bsplus_remote_config_snapshot` | Last snapshot |
| `bsplus_remote_theme_before_v1` | Pre-theme restore envelope |
| `bsplus_remote_theme_state_v1` | Active directive + installed theme id |
| `bsplus_remote_theme_user_off` | User dismissed optional theme for directive key |

Excluded from cloud settings upload.

---

## Related

- [BetterSEQTA+ Admin Theme Preview API](./bsplus-admin-themes-api.md)
