import { getDB } from '../../utils/db';

export default defineEventHandler(async (event) => {
  // Check if this is a cron trigger or admin request
  const isCron = event.headers.get('cf-cron') === 'true';
  
  if (!isCron) {
    // Allow admin to manually trigger
    const user = await $fetch<any>('/api/auth/me', {
      headers: {
        cookie: getHeader(event, 'cookie') || ''
      }
    }).catch(() => null);

    if (!user || !user.admin_level || user.admin_level < 1) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Admin access or cron trigger required'
      });
    }
  }

  const db = getDB(event);

  try {
    // Get all approved themes
    const themes = await db.prepare(
      'SELECT id FROM themes WHERE status = ?'
    ).bind('approved').all() as { results: { id: string }[] };

    let updated = 0;
    let errors = 0;

    for (const theme of themes.results) {
      try {
        // Recalculate favorite count
        const favoriteCountResult = await db.prepare(
          'SELECT COUNT(*) as count FROM user_favorites WHERE theme_id = ?'
        ).bind(theme.id).first() as { count: number } | null;
        const favoriteCount = favoriteCountResult?.count || 0;

        // Recalculate rating average and count
        const ratingResult = await db.prepare(
          'SELECT AVG(rating) as avg, COUNT(*) as count FROM theme_ratings WHERE theme_id = ?'
        ).bind(theme.id).first() as { avg: number | null; count: number } | null;
        const ratingAverage = ratingResult?.avg || 0;
        const ratingCount = ratingResult?.count || 0;

        // Update theme with recalculated values
        await db.prepare(
          'UPDATE themes SET favorite_count = ?, rating_average = ?, rating_count = ? WHERE id = ?'
        ).bind(favoriteCount, ratingAverage, ratingCount, theme.id).run();

        updated++;
      } catch (e) {
        console.error(`[Recalculate Stats] Error updating theme ${theme.id}:`, e);
        errors++;
      }
    }

    console.log(`[Recalculate Stats] Updated ${updated} themes, ${errors} errors`);

    return {
      success: true,
      data: {
        updated,
        errors,
        total: themes.results.length
      },
      error: null,
      meta: {
        timestamp: Date.now(),
        version: '1.0.0'
      }
    };
  } catch (e: any) {
    console.error('[Recalculate Stats] Failed:', e);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to recalculate theme stats',
      cause: e
    });
  }
});
