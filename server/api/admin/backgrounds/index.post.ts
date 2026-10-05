import { requireAdmin } from '../../../utils/auth';
import {
  insertCssBackground,
  mapCssBackgroundForAdmin,
  prepareBackgroundWebpBytes,
} from '../../../utils/cssBackgrounds';

function parseDimensionPart(part: { data: Buffer | Uint8Array } | undefined): number | undefined {
  if (!part?.data?.length) return undefined;
  const value = Number.parseInt(Buffer.from(part.data).toString('utf8'), 10);
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

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

  const width = parseDimensionPart(formData.find((part) => part.name === 'width'));
  const height = parseDimensionPart(formData.find((part) => part.name === 'height'));

  const input = new Uint8Array(file.data);
  let bytes: Uint8Array;
  let outWidth: number;
  let outHeight: number;

  try {
    ({ bytes, width: outWidth, height: outHeight } = await prepareBackgroundWebpBytes(input, {
      width,
      height,
    }));
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Image conversion failed';
    throw createError({ statusCode: 400, statusMessage: message });
  }

  const row = await insertCssBackground(event, {
    originalFilename: file.filename ?? null,
    webpBytes: bytes,
    width: outWidth > 0 ? outWidth : (width ?? null),
    height: outHeight > 0 ? outHeight : (height ?? null),
    createdBy: admin.id,
  });

  return {
    success: true,
    data: { background: mapCssBackgroundForAdmin(row) },
    error: null,
    meta: { timestamp: Date.now() },
  };
});
