import { getDB } from '../../utils/db';
import { getBucket } from '../../utils/r2';

export default defineEventHandler(async (event) => {
  // Check Auth
  const user = await $fetch<any>('/api/auth/me', {
    headers: {
      cookie: getHeader(event, 'cookie') || ''
    }
  }).catch(() => null);

  if (!user || !user.admin_level || user.admin_level < 1) {
    throw createError({ statusCode: 403, message: 'Forbidden' });
  }

  const id = event.path.split('/').pop();
  if (!id) {
    throw createError({ statusCode: 400, message: 'Invalid question ID' });
  }

  const db = getDB(event);

  try {
    // Get question to check for cover image
    const question = await db.prepare('SELECT cover_image FROM daily_questions WHERE id = ?')
      .bind(id).first();

    if (!question) {
      throw createError({ statusCode: 404, message: 'Question not found' });
    }

    // Delete cover image from R2 if exists
    if (question.cover_image && question.cover_image.startsWith('/api/images/')) {
      const imageKey = question.cover_image.replace('/api/images/', '');
      try {
        const bucket = getBucket(event);
        await bucket.delete(imageKey);
        console.log(`[Questionnaire] Deleted cover image: ${imageKey}`);
      } catch (e) {
        console.error('[Questionnaire] Failed to delete cover image:', e);
        // Continue with deletion even if image deletion fails
      }
    }

    // Delete votes
    await db.prepare('DELETE FROM question_votes WHERE question_id = ?').bind(id).run();

    // Delete results
    await db.prepare('DELETE FROM question_results WHERE question_id = ?').bind(id).run();

    // Delete question
    await db.prepare('DELETE FROM daily_questions WHERE id = ?').bind(id).run();

    return { success: true };
  } catch (e: any) {
    console.error('[Questionnaire] Failed to delete question:', e);
    if (e.statusCode) throw e;
    throw createError({ statusCode: 500, message: 'Failed to delete question', cause: e });
  }
});
