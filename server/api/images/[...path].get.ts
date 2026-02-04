import { getBucket } from '../../utils/r2';

export default defineEventHandler(async (event) => {
  // Extract key directly from the path - this works regardless of route matching
  const fullPath = event.path;
  
  // Remove /api/images/ prefix to get the key
  // For /api/images/themes/123/preview.png -> "themes/123/preview.png"
  const key = fullPath.replace(/^\/api\/images\//, '').replace(/^\/api\/images$/, '');
  
  if (!key) {
    throw createError({ statusCode: 400, message: 'Invalid image key' });
  }

  const bucket = getBucket(event);

  const object = await bucket.get(key);

  if (!object) {
    throw createError({ statusCode: 404, message: 'Image not found' });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);

  return sendStream(event, object.body);
});
