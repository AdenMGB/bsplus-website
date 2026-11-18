import type { H3Event } from 'h3';
import { getBucket } from './r2';
import { getDB } from './db';
import {
  CUSTOM_THEMES_R2_PREFIX,
  customThemeR2Key,
  getCustomThemeById,
  nowUnixSeconds
} from './customThemes';
import { generateUUID, slugify, themeStorageLayout } from './themes';

type ThemeFileRow = {
  file_path: string;
  file_type: string;
  r2_key: string;
  file_size: number;
  mime_type?: string | null;
  checksum?: string | null;
};

export type PromoteCustomThemeOptions = {
  /** Marketplace status; defaults to community status when approved, otherwise pending. */
  marketplaceStatus?: 'approved' | 'pending';
  /** Override marketplace slug (otherwise community slug, uniquified against `themes`). */
  slug?: string;
  adminUserId: string;
};

export type PromoteCustomThemeResult = {
  custom_theme_id: string;
  marketplace_theme_id: string;
  slug: string;
  status: string;
  files_copied: number;
  download_count: number;
  already_promoted?: boolean;
};

function marketplaceR2Key(themeId: string, ...parts: string[]): string {
  return ['themes', themeId, ...parts].join('/');
}

function destKeyFromSource(sourceKey: string, customId: string, marketplaceId: string): string {
  if (sourceKey.startsWith(`${CUSTOM_THEMES_R2_PREFIX}/${customId}/`)) {
    return sourceKey.replace(
      `${CUSTOM_THEMES_R2_PREFIX}/${customId}/`,
      `themes/${marketplaceId}/`
    );
  }
  if (sourceKey.startsWith(`${CUSTOM_THEMES_R2_PREFIX}/${customId}`)) {
    return sourceKey.replace(
      `${CUSTOM_THEMES_R2_PREFIX}/${customId}`,
      `themes/${marketplaceId}`
    );
  }
  const suffix = sourceKey.replace(/^custom-themes\/[^/]+\/?/, '');
  return marketplaceR2Key(marketplaceId, ...suffix.split('/').filter(Boolean));
}

function absoluteImageUrl(siteUrl: string, url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${siteUrl}${url}`;
  return url;
}

function rewriteStoredAssetUrl(
  siteUrl: string,
  url: string | null | undefined,
  customId: string,
  marketplaceId: string
): string | null {
  const absolute = absoluteImageUrl(siteUrl, url ?? null);
  if (!absolute) return null;
  return absolute
    .replaceAll(`custom-themes/${customId}`, `themes/${marketplaceId}`)
    .replaceAll(`/api/custom-themes/${customId}/`, `/api/themes/${marketplaceId}/`);
}

function rewriteScreenshotUrls(
  siteUrl: string,
  raw: string | null | undefined,
  customId: string,
  marketplaceId: string
): string {
  if (!raw) return '[]';
  try {
    const shots = JSON.parse(raw) as unknown;
    if (!Array.isArray(shots)) return '[]';
    const rewritten = shots.map((shot) =>
      typeof shot === 'string'
        ? rewriteStoredAssetUrl(siteUrl, shot, customId, marketplaceId) ?? shot
        : shot
    );
    return JSON.stringify(rewritten);
  } catch {
    return raw;
  }
}

async function copyR2Object(
  bucket: ReturnType<typeof getBucket>,
  sourceKey: string,
  destKey: string
): Promise<boolean> {
  if (sourceKey === destKey) return true;
  const object = await bucket.get(sourceKey);
  if (!object) return false;
  await bucket.put(destKey, object.body, {
    httpMetadata: object.httpMetadata,
    customMetadata: object.customMetadata
  });
  return true;
}

async function ensureUniqueMarketplaceSlug(db: any, baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let suffix = 2;
  while (true) {
    const existing = await db.prepare('SELECT id FROM themes WHERE slug = ?').bind(slug).first();
    if (!existing) return slug;
    slug = `${baseSlug}-${suffix++}`;
  }
}

async function loadCustomThemeFileRows(db: any, customId: string): Promise<ThemeFileRow[]> {
  const { results } = (await db
    .prepare(
      'SELECT file_path, file_type, r2_key, file_size, mime_type, checksum FROM custom_theme_files WHERE theme_id = ? ORDER BY file_path'
    )
    .bind(customId)
    .all()) as { results?: ThemeFileRow[] };
  return results ?? [];
}

function fallbackCustomR2Keys(customId: string): string[] {
  return [
    customThemeR2Key(customId, 'theme.json'),
    customThemeR2Key(customId, 'theme.zip'),
    customThemeR2Key(customId, 'preview.png'),
    customThemeR2Key(customId, 'images', 'banner.webp'),
    customThemeR2Key(customId, 'images', 'marquee.webp'),
    ...Array.from({ length: 8 }, (_, i) => customThemeR2Key(customId, `screenshot${i + 1}.png`))
  ];
}

async function copyCustomAssetsToMarketplace(
  bucket: ReturnType<typeof getBucket>,
  customId: string,
  marketplaceId: string,
  fileRows: ThemeFileRow[]
): Promise<{ copied: number; destKeys: Map<string, string> }> {
  const sourceToDest = new Map<string, string>();
  const addPair = (source: string) => {
    const dest = destKeyFromSource(source, customId, marketplaceId);
    if (!sourceToDest.has(source)) sourceToDest.set(source, dest);
  };

  for (const row of fileRows) {
    addPair(row.r2_key);
  }
  for (const key of fallbackCustomR2Keys(customId)) {
    addPair(key);
  }

  let copied = 0;
  for (const [source, dest] of sourceToDest) {
    const ok = await copyR2Object(bucket, source, dest);
    if (ok) copied += 1;
  }
  return { copied, destKeys: sourceToDest };
}

async function patchBetterSeqtaThemeJsonInR2(
  bucket: ReturnType<typeof getBucket>,
  marketplaceId: string,
  siteUrl: string,
  customId: string
): Promise<{ defaultColour: string | null }> {
  const key = marketplaceR2Key(marketplaceId, 'theme.json');
  const object = await bucket.get(key);
  if (!object) return { defaultColour: null };

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(new TextDecoder().decode(await object.arrayBuffer())) as Record<
      string,
      unknown
    >;
  } catch {
    return { defaultColour: null };
  }

  parsed.id = marketplaceId;

  const rewriteField = (field: string) => {
    const value = parsed[field];
    if (typeof value === 'string') {
      parsed[field] = rewriteStoredAssetUrl(siteUrl, value, customId, marketplaceId) ?? value;
    }
  };
  rewriteField('coverImage');
  if (Array.isArray(parsed.images)) {
    parsed.images = parsed.images.map((img) =>
      typeof img === 'string'
        ? rewriteStoredAssetUrl(siteUrl, img, customId, marketplaceId) ?? img
        : img
    );
  }

  const defaultColour =
    typeof parsed.defaultColour === 'string' && parsed.defaultColour.trim()
      ? parsed.defaultColour.trim()
      : null;

  const body = JSON.stringify(parsed);
  await bucket.put(key, new TextEncoder().encode(body), {
    httpMetadata: { contentType: 'application/json' }
  });
  return { defaultColour };
}

async function insertThemeFileIndex(
  db: any,
  marketplaceId: string,
  customId: string,
  fileRows: ThemeFileRow[],
  destKeys: Map<string, string>
): Promise<void> {
  const now = nowUnixSeconds();
  const seenDest = new Set<string>();

  const rowsToInsert: {
    file_path: string;
    file_type: string;
    r2_key: string;
    file_size: number;
    mime_type: string | null;
    checksum: string | null;
  }[] = [];

  for (const row of fileRows) {
    const dest = destKeys.get(row.r2_key) ?? destKeyFromSource(row.r2_key, customId, marketplaceId);
    if (seenDest.has(dest)) continue;
    seenDest.add(dest);
    rowsToInsert.push({
      file_path: row.file_path,
      file_type: row.file_type,
      r2_key: dest,
      file_size: row.file_size,
      mime_type: row.mime_type ?? null,
      checksum: row.checksum ?? null
    });
  }

  if (rowsToInsert.length === 0) {
    for (const [source, dest] of destKeys) {
      if (seenDest.has(dest)) continue;
      seenDest.add(dest);
      const tail = dest.replace(`themes/${marketplaceId}/`, '');
      rowsToInsert.push({
        file_path: tail,
        file_type: 'asset',
        r2_key: dest,
        file_size: 0,
        mime_type: null,
        checksum: null
      });
      void source;
    }
  }

  for (const row of rowsToInsert) {
    await db
      .prepare(
        `INSERT INTO theme_files (id, theme_id, file_path, file_type, r2_key, file_size, mime_type, checksum, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        generateUUID(),
        marketplaceId,
        row.file_path,
        row.file_type,
        row.r2_key,
        row.file_size,
        row.mime_type,
        row.checksum,
        now
      )
      .run();
  }
}

export async function promoteCustomThemeToMarketplace(
  event: H3Event,
  customThemeId: string,
  options: PromoteCustomThemeOptions
): Promise<PromoteCustomThemeResult> {
  const db = getDB(event);
  const bucket = getBucket(event);
  const config = useRuntimeConfig(event);
  const siteUrl = (config.public?.siteUrl ?? 'https://betterseqta.org').replace(/\/$/, '');

  const custom = await getCustomThemeById(db, customThemeId);
  if (!custom) {
    throw createError({ statusCode: 404, statusMessage: 'Community theme not found' });
  }

  const existingPromotion =
    typeof custom.promoted_marketplace_theme_id === 'string'
      ? custom.promoted_marketplace_theme_id.trim()
      : '';
  if (existingPromotion) {
    const existing = await db
      .prepare('SELECT id, slug, status, download_count FROM themes WHERE id = ?')
      .bind(existingPromotion)
      .first();
    if (existing) {
      return {
        custom_theme_id: customThemeId,
        marketplace_theme_id: String(existing.id),
        slug: String(existing.slug),
        status: String(existing.status),
        files_copied: 0,
        download_count: Number(existing.download_count ?? 0),
        already_promoted: true
      };
    }
  }

  const marketplaceId = String(custom.id);
  const idConflict = (await db
    .prepare('SELECT id, imported_from_custom_theme_id FROM themes WHERE id = ?')
    .bind(marketplaceId)
    .first()) as { id: string; imported_from_custom_theme_id?: string | null } | null;

  if (idConflict && idConflict.imported_from_custom_theme_id !== customThemeId) {
    throw createError({
      statusCode: 409,
      statusMessage: `A marketplace theme with id "${marketplaceId}" already exists`
    });
  }

  const baseSlug = slugify(options.slug?.trim() || String(custom.slug || custom.name || marketplaceId));
  const marketplaceSlug = await ensureUniqueMarketplaceSlug(db, baseSlug);

  const communityStatus = String(custom.status ?? 'pending');
  const marketplaceStatus =
    options.marketplaceStatus ??
    (communityStatus === 'approved' ? 'approved' : 'pending');

  const downloadCount = Number(custom.download_count ?? 0);
  const createdAt = Number(custom.created_at ?? Date.now());
  const updatedAt = nowUnixSeconds();
  const publishedAt =
    marketplaceStatus === 'approved'
      ? Number(custom.published_at ?? updatedAt)
      : null;

  const fileRows = await loadCustomThemeFileRows(db, customThemeId);
  const { copied, destKeys } = await copyCustomAssetsToMarketplace(
    bucket,
    customThemeId,
    marketplaceId,
    fileRows
  );

  const layout = themeStorageLayout('themes', marketplaceId, siteUrl, 'themes');
  const themeType = String(custom.theme_type ?? 'desqta');

  let defaultColour: string | null = null;
  if (themeType === 'betterseqta') {
    const patched = await patchBetterSeqtaThemeJsonInR2(
      bucket,
      marketplaceId,
      siteUrl,
      customThemeId
    );
    defaultColour = patched.defaultColour;
  }

  const coverImageUrl = rewriteStoredAssetUrl(
    siteUrl,
    custom.cover_image_url as string | undefined,
    customThemeId,
    marketplaceId
  );
  const marqueeImageUrl = rewriteStoredAssetUrl(
    siteUrl,
    custom.marquee_image_url as string | undefined,
    customThemeId,
    marketplaceId
  );
  const previewThumbnailUrl = rewriteStoredAssetUrl(
    siteUrl,
    (custom.preview_thumbnail_url as string | undefined) ??
      (custom.cover_image_url as string | undefined),
    customThemeId,
    marketplaceId
  );
  const zipDownloadUrl = rewriteStoredAssetUrl(
    siteUrl,
    custom.zip_download_url as string | undefined,
    customThemeId,
    marketplaceId
  );
  const previewScreenshots = rewriteScreenshotUrls(
    siteUrl,
    custom.preview_screenshots as string | undefined,
    customThemeId,
    marketplaceId
  );
  const themeJsonUrl =
    themeType === 'betterseqta' ? layout.themeJsonUrl : null;

  const tags =
    typeof custom.tags === 'string' ? custom.tags : JSON.stringify(custom.tags ?? []);

  if (idConflict) {
    await db
      .prepare(
        `UPDATE themes SET
          name = ?, slug = ?, version = ?, description = ?, author = ?, author_id = ?, license = ?,
          category = ?, tags = ?, status = ?, download_count = ?,
          preview_thumbnail_url = ?, preview_screenshots = ?,
          zip_download_url = ?, theme_json_url = ?, cover_image_url = ?, marquee_image_url = ?,
          file_size = ?, checksum = ?, compatibility_min = ?, compatibility_max = ?,
          theme_type = ?, default_colour = ?, imported_from_custom_theme_id = ?,
          published_at = ?, updated_at = ?
         WHERE id = ?`
      )
      .bind(
        custom.name,
        marketplaceSlug,
        custom.version,
        custom.description,
        custom.author,
        custom.author_id,
        custom.license ?? 'MIT',
        custom.category ?? null,
        tags,
        marketplaceStatus,
        downloadCount,
        previewThumbnailUrl,
        previewScreenshots,
        zipDownloadUrl,
        themeJsonUrl,
        coverImageUrl,
        marqueeImageUrl,
        custom.file_size ?? null,
        custom.checksum ?? null,
        custom.compatibility_min ?? null,
        custom.compatibility_max ?? null,
        themeType,
        defaultColour,
        customThemeId,
        publishedAt,
        updatedAt,
        marketplaceId
      )
      .run();

    await db.prepare('DELETE FROM theme_files WHERE theme_id = ?').bind(marketplaceId).run();
    await insertThemeFileIndex(db, marketplaceId, customThemeId, fileRows, destKeys);
  } else {
    await db
      .prepare(
        `INSERT INTO themes (
          id, name, slug, version, description, author, author_id, license,
          category, tags, status, download_count,
          preview_thumbnail_url, preview_screenshots, zip_download_url,
          theme_json_url, cover_image_url, marquee_image_url,
          file_size, checksum, compatibility_min, compatibility_max,
          theme_type, default_colour, imported_from_custom_theme_id,
          created_at, updated_at, published_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        marketplaceId,
        custom.name,
        marketplaceSlug,
        custom.version,
        custom.description,
        custom.author,
        custom.author_id,
        custom.license ?? 'MIT',
        custom.category ?? null,
        tags,
        marketplaceStatus,
        downloadCount,
        previewThumbnailUrl,
        previewScreenshots,
        zipDownloadUrl,
        themeJsonUrl,
        coverImageUrl,
        marqueeImageUrl,
        custom.file_size ?? null,
        custom.checksum ?? null,
        custom.compatibility_min ?? null,
        custom.compatibility_max ?? null,
        themeType,
        defaultColour,
        customThemeId,
        createdAt,
        updatedAt,
        publishedAt
      )
      .run();

    await insertThemeFileIndex(db, marketplaceId, customThemeId, fileRows, destKeys);

    const submissionStatus = marketplaceStatus === 'approved' ? 'approved' : 'pending';
    await db
      .prepare(
        `INSERT INTO theme_submissions (id, theme_id, submitted_by, status, created_at)
         VALUES (?, ?, ?, ?, ?)`
      )
      .bind(generateUUID(), marketplaceId, options.adminUserId, submissionStatus, updatedAt)
      .run();
  }

  try {
    await db
      .prepare('UPDATE custom_themes SET promoted_marketplace_theme_id = ?, updated_at = ? WHERE id = ?')
      .bind(marketplaceId, updatedAt, customThemeId)
      .run();
  } catch {
    // Column may be missing until migration 029 is applied; promotion still succeeds.
  }

  return {
    custom_theme_id: customThemeId,
    marketplace_theme_id: marketplaceId,
    slug: marketplaceSlug,
    status: marketplaceStatus,
    files_copied: copied,
    download_count: downloadCount
  };
}