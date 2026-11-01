import { requireAdmin } from '../../../../../../utils/auth';
import { getDB } from '../../../../../../utils/db';
import { patchOverride } from '../../../../../../utils/bsplusRemoteConfigOverrides';
import { createApiEnvelope } from '../../../../../../utils/customThemes';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const id = getRouterParam(event, 'id');
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Override id is required' });
  }
  const body = await readBody<Record<string, unknown>>(event);
  const db = getDB(event);
  const override = await patchOverride(db, id, body || {});
  return createApiEnvelope({ override, published: false });
});
