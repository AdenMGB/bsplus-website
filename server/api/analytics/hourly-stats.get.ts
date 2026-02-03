import { getDB } from '../../utils/db';

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

  const query = getQuery(event);
  const hours = Number(query.hours) || 24; // Default to last 24 hours
  
  const db = getDB(event);

  try {
    // Calculate the timestamp for X hours ago
    const now = Math.floor(Date.now() / 1000);
    const hoursAgo = Math.floor(now / 3600) * 3600 - (hours * 3600);
    
    const { results } = await db.prepare(
      `SELECT * FROM hourly_stats 
       WHERE timestamp >= ? 
       ORDER BY timestamp ASC`
    ).bind(hoursAgo).all();

    return results;
  } catch (e: any) {
    console.error('[API Error] Failed to fetch hourly stats:', e);
    if (e.statusCode) throw e;
    throw createError({ statusCode: 500, message: 'Database error', cause: e });
  }
});

