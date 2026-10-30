import { requireAdmin } from '../../../../utils/auth';
import { getDB } from '../../../../utils/db';
import { getBucket } from '../../../../utils/r2';
import { CUSTOM_THEMES_R2_PREFIX, getCustomThemeById } from '../../../../utils/customThemes';
import { createZipArchive } from '../../../../utils/themes';

function zipKeyFromCustomTheme(theme: { zip_download_url?: string | null; id: string }): string {
  const url = theme.zip_download_url ?? '';
  const fromUrl = url.match(/\/api\/images\/([^?#]+)/)?.[1];
  return fromUrl || `${CUSTOM_THEMES_R2_PREFIX}/${theme.id}/theme.zip`;
}

function attachmentFilename(slug: string, id: string): string {
  const base = (slug || id).replace(/[^\w.-]+/g, '-').replace(/^-+|-+$/g, '') || id;
  return `${base}-theme.zip`;
}

type ThemeFileRow = {
  file_path: string;
  r2_key: string;
  file_type: string;
};

async function loadIndexedThemeFiles(
  bucket: ReturnType<typeof getBucket>,
  rows: ThemeFileRow[]
): Promise<Map<string, ArrayBuffer>> {
  const files = new Map<string, ArrayBuffer>();
  for (const row of rows) {
    if (row.file_type === 'zip') {
      continue;
    }
    const object = await bucket.get(row.r2_key);
    if (object) {
      files.set(row.file_path, await object.arrayBuffer());
    }
  }
  return files;
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const db = getDB(event);
  const bucket = getBucket(event);
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Theme ID is required'
    });
  }

  const theme = (await getCustomThemeById(db, id)) as {
    id: string;
    slug: string;
    theme_type?: string;
    zip_download_url?: string | null;
  } | null;

  if (!theme) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Theme not found'
    });
  }

  const fileRows = (await db
    .prepare(
      'SELECT file_path, r2_key, file_type FROM custom_theme_files WHERE theme_id = ? ORDER BY file_path'
    )
    .bind(id)
    .all()) as { results?: ThemeFileRow[] };

  const rows = fileRows.results ?? [];
  const filename = attachmentFilename(String(theme.slug), theme.id);
  setHeader(event, 'Content-Disposition', `attachment; filename="${filename}"`);

  if (theme.theme_type === 'desqta') {
    const zipRow = rows.find((row) => row.file_type === 'zip');
    const zipKey = zipRow?.r2_key ?? zipKeyFromCustomTheme(theme);
    const object = await bucket.get(zipKey);
    if (!object) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Theme package not found in storage'
      });
    }
    setHeader(event, 'Content-Type', 'application/zip');
    return sendStream(event, object.body);
  }

  const files = await loadIndexedThemeFiles(bucket, rows);
  if (files.size === 0) {
    const themeJsonKey = `${CUSTOM_THEMES_R2_PREFIX}/${theme.id}/theme.json`;
    const themeJsonObj = await bucket.get(themeJsonKey);
    if (themeJsonObj) {
      files.set('theme.json', await themeJsonObj.arrayBuffer());
    }
    for (const [path, key] of [
      ['images/banner.webp', `${CUSTOM_THEMES_R2_PREFIX}/${theme.id}/images/banner.webp`],
      ['images/marquee.webp', `${CUSTOM_THEMES_R2_PREFIX}/${theme.id}/images/marquee.webp`]
    ] as const) {
      const object = await bucket.get(key);
      if (object) {
        files.set(path, await object.arrayBuffer());
      }
    }
  }

  if (files.size === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'No theme files found in storage'
    });
  }

  const zipBuffer = await createZipArchive(files, String(theme.slug));
  setHeader(event, 'Content-Type', 'application/zip');
  return send(event, zipBuffer, 'application/zip');
});
