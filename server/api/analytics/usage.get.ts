/**
 * App usage analytics - admin only.
 * Returns aggregated data from app_usage_analytics for dashboards.
 */
import { getDB } from '../../utils/db';
import { getHeader } from 'h3';

export default defineEventHandler(async (event) => {
  const user = await $fetch<any>('/api/auth/me', {
    headers: { cookie: getHeader(event, 'cookie') || '' },
  }).catch(() => null);

  if (!user || !user.admin_level || user.admin_level < 1) {
    throw createError({ statusCode: 403, message: 'Forbidden' });
  }

  const query = getQuery(event);
  const daysParam = query.days;
  const allTime =
    daysParam === 'all' ||
    daysParam === '0' ||
    daysParam === '' ||
    (typeof daysParam === 'string' && daysParam.toLowerCase() === 'all');
  const days = allTime
    ? null
    : Math.min(Math.max(Number(daysParam) || 30, 1), 365);

  const db = getDB(event);

  const dateFilter = days != null ? `WHERE date >= date('now', '-' || ? || ' days')` : '';
  const bindDays = days != null ? [days] : [];

  try {
    // Daily aggregates (for charts) - include signed-in vs anonymous sessions
    const dailySql = `SELECT 
          date,
          SUM(sessions_count) as total_sessions,
          SUM(CASE WHEN cloud_signed_in = 1 THEN sessions_count ELSE 0 END) as signed_in_sessions,
          SUM(CASE WHEN cloud_signed_in = 0 THEN sessions_count ELSE 0 END) as anonymous_sessions,
          COUNT(*) as report_count,
          SUM(CASE WHEN cloud_signed_in = 1 THEN 1 ELSE 0 END) as signed_in_count
         FROM app_usage_analytics
         ${dateFilter}
         GROUP BY date
         ORDER BY date ASC`;
    const { results: dailyRaw } = await db
      .prepare(dailySql)
      .bind(...bindDays)
      .all();

    const daily = (dailyRaw || []).map((r: any) => ({
      ...r,
      timestamp: Math.floor(new Date(r.date + 'T12:00:00Z').getTime() / 1000),
    }));

    // Platform breakdown
    const platformSql = `SELECT 
          COALESCE(platform, 'unknown') as platform,
          SUM(sessions_count) as total_sessions,
          COUNT(*) as report_count,
          SUM(CASE WHEN cloud_signed_in = 1 THEN sessions_count ELSE 0 END) as signed_in_sessions,
          SUM(CASE WHEN cloud_signed_in = 0 THEN sessions_count ELSE 0 END) as anonymous_sessions
         FROM app_usage_analytics
         ${dateFilter}
         GROUP BY platform
         ORDER BY total_sessions DESC`;
    const { results: byPlatform } = await db
      .prepare(platformSql)
      .bind(...bindDays)
      .all();

    // Version breakdown
    const versionSql = `SELECT 
          COALESCE(app_version, 'unknown') as app_version,
          SUM(sessions_count) as total_sessions,
          COUNT(*) as report_count
         FROM app_usage_analytics
         ${dateFilter}
         GROUP BY app_version
         ORDER BY total_sessions DESC`;
    const { results: byVersion } = await db
      .prepare(versionSql)
      .bind(...bindDays)
      .all();

    // Summary totals (including unique clients/users)
    const summarySql = `SELECT 
          COUNT(*) as total_reports,
          COALESCE(SUM(sessions_count), 0) as total_sessions,
          SUM(CASE WHEN cloud_signed_in = 1 THEN 1 ELSE 0 END) as signed_in_reports,
          SUM(CASE WHEN cloud_signed_in = 1 THEN sessions_count ELSE 0 END) as signed_in_sessions,
          SUM(CASE WHEN cloud_signed_in = 0 THEN sessions_count ELSE 0 END) as anonymous_sessions,
          COUNT(DISTINCT CASE WHEN client_id IS NOT NULL AND client_id != '' THEN client_id END) as unique_clients,
          COUNT(DISTINCT CASE WHEN user_id IS NOT NULL AND user_id != '' THEN user_id END) as unique_users
         FROM app_usage_analytics
         ${dateFilter}`;
    const summary = await db
      .prepare(summarySql)
      .bind(...bindDays)
      .first() as {
        total_reports: number;
        total_sessions: number;
        signed_in_reports: number;
        signed_in_sessions: number;
        anonymous_sessions: number;
        unique_clients: number;
        unique_users: number;
      };

    return {
      daily: daily || [],
      byPlatform: byPlatform || [],
      byVersion: byVersion || [],
      summary: {
        totalReports: summary?.total_reports ?? 0,
        totalSessions: summary?.total_sessions ?? 0,
        signedInReports: summary?.signed_in_reports ?? 0,
        signedInSessions: summary?.signed_in_sessions ?? 0,
        anonymousSessions: summary?.anonymous_sessions ?? 0,
        uniqueClients: summary?.unique_clients ?? 0,
        uniqueUsers: summary?.unique_users ?? 0,
      },
    };
  } catch (e) {
    console.error('[Analytics] Failed to fetch usage:', e);
    throw createError({ statusCode: 500, message: 'Database error' });
  }
});
