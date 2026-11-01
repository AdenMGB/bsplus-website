import { requireAdmin } from '../../../../../utils/auth';
import { getDB } from '../../../../../utils/db';
import { deleteOverride } from '../../../../../utils/bsplusRemoteConfigOverrides';
import { createApiEnvelope } from '../../../../../utils/customThemes';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const id = getRouterParam(event, 'id');
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Override id is required' });
  }
  const db = getDB(event);
  const deleted = await deleteOverride(db, id);
  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Override not found' });
  }
  return createApiEnvelope({ deleted: true, published: false });
});
