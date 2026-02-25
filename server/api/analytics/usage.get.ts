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
  const days = Math.min(Math.max(Number(query.days) || 30, 1), 90);

  const db = getDB(event);

  try {
    // Daily aggregates (for charts)
    const { results: dailyRaw } = await db
      .prepare(
        `SELECT 
          date,
          SUM(sessions_count) as total_sessions,
          COUNT(*) as report_count,
          SUM(CASE WHEN cloud_signed_in = 1 THEN 1 ELSE 0 END) as signed_in_count
         FROM app_usage_analytics
         WHERE date >= date('now', '-' || ? || ' days')
         GROUP BY date
         ORDER BY date ASC`
      )
      .bind(days)
      .all();

    const daily = (dailyRaw || []).map((r: any) => ({
      ...r,
      timestamp: Math.floor(new Date(r.date + 'T12:00:00Z').getTime() / 1000),
    }));

    // Platform breakdown
    const { results: byPlatform } = await db
      .prepare(
        `SELECT 
          COALESCE(platform, 'unknown') as platform,
          SUM(sessions_count) as total_sessions,
          COUNT(*) as report_count
         FROM app_usage_analytics
         WHERE date >= date('now', '-' || ? || ' days')
         GROUP BY platform
         ORDER BY total_sessions DESC`
      )
      .bind(days)
      .all();

    // Summary totals
    const summary = await db
      .prepare(
        `SELECT 
          COUNT(*) as total_reports,
          COALESCE(SUM(sessions_count), 0) as total_sessions,
          SUM(CASE WHEN cloud_signed_in = 1 THEN 1 ELSE 0 END) as signed_in_reports
         FROM app_usage_analytics
         WHERE date >= date('now', '-' || ? || ' days')`
      )
      .bind(days)
      .first() as { total_reports: number; total_sessions: number; signed_in_reports: number };

    return {
      daily: daily || [],
      byPlatform: byPlatform || [],
      summary: {
        totalReports: summary?.total_reports ?? 0,
        totalSessions: summary?.total_sessions ?? 0,
        signedInReports: summary?.signed_in_reports ?? 0,
      },
    };
  } catch (e) {
    console.error('[Analytics] Failed to fetch usage:', e);
    throw createError({ statusCode: 500, message: 'Database error' });
  }
});
