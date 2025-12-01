import { getBucket } from '../../utils/r2';

export default defineEventHandler(async (event) => {
  const key = event.path.split('/').pop();
  
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

