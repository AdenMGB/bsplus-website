import { getBucket } from '../../../../utils/r2';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const filename = getRouterParam(event, 'filename');
  
  if (!id || !filename) {
    throw createError({ statusCode: 400, message: 'Invalid image path' });
  }

  // Construct the R2 key: themes/{id}/{filename}
  const key = `themes/${id}/${filename}`;

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
