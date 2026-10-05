import { requireAdmin } from '../../../utils/auth';
import {
  insertCssBackground,
  mapCssBackgroundForAdmin,
  prepareBackgroundWebpBytes,
} from '../../../utils/cssBackgrounds';

interface FileMetaEntry {
  width?: number;
  height?: number;
  originalName?: string;
}

function parseDimensionPart(part: { data: Buffer | Uint8Array } | undefined): number | undefined {
  if (!part?.data?.length) return undefined;
  const value = Number.parseInt(Buffer.from(part.data).toString('utf8'), 10);
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

function parseFilesMeta(formData: NonNullable<Awaited<ReturnType<typeof readMultipartFormData>>>): FileMetaEntry[] {
  const metaPart = formData.find((part) => part.name === 'files_meta');
  if (!metaPart?.data?.length) return [];

  try {
    const parsed = JSON.parse(Buffer.from(metaPart.data).toString('utf8'));
    if (!Array.isArray(parsed)) return [];
    return parsed.map((entry) => ({
      width:
        typeof entry?.width === 'number' && entry.width > 0 ? Math.round(entry.width) : undefined,
      height:
        typeof entry?.height === 'number' && entry.height > 0 ? Math.round(entry.height) : undefined,
      originalName: typeof entry?.originalName === 'string' ? entry.originalName : undefined,
    }));
  } catch {
    return [];
  }
}

function isImagePart(part: { type?: string; filename?: string; data?: Buffer | Uint8Array }): boolean {
  if (!part.filename || !part.data?.byteLength) return false;
  return part.type?.startsWith('image/') ?? true;
}

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event);

  const formData = await readMultipartFormData(event);
  if (!formData?.length) {
    throw createError({ statusCode: 400, statusMessage: 'No file uploaded' });
  }

  const fileParts = formData.filter((part) => part.name === 'file' && isImagePart(part));

  if (!fileParts.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No valid image files in upload',
    });
  }

  const metaEntries = parseFilesMeta(formData);
  const legacyWidth = parseDimensionPart(formData.find((part) => part.name === 'width'));
  const legacyHeight = parseDimensionPart(formData.find((part) => part.name === 'height'));

  const backgrounds: ReturnType<typeof mapCssBackgroundForAdmin>[] = [];
  const failed: { filename: string; message: string }[] = [];

  for (let index = 0; index < fileParts.length; index++) {
    const file = fileParts[index];
    const meta = metaEntries[index] ?? {};
    const width = meta.width ?? (fileParts.length === 1 ? legacyWidth : undefined);
    const height = meta.height ?? (fileParts.length === 1 ? legacyHeight : undefined);
    const originalFilename = meta.originalName ?? file.filename ?? null;

    try {
      const input = new Uint8Array(file.data);
      const { bytes, width: outWidth, height: outHeight } = prepareBackgroundWebpBytes(input, {
        width,
        height,
      });

      const row = await insertCssBackground(event, {
        originalFilename,
        webpBytes: bytes,
        width: outWidth > 0 ? outWidth : (width ?? null),
        height: outHeight > 0 ? outHeight : (height ?? null),
        createdBy: admin.id,
      });

      backgrounds.push(mapCssBackgroundForAdmin(row));
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'statusCode' in error) {
        const h3Error = error as { statusMessage?: string; message?: string };
        failed.push({
          filename: file.filename ?? `file-${index + 1}`,
          message: h3Error.statusMessage ?? h3Error.message ?? 'Upload failed',
        });
        continue;
      }
      failed.push({
        filename: file.filename ?? `file-${index + 1}`,
        message: error instanceof Error ? error.message : 'Upload failed',
      });
    }
  }

  if (!backgrounds.length) {
    throw createError({
      statusCode: 400,
      statusMessage: failed[0]?.message ?? 'All uploads failed',
      data: { failed },
    });
  }

  return {
    success: true,
    data: {
      backgrounds,
      background: backgrounds.length === 1 ? backgrounds[0] : undefined,
      failed: failed.length ? failed : undefined,
    },
    error: null,
    meta: { timestamp: Date.now() },
  };
});
