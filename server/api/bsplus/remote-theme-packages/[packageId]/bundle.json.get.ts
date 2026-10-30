import { getDB } from '../../../../utils/db';
import { getBucket } from '../../../../utils/r2';
import {
  isValidRemoteThemePackageId,
  readPackageThemeBytes,
} from '../../../../utils/bsplusRemoteThemePackages';
import { sendRemoteConfigError } from '../../../../utils/bsplusRemoteConfig';

export default defineEventHandler(async (event) => {
  const packageId = getRouterParam(event, 'packageId')?.trim() ?? '';
  if (!isValidRemoteThemePackageId(packageId)) {
    return sendRemoteConfigError(event, 422, 'Invalid packageId', 'VALIDATION_ERROR');
  }

  const db = getDB(event);
  const enabled = await db
    .prepare('SELECT enabled FROM bsplus_remote_theme_packages WHERE package_id = ?')
    .bind(packageId)
    .first<{ enabled: number }>();

  if (!enabled || !enabled.enabled) {
    return sendRemoteConfigError(event, 404, 'Remote theme package not found', 'NOT_FOUND');
  }

  const bucket = getBucket(event);
  const bundle = await readPackageThemeBytes(db, bucket, packageId);
  if (!bundle) {
    return sendRemoteConfigError(event, 404, 'Theme bundle not found', 'NOT_FOUND');
  }

  setHeader(event, 'Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
  return send(event, bundle.bytes, bundle.contentType);
});
