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
    
    // Calculate total views across all paths (excluding bs_sessions)
    const totalViews = stats.results
      .filter((r: any) => r.path !== 'bs_sessions')
      .reduce((acc: number, curr: any) => acc + (curr.views || 0), 0);

    const sessions = stats.results.find((r: any) => r.path === 'bs_sessions')?.views || 0;

    const bufferStats = getBufferStats();

    return {
      views: {
        total: totalViews,
        buffer: bufferStats.views
      },
      sessions: {
        total: sessions,
        buffer: bufferStats.sessions
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

