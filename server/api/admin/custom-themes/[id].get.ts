import { requireAdmin } from '../../../utils/auth';
import { getUserThemesDB } from '../../../utils/userThemesDb';
import {
  createApiEnvelope,
  formatCustomThemeOwner,
  getCustomThemeById
} from '../../../utils/customThemes';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
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

  const files = await db
    .prepare(
      'SELECT id, file_path, file_type, r2_key, file_size, mime_type, checksum, created_at FROM custom_theme_files WHERE theme_id = ?'
    )
    .bind(id)
    .all();

  return createApiEnvelope({
    theme: formatCustomThemeOwner(theme as unknown as Record<string, unknown>),
    files: files.results ?? [],
    submitter: {
      author_id: theme.author_id,
      author: theme.author
    }
  });
});
