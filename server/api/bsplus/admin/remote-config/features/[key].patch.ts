import { requireAdmin } from '../../../../../utils/auth';
import { getDB } from '../../../../../utils/db';
import {
  createApiEnvelope,
  isValidFeatureKey,
  upsertFeatureGate,
  validateFeatureInput,
} from '../../../../../utils/bsplusRemoteConfig';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const keyParam = getRouterParam(event, 'key');
  const featureKey = keyParam ? decodeURIComponent(keyParam).trim() : '';
  if (!isValidFeatureKey(featureKey)) {
    throw createError({ statusCode: 422, statusMessage: 'Invalid feature key in path' });
  }

  const body = await readBody<Record<string, unknown>>(event);
  const merged = { ...(body || {}), feature_key: featureKey };
  const validated = validateFeatureInput(merged);
  if (!validated.ok) {
    throw createError({ statusCode: 422, statusMessage: validated.error });
  }

  const db = getDB(event);
  await upsertFeatureGate(db, validated.featureKey, validated.mode, validated.message, merged);

  return createApiEnvelope({
    feature_key: validated.featureKey,
    mode: validated.mode,
    message: validated.message,
    published: false,
  });
});
