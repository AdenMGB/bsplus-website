import { getDB } from '../../../utils/db';
import {
  buildPublicRemoteThemePackageResponse,
  createApiEnvelope,
  isValidRemoteThemePackageId,
  validateRemoteThemePackageQuery,
} from '../../../utils/bsplusRemoteThemePackages';
import { sendRemoteConfigError } from '../../../utils/bsplusRemoteConfig';

export default defineEventHandler(async (event) => {
  const packageId = getRouterParam(event, 'packageId')?.trim() ?? '';
  if (!isValidRemoteThemePackageId(packageId)) {
    return sendRemoteConfigError(event, 422, 'Invalid packageId', 'VALIDATION_ERROR');
  }

  const query = getQuery(event);
  const validated = validateRemoteThemePackageQuery(query as Record<string, unknown>);
  if (!validated.ok) {
    return sendRemoteConfigError(event, 422, validated.error, 'VALIDATION_ERROR');
  }

  const db = getDB(event);

  try {
    const data = await buildPublicRemoteThemePackageResponse(event, db, packageId);
    if (!data) {
      return sendRemoteConfigError(event, 404, 'Remote theme package not found', 'NOT_FOUND');
    }

    setHeader(event, 'Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
    return createApiEnvelope(data);
  } catch (e: unknown) {
    console.error('[bsplus/remote-theme-packages]', e);
    return sendRemoteConfigError(event, 500, 'Failed to load remote theme package', 'INTERNAL_ERROR');
  }
});
