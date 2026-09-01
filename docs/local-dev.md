# Local development — all BetterSEQTA services

Run **bsplus**, **accounts**, and **mail** concurrently on localhost with shared local D1 and cross-service URLs (never production).

## Port map

| Service | Repo | Port | Command |
|---------|------|------|---------|
| bsplus-website | `bsplus-website` | **8787** | `pnpm cf:dev` |
| betterseqta-accounts | `betterseqta-accounts` | **8788** | `pnpm cf:dev` |
| BetterSEQTA-Mail | `BetterSEQTA-Mail-Client` | **8789** | `pnpm worker:dev` |

## Three-terminal setup

```bash
# First time / after schema changes (each repo)
cd betterseqta-accounts && pnpm db:migrate:local
cd bsplus-website && pnpm db:migrate:local
cd BetterSEQTA-Mail-Client && pnpm db:migrate:local

# Terminal 1 — accounts
cd betterseqta-accounts && pnpm cf:dev

# Terminal 2 — bsplus
cd bsplus-website && pnpm cf:dev

# Terminal 3 — mail (requires prior `pnpm build` in mail repo, or use worker:preview)
cd BetterSEQTA-Mail-Client && pnpm worker:dev
```

Each `cf:dev` / `worker:dev` runs `scripts/resolve-dev-services.mjs` first. It probes `GET /api/health` on each service and writes resolved URLs to `.env.local`.

## Seed test user

```bash
cd betterseqta-accounts
pnpm db:seed:test-user --admin --signup-number 100
```

Or from bsplus: `pnpm dev:seed -- --admin --signup-number 100`

Defaults: `test@betterseqta.local` / `testuser` / `TestPass123!` → http://localhost:8788/login

## OAuth setup (bsplus ↔ accounts)

1. Copy `.env.example` → `.env` and set `NUXT_OAUTH_CLIENT_ID` / `NUXT_OAUTH_CLIENT_SECRET`
2. Open http://localhost:8788 and sign in as seeded admin
3. Admin → OAuth clients → create client with redirect URI:
   ```
   http://localhost:8787/api/auth/callback
   ```
3. Copy client id/secret to bsplus `.env`:
   ```
   NUXT_OAUTH_CLIENT_ID=...
   NUXT_OAUTH_CLIENT_SECRET=...
   NUXT_OAUTH_REDIRECT_URI=http://localhost:8787/api/auth/callback
   ```
4. Rebuild bsplus if already running: `pnpm cf:dev`

## Environment variables

Written to `.env.local` (gitignored) by the resolver:

```
DEV_ACCOUNTS_URL=http://localhost:8788
DEV_BSPLUS_URL=http://localhost:8787
DEV_MAIL_URL=http://localhost:8789
```

In local dev, bsplus server routes use these instead of production URLs for accounts OAuth/API and mail send/quota.

## Health checks

```bash
curl http://localhost:8787/api/health   # {"ok":true,"service":"bsplus"}
curl http://localhost:8788/api/health   # {"ok":true,"service":"accounts"}
curl http://localhost:8789/api/health   # {"ok":true,"service":"mail"}
```

## bsplus-specific commands

| Command | Description |
|---------|-------------|
| `pnpm cf:dev` | Resolve URLs → build → wrangler dev `:8787` |
| `pnpm db:migrate:local` | Apply bsplus D1 migrations locally (run separately) |
| `pnpm db:migrate:remote` | Apply pending migrations to **remote** D1 (`bsplus-db`) — requires Cloudflare auth |

## Remote D1 migrations (all services)

Apply pending migrations to **production** Cloudflare D1 individually (requires `wrangler login` or `CLOUDFLARE_API_TOKEN`). Each command prints a warning then applies only **pending** migrations — it does not re-run applied ones.

| Service | Directory | Remote command | D1 database |
|---------|-----------|----------------|-------------|
| bsplus | `bsplus-website` | `pnpm db:migrate:remote` | `bsplus-db` |
| accounts | `betterseqta-accounts` | `pnpm db:migrate:remote` | `BS_SETTINGS` |
| mail | `BetterSEQTA-Mail-Client` | `pnpm db:migrate:remote` | `email-db` |

Mail also accepts the legacy alias `pnpm d1:migrate:remote` (same as `db:migrate:remote`).
| `pnpm dev:seed` | Run accounts test-user seed script |

## Local D1 persistence

All services use `--persist-to .wrangler/d1-local` so database state survives restarts. Never commit `.wrangler/`.

## Troubleshooting

- **Login redirects to production or `accounts.localhost`** — rebuild bsplus after env changes (`pnpm cf:dev`); ensure `.env.local` has `DEV_ACCOUNTS_URL=http://localhost:8788` and `CF_DEV=1`
- **Empty `client_id` on login** — set `NUXT_OAUTH_CLIENT_ID` / `NUXT_OAUTH_CLIENT_SECRET` in `.env`
- **OAuth redirect mismatch** — redirect URI in accounts client must exactly match `NUXT_OAUTH_REDIRECT_URI`
- **Remote preview session error** — `cf:dev` uses `wrangler dev --local`; AI binding no longer uses `remote = true` in local wrangler.toml
- **Mail worker:dev fails** — mail needs `dist/server/wrangler.json`; run `pnpm build` once, or use `pnpm worker:preview`
- **signup_number seed fails** — run accounts migration 0019 first (Subagent A)
