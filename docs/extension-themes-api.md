# Extension Themes API

This document describes the API for BetterSEQTA extension themes, including admin upload, theme list/download, and authentication.

## Overview

- **BetterSEQTA themes** (extension): Folder with `theme.json` (id, name, description, CustomCSS, etc.) and optional `images/banner.webp`, `images/marquee.webp`.
- **DesQTA themes** (web/desktop): ZIP with `theme-manifest.json` + `styles/` (existing flow).

The store supports both types. Admin uploads detect the type automatically.

---

## 1. Admin Upload

**Endpoint:** `POST /api/admin/themes`

**Authentication:** Admin (cookie or Bearer token)

**Request:** `multipart/form-data` with either:
- `theme_zip` or `theme_folder`: ZIP file containing a theme folder

**Type detection:**
- **betterseqta**: ZIP contains `theme.json` at root with `CustomCSS`, `id`, `name`; no `theme-manifest.json`, no `styles/`
- **desqta**: ZIP contains `theme-manifest.json` + `styles/`

**BetterSEQTA folder structure:**
```
theme-folder/
  theme.json          # Required: id, name, description, CustomCSS
  images/
    banner.webp       # Optional
    marquee.webp      # Optional
```

**theme.json schema (BetterSEQTA):**
```json
{
  "id": "uuid",
  "name": "Theme Name",
  "description": "Description",
  "CustomCSS": ":root { ... }",
  "defaultColour": "rgb(93, 93, 93)",
  "CanChangeColour": true,
  "coverImage": "base64 or path",
  "images": []
}
```

**Response (success):**
```json
{
  "success": true,
  "data": {
    "theme": {
      "id": "...",
      "name": "...",
      "slug": "...",
      "theme_type": "betterseqta",
      "theme_json_url": "https://betterseqta.org/api/themes/{id}/theme.json",
      "cover_image_url": "https://...",
      "marquee_image_url": "https://..."
    }
  }
}
```

---

## 2. Theme List

**Endpoint:** `GET /api/themes`

**Query parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `type` | string | `betterseqta` \| `desqta` — filter by theme type |
| `page` | number | Page number (default 1) |
| `limit` | number | Items per page (default 20, max 100) |
| `category` | string | Filter by category |
| `search` | string | Search name, description, author |
| `sort` | string | `popular` \| `newest` \| `rating` \| `downloads` \| `name` |

**Example:** `GET /api/themes?type=betterseqta`

**Response (BetterSEQTA themes):**
```json
{
  "success": true,
  "data": {
    "themes": [
      {
        "id": "9a9786d1-b5fc-4a91-8c7a-f8bf7f7679ad",
        "name": "Neumorphic",
        "description": "...",
        "coverImage": "https://betterseqta.org/api/images/themes/{id}/images/banner.webp",
        "marqueeImage": "https://betterseqta.org/api/images/themes/{id}/images/marquee.webp",
        "theme_json_url": "https://betterseqta.org/api/themes/{id}/theme.json",
        "download_count": 1234,
        "favorite_count": 56,
        "theme_type": "betterseqta"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 10, "total_pages": 1, "has_next": false, "has_prev": false }
  }
}
```

---

## 3. Theme Detail

**Endpoint:** `GET /api/themes/[id]`

**Response (BetterSEQTA):**
```json
{
  "success": true,
  "data": {
    "theme": {
      "id": "...",
      "name": "...",
      "coverImage": "https://...",
      "marqueeImage": "https://...",
      "theme_json_url": "https://betterseqta.org/api/themes/{id}/theme.json",
      "theme_type": "betterseqta",
      "download_count": 1234,
      "favorite_count": 56,
      "is_favorited": false
    }
  }
}
```

---

## 4. Theme Download (BetterSEQTA)

**Endpoint:** `GET /api/themes/[id]/download`

**Behavior:** Increments `download_count` and returns the URL to fetch `theme.json`.

**Response (BetterSEQTA):**
```json
{
  "success": true,
  "data": {
    "theme_json_url": "https://betterseqta.org/api/themes/{id}/theme.json",
    "download_count": 1235
  }
}
```

**Extension flow:**
1. Call `GET /api/themes/[id]/download`
2. Receive `theme_json_url`
3. Fetch `theme.json` from that URL
4. Apply theme (same method as before, different host)

---

## 5. Serve theme.json

**Endpoint:** `GET /api/themes/[id]/theme.json`

**Behavior:** Returns the raw `theme.json` file for BetterSEQTA themes. No auth required.

**Response:** `application/json` — the theme.json content.

---

## 6. Auth for Extension

Extensions (and DesQTA) use username/password to get a token directly — no OAuth redirect, no Discord.

### Login

**Endpoint:** `POST /api/auth/extension/login`

**Request:**
```json
{
  "username": "user",
  "password": "secret"
}
```

**Response:**
```json
{
  "access_token": "eyJ...",
  "expires_in": 3600
}
```

### Using the token

Send `Authorization: Bearer <token>` on API calls:

```
GET /api/themes?type=betterseqta
Authorization: Bearer eyJ...
```

`GET /api/auth/me` also accepts `Authorization: Bearer <token>` in addition to the `auth_token` cookie.

---

## 7. Unified Theme APIs

| API | Change |
|-----|--------|
| `GET /api/themes` | Add `?type=betterseqta` filter; include `theme_type`, `coverImage`, `marqueeImage`, `theme_json_url` for betterseqta |
| `GET /api/themes/[id]` | Return type-specific fields; betterseqta: `coverImage`, `marqueeImage`, `theme_json_url` |
| `GET /api/themes/[id]/user-status` | Works for both types |
| `POST /api/themes/[id]/favorite` | Works for both types |
| `DELETE /api/themes/[id]/favorite` | Works for both types |
| `GET /api/themes/[id]/download` | **betterseqta**: returns `theme_json_url`, increments count; **desqta**: returns `zip_download_url` |

---

## 8. Example Requests

### List BetterSEQTA themes
```bash
curl "https://betterseqta.org/api/themes?type=betterseqta"
```

### Download theme (get URL)
```bash
curl "https://betterseqta.org/api/themes/9a9786d1-b5fc-4a91-8c7a-f8bf7f7679ad/download"
```

### Fetch theme.json
```bash
curl "https://betterseqta.org/api/themes/9a9786d1-b5fc-4a91-8c7a-f8bf7f7679ad/theme.json"
```

### Extension login
```bash
curl -X POST "https://betterseqta.org/api/auth/extension/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"secret"}'
```

### Authenticated request
```bash
curl "https://betterseqta.org/api/themes?type=betterseqta" \
  -H "Authorization: Bearer <access_token>"
```
