import { getDB } from '../../utils/db';
import { getBucket } from '../../utils/r2';

export default defineEventHandler(async (event) => {
  // Check Auth (allow cron trigger without auth)
  const isCron = event.headers.get('cf-cron') === 'true';
  
  if (!isCron) {
    const user = await $fetch<any>('/api/auth/me', {
      headers: {
        cookie: getHeader(event, 'cookie') || ''
      }
    }).catch(() => null);

    if (!user || !user.admin_level || user.admin_level < 1) {
      throw createError({ statusCode: 403, message: 'Forbidden' });
    }
  }

  const db = getDB(event);
  const bucket = getBucket(event);

  try {
    // Calculate 30 days ago timestamp
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);

    // Find questions with cover images older than 30 days
    const questions = await db.prepare(`
      SELECT id, cover_image 
      FROM daily_questions 
      WHERE cover_image IS NOT NULL 
        AND cover_image_uploaded_at IS NOT NULL
        AND cover_image_uploaded_at < ?
    `).bind(thirtyDaysAgo).all();

    let deletedCount = 0;
    let errorCount = 0;

    for (const question of questions.results) {
      if (question.cover_image && question.cover_image.startsWith('/api/images/')) {
        const imageKey = question.cover_image.replace('/api/images/', '');
        
        try {
          // Delete from R2
          await bucket.delete(imageKey);
          
          // Update database to remove image reference
          await db.prepare(`
            UPDATE daily_questions 
            SET cover_image = NULL, cover_image_uploaded_at = NULL 
            WHERE id = ?
          `).bind(question.id).run();
          
          deletedCount++;
          console.log(`[Questionnaire Cleanup] Deleted image ${imageKey} for question ${question.id}`);
        } catch (e) {
          errorCount++;
          console.error(`[Questionnaire Cleanup] Failed to delete image ${imageKey}:`, e);
        }
      }
    }

    return {
      success: true,
      deleted: deletedCount,
      errors: errorCount,
      total: questions.results.length
    };
  } catch (e: any) {
    console.error('[Questionnaire Cleanup] Failed to cleanup images:', e);
    throw createError({ statusCode: 500, message: 'Failed to cleanup images', cause: e });
  }
});
