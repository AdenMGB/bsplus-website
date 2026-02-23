import { getDB } from '../../utils/db';
import { getBufferStats } from '../../utils/analytics';

export default defineEventHandler(async (event) => {
  // Check Auth (admin only for stats)
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
    const stats = await db.prepare('SELECT * FROM page_stats').all();
    const newsCount = await db.prepare('SELECT COUNT(*) as count FROM news').first();
    const publishedCount = await db.prepare('SELECT COUNT(*) as count FROM news WHERE published = 1').first();
    const themesTotal = await db.prepare('SELECT COUNT(*) as count FROM themes').first() as { count: number };
    const themesPending = await db.prepare("SELECT COUNT(*) as count FROM themes WHERE status = 'pending'").first() as { count: number };
    const themesApproved = await db.prepare("SELECT COUNT(*) as count FROM themes WHERE status = 'approved'").first() as { count: number };

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
      },
      themes: {
        total: themesTotal?.count ?? 0,
        pending: themesPending?.count ?? 0,
        approved: themesApproved?.count ?? 0
      }
    };
  } catch (e) {
    console.error('Failed to fetch stats:', e);
    throw createError({ statusCode: 500, message: 'Database error' });
  }
});

