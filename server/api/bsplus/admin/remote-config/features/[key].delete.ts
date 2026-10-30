import { requireAdmin } from '../../../../../utils/auth';
import { getDB } from '../../../../../utils/db';
import {
  createApiEnvelope,
  deleteFeatureGate,
  isValidFeatureKey,
} from '../../../../../utils/bsplusRemoteConfig';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const keyParam = getRouterParam(event, 'key');
  const featureKey = keyParam ? decodeURIComponent(keyParam).trim() : '';
  if (!isValidFeatureKey(featureKey)) {
    throw createError({ statusCode: 422, statusMessage: 'Invalid feature key in path' });
  }

  const db = getDB(event);
  const deleted = await deleteFeatureGate(db, featureKey);
  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Feature gate not found' });
  }

  return createApiEnvelope({ feature_key: featureKey, deleted: true, published: false });
});
