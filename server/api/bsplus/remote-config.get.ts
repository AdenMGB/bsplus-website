import { getDB } from '../../utils/db';
import {
  checkRemoteConfigGetRateLimit,
  createApiEnvelope,
  ensurePublishedSnapshot,
  sendRemoteConfigError,
  validateRemoteConfigQuery,
} from '../../utils/bsplusRemoteConfig';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const validated = validateRemoteConfigQuery(query as Record<string, unknown>);
  if (!validated.ok) {
    return sendRemoteConfigError(event, 422, validated.error, 'VALIDATION_ERROR');
  }

  const db = getDB(event);

  try {
    const rate = await checkRemoteConfigGetRateLimit(db, event);
    if (rate.limited) {
      return sendRemoteConfigError(
        event,
        429,
        'Too many remote-config requests',
        'RATE_LIMITED',
        rate.retryAfterSeconds
      );
    }

    const snapshot = await ensurePublishedSnapshot(db);
    const ifNoneMatch = getHeader(event, 'if-none-match')?.trim();
    if (ifNoneMatch && ifNoneMatch === snapshot.etag) {
      setResponseStatus(event, 304);
      setHeader(event, 'ETag', snapshot.etag);
      setHeader(event, 'Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
      return null;
    }

    setHeader(event, 'ETag', snapshot.etag);
    setHeader(event, 'Cache-Control', 'public, max-age=60, stale-while-revalidate=300');

    return createApiEnvelope(snapshot);
  } catch (e: unknown) {
    console.error('[bsplus/remote-config]', e);
    return sendRemoteConfigError(event, 500, 'Failed to load remote config', 'INTERNAL_ERROR');
  }
});
