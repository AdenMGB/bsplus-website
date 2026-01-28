import { getDB } from '../../utils/db';
import { bufferVote, checkAndFlushVotes } from '../../utils/questionnaire';

export default defineEventHandler(async (event) => {
  // Check Auth
  const user = await $fetch<any>('/api/auth/me', {
    headers: {
      cookie: getHeader(event, 'cookie') || ''
    }
  }).catch(() => null);

  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' });
  }

  const body = await readBody(event);
  const { questionId, optionIndex } = body;

  if (!questionId || !optionIndex) {
    throw createError({ statusCode: 400, message: 'Missing questionId or optionIndex' });
  }

  if (optionIndex < 1 || optionIndex > 4) {
    throw createError({ statusCode: 400, message: 'optionIndex must be between 1 and 4' });
  }

  const db = getDB(event);

  try {
    // Get question and validate it exists and is active
    const question = await db.prepare(`
      SELECT * FROM daily_questions 
      WHERE id = ? AND is_active = 1
    `).bind(questionId).first();

    if (!question) {
      throw createError({ statusCode: 404, message: 'Question not found or not active' });
    }

    // Check if expired
    const now = Math.floor(Date.now() / 1000);
    if (question.expires_at <= now) {
      await db.prepare('UPDATE daily_questions SET is_active = 0 WHERE id = ?')
        .bind(questionId).run();
      throw createError({ statusCode: 400, message: 'Question has expired' });
    }

    // Validate option exists
    const optionKey = `option${optionIndex}` as keyof typeof question;
    if (!question[optionKey]) {
      throw createError({ statusCode: 400, message: `Option ${optionIndex} does not exist` });
    }

    // Check if user already voted
    const existingVote = await db.prepare(`
      SELECT id FROM question_votes 
      WHERE question_id = ? AND user_id = ?
    `).bind(questionId, user.id).first();

    if (existingVote) {
      throw createError({ statusCode: 400, message: 'You have already voted on this question' });
    }

    // Record vote in database (for tracking who voted, but not what they voted)
    await db.prepare(`
      INSERT INTO question_votes (question_id, user_id, option_index, created_at)
      VALUES (?, ?, ?, unixepoch())
    `).bind(questionId, user.id, optionIndex).run();

    // Buffer vote for results
    bufferVote(questionId, optionIndex);

    // Check if flush needed (non-blocking)
    checkAndFlushVotes(db, event.context);

    return { success: true };
  } catch (e: any) {
    if (e.statusCode) throw e;
    throw createError({ statusCode: 500, message: 'Failed to record vote', cause: e });
  }
});
