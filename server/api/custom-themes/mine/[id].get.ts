import { requireAuth } from '../../../utils/auth';
import { getUserThemesDB } from '../../../utils/userThemesDb';
import {
  assertThemeOwner,
  createApiEnvelope,
  formatCustomThemeOwner,
  getCustomThemeById
} from '../../../utils/customThemes';

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const db = getUserThemesDB(event);
  const id = getRouterParam(event, 'id');

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

  const files = await db
    .prepare('SELECT id, file_path, file_type, file_size, mime_type, created_at FROM custom_theme_files WHERE theme_id = ?')
    .bind(id)
    .all();

  return createApiEnvelope({
    theme: formatCustomThemeOwner(theme as unknown as Record<string, unknown>),
    files: files.results ?? []
  });
});
