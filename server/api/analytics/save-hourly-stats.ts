import { getDB } from '../../utils/db';

export default defineEventHandler(async (event) => {
  // This can be called via cron trigger or manually
  const db = getDB(event);

  try {
    // Get current counts from page_stats
    const stats = await db.prepare('SELECT * FROM page_stats').all();
    const sessions = stats.results.find((r: any) => r.path === 'bs_sessions')?.views || 0;
    const desqtaSessions = stats.results.find((r: any) => r.path === 'desqta_sessions')?.views || 0;

    // Round down to the hour (Unix timestamp)
    const now = Math.floor(Date.now() / 1000);
    const hourTimestamp = Math.floor(now / 3600) * 3600;

    // Insert or update hourly stats
    await db.prepare(
      `INSERT INTO hourly_stats (timestamp, extension_sessions, desqta_sessions)
       VALUES (?, ?, ?)
       ON CONFLICT(timestamp) DO UPDATE SET
         extension_sessions = excluded.extension_sessions,
         desqta_sessions = excluded.desqta_sessions`
    ).bind(hourTimestamp, sessions, desqtaSessions).run();

    console.log(`[Hourly Stats] Saved stats for ${new Date(hourTimestamp * 1000).toISOString()}: ${sessions} extension sessions, ${desqtaSessions} desqta sessions`);

    return { success: true, timestamp: hourTimestamp, sessions, desqtaSessions };
  } catch (e: any) {
    console.error('[Hourly Stats] Failed to save:', e);
    throw createError({ statusCode: 500, message: 'Failed to save hourly stats', cause: e });
  }
});

