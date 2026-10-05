import { requireAdmin } from '../../../utils/auth';
import {
  encodeImageToWebp,
  insertCssBackground,
  mapCssBackgroundForAdmin,
} from '../../../utils/cssBackgrounds';

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event);

  const formData = await readMultipartFormData(event);
  if (!formData?.length) {
    throw createError({ statusCode: 400, statusMessage: 'No file uploaded' });
  }

  const file = formData.find((part) => part.name === 'file') ?? formData[0];

  if (!file?.data?.byteLength) {
    throw createError({ statusCode: 400, statusMessage: 'Empty upload' });
  }

  if (!file.type?.startsWith('image/')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Only image uploads are supported',
    });
  }

  const input = new Uint8Array(file.data);
  const { bytes, width, height } = await encodeImageToWebp(input);

  const row = await insertCssBackground(event, {
    originalFilename: file.filename ?? null,
    webpBytes: bytes,
    width,
    height,
    createdBy: admin.id,
  });

  return {
    success: true,
    data: { background: mapCssBackgroundForAdmin(row) },
    error: null,
    meta: { timestamp: Date.now() },
  };
});
