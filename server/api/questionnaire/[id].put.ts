import { getDB } from '../../utils/db';
import { convertACSTToUTC, convertUTCToACST, formatACSTDateTime, getTimezoneLabel } from '../../utils/timezone';
import { getBucket } from '../../utils/r2';

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

  const id = event.path.split('/').pop();
  if (!id) {
    throw createError({ statusCode: 400, message: 'Invalid question ID' });
  }

  const body = await readBody(event);
  const db = getDB(event);

  try {
    // Get existing question
    const existing = await db.prepare('SELECT * FROM daily_questions WHERE id = ?')
      .bind(id).first();

    if (!existing) {
      throw createError({ statusCode: 404, message: 'Question not found' });
    }

    // Track old cover image for cleanup if changed
    let oldCoverImage: string | null = null;
    if (body.cover_image !== undefined && body.cover_image !== existing.cover_image) {
      oldCoverImage = existing.cover_image;
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (body.question !== undefined) {
      updates.push('question = ?');
      values.push(body.question);
    }

    if (body.options !== undefined) {
      if (!Array.isArray(body.options) || body.options.length < 2 || body.options.length > 4) {
        throw createError({ statusCode: 400, message: 'Options must be an array with 2-4 items' });
      }
      updates.push('option1 = ?');
      updates.push('option2 = ?');
      updates.push('option3 = ?');
      updates.push('option4 = ?');
      values.push(body.options[0], body.options[1], body.options[2] || null, body.options[3] || null);
    }

    if (body.expiresAt !== undefined) {
      let expiresAtUTC: number;
      try {
        expiresAtUTC = convertACSTToUTC(body.expiresAt);
      } catch (e: any) {
        throw createError({ statusCode: 400, message: `Invalid expiresAt format: ${e.message}` });
      }

      const now = Math.floor(Date.now() / 1000);
      if (expiresAtUTC <= now && !existing.is_active) {
        // Allow past dates for inactive questions
      } else if (expiresAtUTC <= now) {
        throw createError({ statusCode: 400, message: 'Expiration date must be in the future for active questions' });
      }

      updates.push('expires_at = ?');
      values.push(expiresAtUTC);
    }

    if (body.cover_image !== undefined) {
      updates.push('cover_image = ?');
      updates.push('cover_image_uploaded_at = ?');
      values.push(body.cover_image || null, body.cover_image ? Math.floor(Date.now() / 1000) : null);
    }

    if (body.is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(body.is_active ? 1 : 0);
      
      // If activating this question, deactivate all others
      if (body.is_active) {
        await db.prepare('UPDATE daily_questions SET is_active = 0 WHERE id != ? AND is_active = 1')
          .bind(id).run();
      }
    }

    if (updates.length === 0) {
      throw createError({ statusCode: 400, message: 'No fields to update' });
    }

    // Execute update
    values.push(id);
    await db.prepare(`
      UPDATE daily_questions 
      SET ${updates.join(', ')}
      WHERE id = ?
    `).bind(...values).run();

    // Delete old cover image if changed
    if (oldCoverImage && oldCoverImage.startsWith('/api/images/')) {
      const imageKey = oldCoverImage.replace('/api/images/', '');
      try {
        const bucket = getBucket(event);
        await bucket.delete(imageKey);
        console.log(`[Questionnaire] Deleted old cover image: ${imageKey}`);
      } catch (e) {
        console.error('[Questionnaire] Failed to delete old cover image:', e);
        // Don't fail the update if image deletion fails
      }
    }

    // Get updated question
    const updated = await db.prepare('SELECT * FROM daily_questions WHERE id = ?')
      .bind(id).first();

    return {
      id: updated.id,
      question: updated.question,
      options: [
        updated.option1,
        updated.option2,
        updated.option3,
        updated.option4
      ].filter(Boolean),
      cover_image: updated.cover_image,
      expires_at: updated.expires_at,
      expires_at_acst: convertUTCToACST(updated.expires_at),
      expires_at_formatted: formatACSTDateTime(updated.expires_at),
      timezone_label: getTimezoneLabel(updated.expires_at),
      created_at: updated.created_at,
      is_active: updated.is_active
    };
  } catch (e: any) {
    console.error('[Questionnaire] Failed to update question:', e);
    if (e.statusCode) throw e;
    throw createError({ statusCode: 500, message: 'Failed to update question', cause: e });
  }
});
