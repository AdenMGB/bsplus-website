import { getDB } from '../../../utils/db';
import { getBucket } from '../../../utils/r2';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) {
    throw createError({ statusCode: 400, message: 'Theme ID required' });
  }

  const db = getDB(event);
  const theme = await db.prepare(
    'SELECT theme_type, theme_json_url FROM themes WHERE id = ?'
  ).bind(id).first() as { theme_type?: string; theme_json_url?: string } | undefined;

  if (!theme || theme.theme_type !== 'betterseqta') {
    throw createError({ statusCode: 404, message: 'Theme not found or not a BetterSEQTA theme' });
  }

  const bucket = getBucket(event);
  const key = `themes/${id}/theme.json`;
  const object = await bucket.get(key);

  if (!object) {
    throw createError({ statusCode: 404, message: 'Theme file not found' });
  }

  const body = await object.arrayBuffer();
  setHeader(event, 'Content-Type', 'application/json');
  setHeader(event, 'Cache-Control', 'public, max-age=3600');
  return body;
});
