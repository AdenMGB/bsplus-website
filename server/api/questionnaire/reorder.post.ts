import { getDB } from '../../utils/db';

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

  const body = await readBody(event);
  const { questionIds } = body;

  if (!Array.isArray(questionIds) || questionIds.length === 0) {
    throw createError({ statusCode: 400, message: 'questionIds must be a non-empty array' });
  }

  const db = getDB(event);

  try {
    // Update queue_order for each question based on array position
    const updates = questionIds.map((id: string, index: number) => {
      return db.prepare('UPDATE daily_questions SET queue_order = ? WHERE id = ?')
        .bind(index + 1, id);
    });

    await db.batch(updates);

    return { success: true };
  } catch (e: any) {
    throw createError({ statusCode: 500, message: 'Failed to reorder questions', cause: e });
  }
});
