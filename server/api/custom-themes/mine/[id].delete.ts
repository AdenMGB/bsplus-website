import { requireAuth } from '../../../utils/auth';
import { getUserThemesDB } from '../../../utils/userThemesDb';
import {
  assertThemeOwner,
  createApiEnvelope,
  deleteCustomThemeAssets,
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

  await deleteCustomThemeAssets(event, id);
  await db.prepare('DELETE FROM custom_themes WHERE id = ?').bind(id).run();

  return createApiEnvelope({
    message: 'Theme deleted successfully',
    id
  });
});
