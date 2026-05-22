import { getDB } from '../../../../utils/db';
import { getBucket } from '../../../../utils/r2';
import { requireAdmin } from '../../../../utils/auth';
import { createZipArchive } from '../../../../utils/themes';

function zipKeyFromTheme(theme: { zip_download_url?: string | null; id: string }): string {
  const fromUrl = theme.zip_download_url?.replace(/^\/api\/images\//, '');
  return fromUrl || `themes/${theme.id}/theme.zip`;
}

function attachmentFilename(slug: string, id: string): string {
  const base = (slug || id).replace(/[^\w.-]+/g, '-').replace(/^-+|-+$/g, '') || id;
  return `${base}-theme.zip`;
}

async function loadBetterSeqtaFiles(
  bucket: ReturnType<typeof getBucket>,
  theme: {
    id: string;
    slug: string;
    is_pseudo_theme?: number | boolean;
    theme_json_url?: string | null;
  }
): Promise<Map<string, ArrayBuffer>> {
  const files = new Map<string, ArrayBuffer>();
  const isPseudo = Boolean(theme.is_pseudo_theme);

  if (isPseudo && theme.theme_json_url) {
    const res = await fetch(theme.theme_json_url);
    if (!res.ok) {
      throw createError({
        statusCode: 502,
        statusMessage: `Failed to fetch external theme.json (${res.status})`
      });
    }
    files.set('theme.json', await res.arrayBuffer());
  } else {
    const themeJsonObj = await bucket.get(`themes/${theme.id}/theme.json`);
    if (themeJsonObj) {
      files.set('theme.json', await themeJsonObj.arrayBuffer());
    }
  }

  const bannerObj = await bucket.get(`themes/${theme.id}/images/banner.webp`);
  if (bannerObj) {
    files.set('images/banner.webp', await bannerObj.arrayBuffer());
  }

  const marqueeObj = await bucket.get(`themes/${theme.id}/images/marquee.webp`);
  if (marqueeObj) {
    files.set('images/marquee.webp', await marqueeObj.arrayBuffer());
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

  const theme = await db.prepare(
    'SELECT id, slug, theme_type, zip_download_url, is_pseudo_theme, theme_json_url FROM themes WHERE id = ?'
  ).bind(id).first() as {
    id: string;
    slug: string;
    theme_type?: string;
    zip_download_url?: string | null;
    is_pseudo_theme?: number | boolean;
    theme_json_url?: string | null;
  } | undefined;

  if (!theme) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Theme not found'
    });
  }

  const filename = attachmentFilename(theme.slug, theme.id);
  setHeader(event, 'Content-Disposition', `attachment; filename="${filename}"`);

  if (theme.theme_type === 'desqta') {
    const zipKey = zipKeyFromTheme(theme);
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

  const files = await loadBetterSeqtaFiles(bucket, theme);
  if (files.size === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'No theme files found in storage'
    });
  }

  const zipBuffer = await createZipArchive(files, theme.slug);
  setHeader(event, 'Content-Type', 'application/zip');
  return send(event, zipBuffer, 'application/zip');
});
