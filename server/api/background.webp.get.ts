import { getBucket } from '../utils/r2';
import {
  CSS_BACKGROUND_PUBLIC_PATH,
  pickRandomEnabledBackground,
} from '../utils/cssBackgrounds';

/**
 * Stable public URL for CSS `background-image: url(...)`.
 * Each request returns a random enabled background (WebP).
 */
export default defineEventHandler(async (event) => {
  const row = await pickRandomEnabledBackground(event);

  if (!row) {
    throw createError({
      statusCode: 404,
      statusMessage: 'No backgrounds configured',
    });
  }

  const bucket = getBucket(event);
  const object = await bucket.get(row.r2_key);

  if (!object) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Background image not found in storage',
    });
  }

  setResponseHeaders(event, {
    'content-type': 'image/webp',
    'cache-control': 'no-store, no-cache, must-revalidate',
    pragma: 'no-cache',
    'x-css-background-id': row.id,
    'x-css-background-path': CSS_BACKGROUND_PUBLIC_PATH,
  });
  setResponseHeader(event, 'etag', object.httpEtag);

  return sendStream(event, object.body);
});
