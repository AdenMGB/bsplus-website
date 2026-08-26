import { getUserThemesDB } from '../../../utils/userThemesDb';
import { getBucket } from '../../../utils/r2';
import { customThemeR2Key } from '../../../utils/customThemes';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Theme ID required' });
  }

  const db = getUserThemesDB(event);
  const theme = await db
    .prepare(
      "SELECT theme_type, status FROM custom_themes WHERE id = ? AND status = 'approved'"
    )
    .bind(id)
    .first<{ theme_type?: string; status?: string }>();

  if (!theme || theme.theme_type !== 'betterseqta') {
    throw createError({
      statusCode: 404,
      statusMessage: 'Theme not found or not a BetterSEQTA theme'
    });
  }

  const bucket = getBucket(event);
  const key = customThemeR2Key(id, 'theme.json');
  const object = await bucket.get(key);

  if (!object) {
    throw createError({ statusCode: 404, statusMessage: 'Theme file not found' });
  }

  const body = await object.arrayBuffer();
  const json = new TextDecoder().decode(body);
  setHeader(event, 'Cache-Control', 'public, max-age=3600');
  return send(event, json, 'application/json');
});
