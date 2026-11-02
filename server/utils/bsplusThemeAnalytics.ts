import type { H3Event } from 'h3';
import {
  type BsplusExtensionClientContext,
  parseOptionalBsplusExtensionQuery,
  resolveBsplusClientUserId,
  touchBsplusInstallActivity,
} from './bsplusExtensionClientContext';
import { generateUUID } from './themes';

export type ThemeDownloadEventInput = {
  themeId: string;
  themeSource: 'official' | 'community';
  client: BsplusExtensionClientContext;
  resolvedUserId: string | null;
  route: string;
  event: H3Event;
};

export type ThemeCatalogEventInput = {
  eventType: 'list' | 'detail' | 'search' | 'totm';
  themeId?: string | null;
  client: BsplusExtensionClientContext;
  resolvedUserId: string | null;
  route: string;
};

function authMethod(
  event: H3Event,
  resolvedUserId: string | null,
  queryUserId: string | null
): 'bearer' | 'query_only' | 'anonymous' {
  const bearer = getHeader(event, 'authorization')?.startsWith('Bearer ');
  if (bearer && resolvedUserId) return 'bearer';
  if (queryUserId) return 'query_only';
  return 'anonymous';
}

function scheduleDbWrite(event: H3Event, promise: Promise<unknown>): void {
  const context = (event.context as { cloudflare?: { waitUntil?: (p: Promise<unknown>) => void } })
    .cloudflare;
  if (context?.waitUntil) {
    context.waitUntil(promise);
  } else {
    promise.catch((e) => console.error('[bsplusThemeAnalytics]', e));
  }
}

export async function insertThemeDownloadEvent(
  db: {
    prepare: (sql: string) => {
      bind: (...args: unknown[]) => { run: () => Promise<unknown> };
    };
  },
  input: ThemeDownloadEventInput
): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  await db
    .prepare(
      `INSERT INTO bsplus_theme_download_events (
         id, occurred_at, theme_id, theme_source, install_id, user_id, query_user_id,
         extension_version, channel, auth_method, route
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      generateUUID(),
      now,
      input.themeId,
      input.themeSource,
      input.client.installId,
      input.resolvedUserId,
      input.client.userId,
      input.client.extensionVersion,
      input.client.channel,
      authMethod(input.event, input.resolvedUserId, input.client.userId),
      input.route
    )
    .run();
}

export async function insertThemeCatalogEvent(
  db: {
    prepare: (sql: string) => {
      bind: (...args: unknown[]) => { run: () => Promise<unknown> };
    };
  },
  input: ThemeCatalogEventInput
): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  await db
    .prepare(
      `INSERT INTO bsplus_theme_catalog_events (
         id, occurred_at, event_type, theme_id, install_id, user_id,
         extension_version, channel, route
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      generateUUID(),
      now,
      input.eventType,
      input.themeId ?? null,
      input.client.installId,
      input.resolvedUserId,
      input.client.extensionVersion,
      input.client.channel,
      input.route
    )
    .run();
}

export function recordThemeDownloadEvent(
  event: H3Event,
  db: Parameters<typeof insertThemeDownloadEvent>[0],
  input: ThemeDownloadEventInput
): void {
  scheduleDbWrite(event, insertThemeDownloadEvent(db, input));
}

export function recordThemeCatalogEvent(
  event: H3Event,
  db: Parameters<typeof insertThemeCatalogEvent>[0],
  input: ThemeCatalogEventInput
): void {
  scheduleDbWrite(event, insertThemeCatalogEvent(db, input));
}

/** Fire-and-forget catalog analytics when extension sends client context. */
export function maybeRecordThemeCatalogEvent(
  event: H3Event,
  db: Parameters<typeof insertThemeCatalogEvent>[0],
  input: Omit<ThemeCatalogEventInput, 'client' | 'resolvedUserId'> & {
    query: Record<string, unknown>;
  }
): void {
  const client = parseOptionalBsplusExtensionQuery(input.query);
  if (!client.installId && !client.userId && !client.extensionVersion) return;
  const promise = (async () => {
    const resolvedUserId = await resolveAnalyticsUserId(event, client);
    await insertThemeCatalogEvent(db, {
      ...input,
      client,
      resolvedUserId,
    });
  })();
  scheduleDbWrite(event, promise);
}

export function maybeRecordThemeDownloadEvent(
  event: H3Event,
  db: Parameters<typeof insertThemeDownloadEvent>[0],
  input: Omit<ThemeDownloadEventInput, 'client' | 'resolvedUserId'> & {
    query: Record<string, unknown>;
  }
): void {
  const client = parseOptionalBsplusExtensionQuery(input.query);
  const promise = (async () => {
    const resolvedUserId = await resolveAnalyticsUserId(event, client);
    await touchDownloadSideEffects(db, client, resolvedUserId);
    await insertThemeDownloadEvent(db, {
      themeId: input.themeId,
      themeSource: input.themeSource,
      route: input.route,
      client,
      resolvedUserId,
      event,
    });
  })();
  scheduleDbWrite(event, promise);
}

async function touchDownloadSideEffects(
  db: Parameters<typeof insertThemeDownloadEvent>[0],
  client: BsplusExtensionClientContext,
  resolvedUserId: string | null
): Promise<void> {
  await touchBsplusInstallActivity(db, client, resolvedUserId);
}

export async function resolveAnalyticsUserId(
  event: H3Event,
  client: BsplusExtensionClientContext
): Promise<string | null> {
  return resolveBsplusClientUserId(event, client.userId);
}

export async function getThemeDownloadAnalyticsSummary(
  db: any,
  options: {
    sinceUnix: number;
    themeId?: string | null;
    userId?: string | null;
    installId?: string | null;
    limit?: number;
  }
): Promise<{
  total_downloads: number;
  by_theme: Array<{ theme_id: string; theme_source: string; count: number }>;
  by_channel: Array<{ channel: string; count: number }>;
  by_auth: Array<{ auth_method: string; count: number }>;
  by_binding: Array<{ binding: string; count: number }>;
  by_user: Array<{ user_id: string; count: number }>;
  by_install: Array<{ install_id: string; count: number }>;
  recent: Array<Record<string, unknown>>;
}> {
  const limit = Math.min(options.limit ?? 50, 200);
  const filters: string[] = ['occurred_at >= ?'];
  const baseParams: unknown[] = [options.sinceUnix];

  if (options.themeId) {
    filters.push('theme_id = ?');
    baseParams.push(options.themeId);
  }
  if (options.userId) {
    filters.push('(user_id = ? OR query_user_id = ?)');
    baseParams.push(options.userId, options.userId);
  }
  if (options.installId) {
    filters.push('install_id = ?');
    baseParams.push(options.installId);
  }

  const whereSql = filters.join(' AND ');

  const total = await db
    .prepare(`SELECT COUNT(*) AS count FROM bsplus_theme_download_events WHERE ${whereSql}`)
    .bind(...baseParams)
    .first<{ count: number }>();

  const byTheme = await db
    .prepare(
      `SELECT theme_id, theme_source, COUNT(*) AS count
       FROM bsplus_theme_download_events
       WHERE ${whereSql}
       GROUP BY theme_id, theme_source
       ORDER BY count DESC
       LIMIT ?`
    )
    .bind(...baseParams, limit)
    .all();

  const byChannel = await db
    .prepare(
      `SELECT COALESCE(channel, 'unknown') AS channel, COUNT(*) AS count
       FROM bsplus_theme_download_events
       WHERE ${whereSql}
       GROUP BY channel
       ORDER BY count DESC`
    )
    .bind(...baseParams)
    .all();

  const byAuth = await db
    .prepare(
      `SELECT auth_method, COUNT(*) AS count
       FROM bsplus_theme_download_events
       WHERE ${whereSql}
       GROUP BY auth_method`
    )
    .bind(...baseParams)
    .all();

  const byBinding = await db
    .prepare(
      `SELECT
         CASE
           WHEN user_id IS NOT NULL AND install_id IS NOT NULL AND user_id = query_user_id THEN 'linked_consistent'
           WHEN user_id IS NOT NULL AND install_id IS NOT NULL AND query_user_id IS NOT NULL AND user_id != query_user_id THEN 'linked_mismatch'
           WHEN user_id IS NOT NULL AND install_id IS NOT NULL THEN 'linked_install'
           WHEN user_id IS NOT NULL THEN 'user_only'
           WHEN install_id IS NOT NULL THEN 'install_only'
           ELSE 'anonymous'
         END AS binding,
         COUNT(*) AS count
       FROM bsplus_theme_download_events
       WHERE ${whereSql}
       GROUP BY binding
       ORDER BY count DESC`
    )
    .bind(...baseParams)
    .all();

  const byUser = await db
    .prepare(
      `SELECT user_id, COUNT(*) AS count
       FROM bsplus_theme_download_events
       WHERE ${whereSql} AND user_id IS NOT NULL
       GROUP BY user_id
       ORDER BY count DESC
       LIMIT ?`
    )
    .bind(...baseParams, Math.min(limit, 25))
    .all();

  const byInstall = await db
    .prepare(
      `SELECT install_id, COUNT(*) AS count
       FROM bsplus_theme_download_events
       WHERE ${whereSql} AND install_id IS NOT NULL
       GROUP BY install_id
       ORDER BY count DESC
       LIMIT ?`
    )
    .bind(...baseParams, Math.min(limit, 25))
    .all();

  const recent = await db
    .prepare(
      `SELECT id, occurred_at, theme_id, theme_source, install_id, user_id, query_user_id,
              extension_version, channel, auth_method, route
       FROM bsplus_theme_download_events
       WHERE ${whereSql}
       ORDER BY occurred_at DESC
       LIMIT ?`
    )
    .bind(...baseParams, limit)
    .all();

  return {
    total_downloads: total?.count ?? 0,
    by_theme: (byTheme.results || []) as Array<{ theme_id: string; theme_source: string; count: number }>,
    by_channel: (byChannel.results || []) as Array<{ channel: string; count: number }>,
    by_auth: (byAuth.results || []) as Array<{ auth_method: string; count: number }>,
    by_binding: (byBinding.results || []) as Array<{ binding: string; count: number }>,
    by_user: (byUser.results || []) as Array<{ user_id: string; count: number }>,
    by_install: (byInstall.results || []) as Array<{ install_id: string; count: number }>,
    recent: (recent.results || []) as Array<Record<string, unknown>>,
  };
}

export async function getThemeCatalogAnalyticsSummary(
  db: any,
  options: { sinceUnix: number; userId?: string | null; installId?: string | null; limit?: number }
): Promise<{
  total_events: number;
  by_type: Array<{ event_type: string; count: number }>;
  by_binding: Array<{ binding: string; count: number }>;
}> {
  const limit = Math.min(options.limit ?? 20, 100);
  const filters: string[] = ['occurred_at >= ?'];
  const baseParams: unknown[] = [options.sinceUnix];
  if (options.userId) {
    filters.push('user_id = ?');
    baseParams.push(options.userId);
  }
  if (options.installId) {
    filters.push('install_id = ?');
    baseParams.push(options.installId);
  }
  const whereSql = filters.join(' AND ');

  const total = await db
    .prepare(`SELECT COUNT(*) AS count FROM bsplus_theme_catalog_events WHERE ${whereSql}`)
    .bind(...baseParams)
    .first<{ count: number }>();

  const byType = await db
    .prepare(
      `SELECT event_type, COUNT(*) AS count
       FROM bsplus_theme_catalog_events
       WHERE ${whereSql}
       GROUP BY event_type
       ORDER BY count DESC
       LIMIT ?`
    )
    .bind(...baseParams, limit)
    .all();

  const byBinding = await db
    .prepare(
      `SELECT
         CASE
           WHEN user_id IS NOT NULL AND install_id IS NOT NULL THEN 'linked'
           WHEN user_id IS NOT NULL THEN 'user_only'
           WHEN install_id IS NOT NULL THEN 'install_only'
           ELSE 'anonymous'
         END AS binding,
         COUNT(*) AS count
       FROM bsplus_theme_catalog_events
       WHERE ${whereSql}
       GROUP BY binding`
    )
    .bind(...baseParams)
    .all();

  return {
    total_events: total?.count ?? 0,
    by_type: (byType.results || []) as Array<{ event_type: string; count: number }>,
    by_binding: (byBinding.results || []) as Array<{ binding: string; count: number }>,
  };
}
