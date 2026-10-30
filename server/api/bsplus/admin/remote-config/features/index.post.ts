import { requireAdmin } from '../../../../../utils/auth';
import { getDB } from '../../../../../utils/db';
import {
  createApiEnvelope,
  upsertFeatureGate,
  validateFeatureInput,
} from '../../../../../utils/bsplusRemoteConfig';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const body = await readBody<Record<string, unknown>>(event);
  const validated = validateFeatureInput(body || {});
  if (!validated.ok) {
    throw createError({ statusCode: 422, statusMessage: validated.error });
  }

  const db = getDB(event);
  await upsertFeatureGate(db, validated.featureKey, validated.mode, validated.message);

  return createApiEnvelope({
    feature_key: validated.featureKey,
    mode: validated.mode,
    message: validated.message,
    published: false,
  });
});
