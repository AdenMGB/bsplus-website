import { getDB } from '../../utils/db';
import { convertACSTToUTC, convertUTCToACST, formatACSTDateTime, getTimezoneLabel } from '../../utils/timezone';

export default defineEventHandler(async (event) => {
  // Check Auth
  const user = await $fetch<any>('/api/auth/me', {
    headers: {
      cookie: getHeader(event, 'cookie') || ''
    }
  }).catch(() => null);

  if (!user || user.is_admin !== 1) {
    throw createError({ statusCode: 403, message: 'Forbidden' });
  }

  const body = await readBody(event);
  const { question, options, expiresAt, cover_image, duration, auto_activate, queue_order } = body;

  if (!question || !options) {
    throw createError({ statusCode: 400, message: 'Missing required fields: question, options' });
  }

  if (!Array.isArray(options) || options.length < 2 || options.length > 4) {
    throw createError({ statusCode: 400, message: 'Options must be an array with 2-4 items' });
  }

  const now = Math.floor(Date.now() / 1000);
  let expiresAtUTC: number;
  let isActive = 0;

  if (auto_activate && duration) {
    // Queue-based question: calculate expiration when activated
    // For now, set expires_at to a placeholder (will be set when activated)
    expiresAtUTC = now + duration; // Temporary, will be recalculated on activation
    isActive = 0; // Start inactive, will be activated automatically
  } else if (expiresAt) {
    // Manual question: use exact expiration time
    try {
      expiresAtUTC = convertACSTToUTC(expiresAt);
    } catch (e: any) {
      throw createError({ statusCode: 400, message: `Invalid expiresAt format: ${e.message}` });
    }

    if (expiresAtUTC <= now) {
      throw createError({ statusCode: 400, message: 'Expiration date must be in the future' });
    }
    isActive = 1; // Activate immediately for manual questions
  } else {
    throw createError({ statusCode: 400, message: 'Either expiresAt (manual) or duration (queue) must be provided' });
  }

  const db = getDB(event);

  try {
    // Deactivate previous active question only if this is a manual question
    if (!auto_activate) {
      await db.prepare('UPDATE daily_questions SET is_active = 0 WHERE is_active = 1').run();
    }

    // Generate UUID
    const questionId = crypto.randomUUID();

    // Get cover image upload timestamp if provided
    const coverImageUploadedAt = cover_image ? Math.floor(Date.now() / 1000) : null;

    // Insert new question
    await db.prepare(`
      INSERT INTO daily_questions (
        id, question, option1, option2, option3, option4, 
        cover_image, cover_image_uploaded_at, expires_at, created_at, is_active,
        duration, auto_activate, queue_order
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), ?, ?, ?, ?)
    `).bind(
      questionId,
      question,
      options[0],
      options[1],
      options[2] || null,
      options[3] || null,
      cover_image || null,
      coverImageUploadedAt,
      expiresAtUTC,
      isActive,
      duration || null,
      auto_activate ? 1 : 0,
      queue_order || null
    ).run();

    // Initialize results
    await db.prepare(`
      INSERT INTO question_results (question_id, option1_count, option2_count, option3_count, option4_count, total_votes, last_updated)
      VALUES (?, 0, 0, 0, 0, 0, unixepoch())
    `).bind(questionId).run();

    // Get created question
    const createdQuestion = await db.prepare(`
      SELECT * FROM daily_questions WHERE id = ?
    `).bind(questionId).first();

    return {
      id: createdQuestion.id,
      question: createdQuestion.question,
      options: [
        createdQuestion.option1,
        createdQuestion.option2,
        createdQuestion.option3,
        createdQuestion.option4
      ].filter(Boolean),
      cover_image: createdQuestion.cover_image,
      expires_at: createdQuestion.expires_at,
      expires_at_acst: convertUTCToACST(createdQuestion.expires_at),
      expires_at_formatted: formatACSTDateTime(createdQuestion.expires_at),
      timezone_label: getTimezoneLabel(createdQuestion.expires_at),
      created_at: createdQuestion.created_at,
      is_active: createdQuestion.is_active
    };
  } catch (e: any) {
    console.error('[Questionnaire] Failed to create question:', e);
    if (e.statusCode) throw e;
    throw createError({ statusCode: 500, message: 'Failed to create question', cause: e });
  }
});
