# Remote theme overlay mode — API (`betterseqta.org`)

Operator tooling and extension contract for **layered** remote themes. Primary host: **`https://betterseqta.org`** — paths **`/api/bsplus/…`** (same worker as theme store and remote config).

Related: [Remote config API](./bsplus-remote-config-api.md).

---

## Summary

| `applicationMode` | User `selectedTheme` | Visible result |
|-------------------|----------------------|----------------|
| **`replace`** (default) | Replaced while directive active | Remote package only |
| **`overlay`** | Unchanged | User theme + remote stack; remote wins conflicts |

---

## Snapshot: `remoteTheme`

Existing fields unchanged. New optional field:

| Field | Values | Default |
|-------|--------|---------|
| **`applicationMode`** | `replace` \| `overlay` | `replace` (omit in JSON) |

`mode` (`off` \| `optional` \| `forced`) is policy; `applicationMode` is rendering.

Published snapshot omits `applicationMode` when `replace`.

---

## Package API

`GET /api/bsplus/remote-theme-packages/{packageId}`

- **`theme`** — single ThemeContent (replace packages).
- **`overlayLayers`** — 1–5 layers (overlay packages). **Mutually exclusive** with `theme` (admin save returns **422** if both).
- Optional **`applicationMode`** on package; **snapshot directive wins** if they differ (warning logged server-side).
- **`downloadUrl`**: `https://betterseqta.org/api/bsplus/remote-theme-packages/{id}/bundle.json`
- Large payloads: inline bodies omitted; fetch `downloadUrl`.

---

## GitHub mirror

`remoteTheme.json` in BS-Status includes **`applicationMode`** and package fields with schema parity to the primary API.

---

## Database

Migration **`025_bsplus_remote_theme_overlay.sql`**: `application_mode`, `overlay_layers_json`, `overlay_hints_json` on `bsplus_remote_theme_packages`.

---

## Deploy order

1. Run migration  
2. Deploy API  
3. Publish packages / directives  
4. Ship extension that reads `applicationMode`

---

## Changelog

| Date | Note |
|------|------|
| 2026-11-01 | Overlay spec; default remains `replace`. |
