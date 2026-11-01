import { requireAdmin } from '../../../../../utils/auth';
import { getDB } from '../../../../../utils/db';
import { createOverride } from '../../../../../utils/bsplusRemoteConfigOverrides';
import { createApiEnvelope } from '../../../../../utils/customThemes';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const body = await readBody<Record<string, unknown>>(event);
  const db = getDB(event);
  const override = await createOverride(db, body || {});
  setResponseStatus(event, 201);
  return createApiEnvelope({ override, published: false });
});
