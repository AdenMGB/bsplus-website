import { getDB } from '../../../utils/db';
import { requireAdmin } from '../../../utils/auth';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const db = getDB(event);

  const id = getRouterParam(event, 'id');
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'API key id is required' });
  }

  const result = await db
    .prepare(`UPDATE service_api_keys SET revoked_at = unixepoch() WHERE id = ? AND revoked_at IS NULL`)
    .bind(id)
    .run();

  if (!result.meta?.changes) {
    throw createError({ statusCode: 404, statusMessage: 'API key not found or already revoked' });
  }

  return { ok: true, id };
});
