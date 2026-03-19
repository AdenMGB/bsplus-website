# SvelteKit Route Map

## Pages

| Current file | Target route file | URL |
| --- | --- | --- |
| `pages/index.vue` | `src/routes/+page.svelte` | `/` |
| `pages/download.vue` | `src/routes/download/+page.svelte` | `/download` |
| `pages/desqta.vue` | `src/routes/desqta/+page.svelte` | `/desqta` |
| `pages/comparison.vue` | `src/routes/comparison/+page.svelte` | `/comparison` |
| `pages/privacy.vue` | `src/routes/privacy/+page.svelte` | `/privacy` |
| `pages/minecraft.vue` | `src/routes/minecraft/+page.svelte` | `/minecraft` |
| `pages/news/index.vue` | `src/routes/news/+page.svelte` | `/news` |
| `pages/news/[slug].vue` | `src/routes/news/[slug]/+page.svelte` | `/news/[slug]` |
| `pages/changelogs/index.vue` | `src/routes/changelogs/+page.svelte` | `/changelogs` |
| `pages/changelogs/bqplus.vue` | `src/routes/changelogs/bqplus/+page.svelte` | `/changelogs/bqplus` |
| `pages/changelogs/desqta.vue` | `src/routes/changelogs/desqta/+page.svelte` | `/changelogs/desqta` |
| `pages/admin/index.vue` | `src/routes/admin/+page.svelte` | `/admin` |
| `pages/admin/analytics.vue` | `src/routes/admin/analytics/+page.svelte` | `/admin/analytics` |
| `pages/admin/collections/index.vue` | `src/routes/admin/collections/+page.svelte` | `/admin/collections` |
| `pages/admin/collections/new.vue` | `src/routes/admin/collections/new/+page.svelte` | `/admin/collections/new` |
| `pages/admin/collections/[id].vue` | `src/routes/admin/collections/[id]/+page.svelte` | `/admin/collections/[id]` |
| `pages/admin/themes/index.vue` | `src/routes/admin/themes/+page.svelte` | `/admin/themes` |
| `pages/admin/themes/upload.vue` | `src/routes/admin/themes/upload/+page.svelte` | `/admin/themes/upload` |
| `pages/admin/themes/[id].vue` | `src/routes/admin/themes/[id]/+page.svelte` | `/admin/themes/[id]` |
| `pages/admin/questionnaire/index.vue` | `src/routes/admin/questionnaire/+page.svelte` | `/admin/questionnaire` |
| `pages/admin/questionnaire/create.vue` | `src/routes/admin/questionnaire/create/+page.svelte` | `/admin/questionnaire/create` |
| `pages/admin/questionnaire/edit/[id].vue` | `src/routes/admin/questionnaire/edit/[id]/+page.svelte` | `/admin/questionnaire/edit/[id]` |
| `pages/admin/news/index.vue` | `src/routes/admin/news/+page.svelte` | `/admin/news` |
| `pages/admin/news/create.vue` | `src/routes/admin/news/create/+page.svelte` | `/admin/news/create` |
| `pages/admin/news/edit/[slug].vue` | `src/routes/admin/news/edit/[slug]/+page.svelte` | `/admin/news/edit/[slug]` |
| `error.vue` | `src/routes/+error.svelte` | error boundary |

## API

| Current file | Target route file | Method(s) |
| --- | --- | --- |
| `server/api/auth/login.get.ts` | `src/routes/api/auth/login/+server.ts` | `GET` |
| `server/api/auth/callback.get.ts` | `src/routes/api/auth/callback/+server.ts` | `GET` |
| `server/api/auth/logout.post.ts` | `src/routes/api/auth/logout/+server.ts` | `POST` |
| `server/api/auth/me.get.ts` | `src/routes/api/auth/me/+server.ts` | `GET` |
| `server/api/auth/extension/login.post.ts` | `src/routes/api/auth/extension/login/+server.ts` | `POST` |
| `server/api/news/index.get.ts` | `src/routes/api/news/+server.ts` | `GET` |
| `server/api/news/index.post.ts` | `src/routes/api/news/+server.ts` | `POST` |
| `server/api/news/[slug].get.ts` | `src/routes/api/news/[slug]/+server.ts` | `GET` |
| `server/api/news/[slug].put.ts` | `src/routes/api/news/[slug]/+server.ts` | `PUT` |
| `server/api/news/[id].delete.ts` | `src/routes/api/news/[id]/+server.ts` | `DELETE` |
| `server/api/news/publish.patch.ts` | `src/routes/api/news/publish/+server.ts` | `PATCH` |
| `server/api/news/preview.post.ts` | `src/routes/api/news/preview/+server.ts` | `POST` |
| `server/api/changelogs/bqplus.get.ts` | `src/routes/api/changelogs/bqplus/+server.ts` | `GET` |
| `server/api/changelogs/desqta.get.ts` | `src/routes/api/changelogs/desqta/+server.ts` | `GET` |
| `server/api/policy/privacy.get.ts` | `src/routes/api/policy/privacy/+server.ts` | `GET` |
| `server/api/upload.post.ts` | `src/routes/api/upload/+server.ts` | `POST` |
| `server/api/images/[...path].get.ts` | `src/routes/api/images/[...path]/+server.ts` | `GET` |
| `server/api/images/themes/[id]/[filename].get.ts` | `src/routes/api/images/themes/[id]/[filename]/+server.ts` | `GET` |
| `server/api/themes/index.get.ts` | `src/routes/api/themes/+server.ts` | `GET` |
| `server/api/themes/search.get.ts` | `src/routes/api/themes/search/+server.ts` | `GET` |
| `server/api/themes/spotlight.get.ts` | `src/routes/api/themes/spotlight/+server.ts` | `GET` |
| `server/api/themes/favorites.get.ts` | `src/routes/api/themes/favorites/+server.ts` | `GET` |
| `server/api/themes/recalculate-stats.post.ts` | `src/routes/api/themes/recalculate-stats/+server.ts` | `POST` |
| `server/api/themes/[id].get.ts` | `src/routes/api/themes/[id]/+server.ts` | `GET` |
| `server/api/themes/[id]/download.get.ts` | `src/routes/api/themes/[id]/download/+server.ts` | `GET` |
| `server/api/themes/[id]/theme.json.get.ts` | `src/routes/api/themes/[id]/theme.json/+server.ts` | `GET` |
| `server/api/themes/[id]/favorite.post.ts` | `src/routes/api/themes/[id]/favorite/+server.ts` | `POST` |
| `server/api/themes/[id]/favorite.delete.ts` | `src/routes/api/themes/[id]/favorite/+server.ts` | `DELETE` |
| `server/api/themes/[id]/rating.post.ts` | `src/routes/api/themes/[id]/rating/+server.ts` | `POST` |
| `server/api/themes/[id]/user-status.get.ts` | `src/routes/api/themes/[id]/user-status/+server.ts` | `GET` |
| `server/api/collections/index.get.ts` | `src/routes/api/collections/+server.ts` | `GET` |
| `server/api/collections/[id].get.ts` | `src/routes/api/collections/[id]/+server.ts` | `GET` |
| `server/api/questionnaire/index.get.ts` | `src/routes/api/questionnaire/+server.ts` | `GET` |
| `server/api/questionnaire/create.post.ts` | `src/routes/api/questionnaire/create/+server.ts` | `POST` |
| `server/api/questionnaire/current.get.ts` | `src/routes/api/questionnaire/current/+server.ts` | `GET` |
| `server/api/questionnaire/results.get.ts` | `src/routes/api/questionnaire/results/+server.ts` | `GET` |
| `server/api/questionnaire/has-voted.get.ts` | `src/routes/api/questionnaire/has-voted/+server.ts` | `GET` |
| `server/api/questionnaire/vote.post.ts` | `src/routes/api/questionnaire/vote/+server.ts` | `POST` |
| `server/api/questionnaire/reorder.post.ts` | `src/routes/api/questionnaire/reorder/+server.ts` | `POST` |
| `server/api/questionnaire/sync-votes.post.ts` | `src/routes/api/questionnaire/sync-votes/+server.ts` | `POST` |
| `server/api/questionnaire/cleanup-images.post.ts` | `src/routes/api/questionnaire/cleanup-images/+server.ts` | `POST` |
| `server/api/questionnaire/[id].get.ts` | `src/routes/api/questionnaire/[id]/+server.ts` | `GET` |
| `server/api/questionnaire/[id].put.ts` | `src/routes/api/questionnaire/[id]/+server.ts` | `PUT` |
| `server/api/questionnaire/[id].delete.ts` | `src/routes/api/questionnaire/[id]/+server.ts` | `DELETE` |
| `server/api/admin/themes/index.get.ts` | `src/routes/api/admin/themes/+server.ts` | `GET` |
| `server/api/admin/themes/index.post.ts` | `src/routes/api/admin/themes/+server.ts` | `POST` |
| `server/api/admin/themes/manifest-preview.post.ts` | `src/routes/api/admin/themes/manifest-preview/+server.ts` | `POST` |
| `server/api/admin/themes/[id].get.ts` | `src/routes/api/admin/themes/[id]/+server.ts` | `GET` |
| `server/api/admin/themes/[id].put.ts` | `src/routes/api/admin/themes/[id]/+server.ts` | `PUT` |
| `server/api/admin/themes/[id].delete.ts` | `src/routes/api/admin/themes/[id]/+server.ts` | `DELETE` |
| `server/api/admin/themes/[id]/approve.post.ts` | `src/routes/api/admin/themes/[id]/approve/+server.ts` | `POST` |
| `server/api/admin/themes/[id]/reject.post.ts` | `src/routes/api/admin/themes/[id]/reject/+server.ts` | `POST` |
| `server/api/admin/themes/[id]/update-files.post.ts` | `src/routes/api/admin/themes/[id]/update-files/+server.ts` | `POST` |
| `server/api/admin/collections/index.get.ts` | `src/routes/api/admin/collections/+server.ts` | `GET` |
| `server/api/admin/collections/index.post.ts` | `src/routes/api/admin/collections/+server.ts` | `POST` |
| `server/api/admin/collections/[id].put.ts` | `src/routes/api/admin/collections/[id]/+server.ts` | `PUT` |
| `server/api/admin/collections/[id].delete.ts` | `src/routes/api/admin/collections/[id]/+server.ts` | `DELETE` |
| `server/api/analytics/stats.get.ts` | `src/routes/api/analytics/stats/+server.ts` | `GET` |
| `server/api/analytics/themes.get.ts` | `src/routes/api/analytics/themes/+server.ts` | `GET` |
| `server/api/analytics/desqta.get.ts` | `src/routes/api/analytics/desqta/+server.ts` | `GET` |
| `server/api/analytics/questionnaire.get.ts` | `src/routes/api/analytics/questionnaire/+server.ts` | `GET` |
| `server/api/analytics/usage.get.ts` | `src/routes/api/analytics/usage/+server.ts` | `GET` |
| `server/api/analytics/usage.post.ts` | `src/routes/api/analytics/usage/+server.ts` | `POST` |
| `server/api/analytics/accounts.get.ts` | `src/routes/api/analytics/accounts/+server.ts` | `GET` |
| `server/api/analytics/accounts/users.get.ts` | `src/routes/api/analytics/accounts/users/+server.ts` | `GET` |
| `server/api/analytics/hourly-stats.get.ts` | `src/routes/api/analytics/hourly-stats/+server.ts` | `GET` |
| `server/api/analytics/test-hourly-stats.get.ts` | `src/routes/api/analytics/test-hourly-stats/+server.ts` | `GET` |
| `server/api/analytics/flush.post.ts` | `src/routes/api/analytics/flush/+server.ts` | `POST` |
| `server/api/analytics/save-hourly-stats.ts` | `src/routes/api/analytics/save-hourly-stats/+server.ts` | scheduled/internal |
| `server/api/__sitemap__/urls.ts` | `src/routes/sitemap.xml/+server.ts` | `GET` |

## Shared server code

- `server/utils/*.ts` -> `src/lib/server/*.ts`
- `server/database/schema.sql` and `server/database/migrations/*.sql` stay in place and continue to back D1
- `public/*` and font/image assets stay available as static assets for the new app
