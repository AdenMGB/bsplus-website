import { requireAuth } from '../../../utils/auth';
import { getUserThemesDB } from '../../../utils/userThemesDb';
import {
  assertEditableStatus,
  assertThemeOwner,
  createApiEnvelope,
  formatCustomThemeOwner,
  getCustomThemeById,
  nowUnixSeconds
} from '../../../utils/customThemes';

interface UpdateBody {
  name?: string;
  description?: string;
  submission_notes?: string;
}

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const db = getUserThemesDB(event);
  const id = getRouterParam(event, 'id');
  const body = await readBody<UpdateBody>(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Theme ID is required'
    });
  }

  const theme = await getCustomThemeById(db, id);
  if (!theme) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Theme not found'
    });
  }

  assertThemeOwner(theme, user.id);
  assertEditableStatus(theme.status);

  const updates: string[] = [];
  const values: unknown[] = [];

  if (body.name !== undefined) {
    updates.push('name = ?');
    values.push(body.name.trim());
  }
  if (body.description !== undefined) {
    updates.push('description = ?');
    values.push(body.description.trim());
  }
  if (body.submission_notes !== undefined) {
    updates.push('submission_notes = ?');
    values.push(body.submission_notes.trim() || null);
  }

  if (updates.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'At least one field is required'
    });
  }

  updates.push('updated_at = ?');
  values.push(nowUnixSeconds());
  values.push(id);

  await db
    .prepare(`UPDATE custom_themes SET ${updates.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run();

  const updated = await getCustomThemeById(db, id);

  return createApiEnvelope({
    theme: formatCustomThemeOwner(updated as unknown as Record<string, unknown>)
  });
});
