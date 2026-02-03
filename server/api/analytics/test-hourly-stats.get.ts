import { getDB } from '../../utils/db';
import { saveHourlyStats } from '../../utils/analytics';

export default defineEventHandler(async (event) => {
  // Check Auth (admin only)
  const user = await $fetch<any>('/api/auth/me', {
    headers: {
      cookie: getHeader(event, 'cookie') || ''
    }
  }).catch(() => null);

  if (!user || !user.admin_level || user.admin_level < 1) {
    throw createError({ statusCode: 403, message: 'Forbidden' });
  }

  const db = getDB(event);

  try {
    // Check current stats
    const stats = await db.prepare('SELECT * FROM page_stats').all();
    const sessions = stats.results.find((r: any) => r.path === 'bs_sessions')?.views || 0;
    const desqtaSessions = stats.results.find((r: any) => r.path === 'desqta_sessions')?.views || 0;

    // Check existing hourly stats
    const { results: existingStats } = await db.prepare('SELECT * FROM hourly_stats ORDER BY timestamp DESC LIMIT 10').all();

    // Try to save hourly stats
    await saveHourlyStats(db);

    // Check again after save
    const now = Math.floor(Date.now() / 1000);
    const hourTimestamp = Math.floor(now / 3600) * 3600;
    const savedStat = await db.prepare('SELECT * FROM hourly_stats WHERE timestamp = ?').bind(hourTimestamp).first();

    return {
      currentStats: {
        extension_sessions: sessions,
        desqta_sessions: desqtaSessions,
      },
      existingStats: existingStats || [],
      savedStat,
      hourTimestamp,
      timestampReadable: new Date(hourTimestamp * 1000).toISOString(),
    };
  } catch (e: any) {
    console.error('[Test] Failed:', e);
    throw createError({ statusCode: 500, message: 'Test failed', cause: e });
  }
});

