import { getDB } from '../../utils/db';
import { getBufferStats } from '../../utils/analytics';

export default defineEventHandler(async (event) => {
  // Check Auth (admin only for stats)
  const user = await $fetch<any>('/api/auth/me', {
    headers: {
      cookie: getHeader(event, 'cookie') || ''
    }
  }).catch(() => null);

  if (!user || user.is_admin !== 1) {
    throw createError({ statusCode: 403, message: 'Forbidden' });
  }

  const db = getDB(event);

  try {
    const stats = await db.prepare('SELECT * FROM page_stats').all();
    const newsCount = await db.prepare('SELECT COUNT(*) as count FROM news').first();
    const publishedCount = await db.prepare('SELECT COUNT(*) as count FROM news WHERE published = 1').first();
    
    const sessions = stats.results.find((r: any) => r.path === 'bs_sessions')?.views || 0;
    const desqtaSessions = stats.results.find((r: any) => r.path === 'desqta_sessions')?.views || 0;

    const bufferStats = getBufferStats();

    return {
      sessions: {
        total: sessions,
        buffer: bufferStats.sessions
      },
      desqtaSessions: {
        total: desqtaSessions,
        buffer: bufferStats.desqtaSessions
      },
      news: {
        total: newsCount.count,
        published: publishedCount.count
      }
    };
  } catch (e) {
    console.error('Failed to fetch stats:', e);
    throw createError({ statusCode: 500, message: 'Database error' });
  }
});

