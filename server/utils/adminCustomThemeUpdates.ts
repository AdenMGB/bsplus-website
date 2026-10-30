import type { H3Event } from 'h3';
import { getDB } from './db';
import { getBucket } from './r2';
import {
  CUSTOM_THEMES_R2_PREFIX,
  createApiEnvelope,
  ensureUniqueSlug,
  formatCustomThemeOwner,
  getCustomThemeById,
  nowUnixSeconds,
  replaceCustomThemeFileIndex
} from './customThemes';
import {
  parseManifest,
  parseBetterSeqtaTheme,
  validateThemeStructure,
  validateBetterSeqtaStructure,
  inferCategory,
  slugify,
  extractZipToMap,
  mergeThemeFileMaps,
  uploadDesqtaThemeAssets,
  themeStorageLayout,
  type ThemeFileIndexEntry
} from './themes';

function findThemeJsonPath(files: Map<string, ArrayBuffer>): string | null {
  const keys = Array.from(files.keys());
  return keys.find((k) => k === 'theme.json' || k.endsWith('/theme.json')) ?? null;
}

function findBannerEntry(files: Map<string, ArrayBuffer>) {
  return Array.from(files.entries()).find(([p]) =>
    p.includes('images/banner.webp') || p.endsWith('banner.webp')
  );
}

function findMarqueeEntry(files: Map<string, ArrayBuffer>) {
  return Array.from(files.entries()).find(([p]) =>
    p.includes('images/marquee.webp') || p.endsWith('marquee.webp')
  );
}

function imagePublicUrl(siteUrl: string, r2Key: string): string {
  return `${siteUrl}/api/images/${r2Key}`;
}

function zipR2KeyFromTheme(theme: { zip_download_url?: string | null; id: string }): string {
  const url = theme.zip_download_url ?? '';
  const fromUrl = url.match(/\/api\/images\/([^?#]+)/)?.[1];
  return fromUrl || `${CUSTOM_THEMES_R2_PREFIX}/${theme.id}/theme.zip`;
}

async function mergeCustomThemeFileIndex(
  db: ReturnType<typeof getDB>,
  themeId: string,
  patch: ThemeFileIndexEntry[]
) {
  const rows = (await db
    .prepare(
      'SELECT file_path, file_type, r2_key, file_size, mime_type, checksum FROM custom_theme_files WHERE theme_id = ?'
    )
    .bind(themeId)
    .all()) as {
    results?: Array<{
      file_path: string;
      file_type: string;
      r2_key: string;
      file_size: number;
      mime_type?: string | null;
      checksum?: string | null;
    }>;
  };

  const byPath = new Map<string, ThemeFileIndexEntry>();
  for (const row of rows.results ?? []) {
    byPath.set(row.file_path, {
      path: row.file_path,
      key: row.r2_key,
      fileType: row.file_type,
      size: row.file_size,
      mimeType: row.mime_type ?? undefined,
      checksum: row.checksum ?? undefined
    });
  }
  for (const entry of patch) {
    byPath.set(entry.path, entry);
  }
  await replaceCustomThemeFileIndex(db, themeId, Array.from(byPath.values()));
}

export interface AdminUpdateCustomThemeBody {
  name?: string;
  slug?: string;
  description?: string;
  author?: string;
  license?: string;
  version?: string;
  category?: string | null;
  tags?: string[];
  compatibility_min?: string | null;
  compatibility_max?: string | null;
  submission_notes?: string | null;
}

export async function adminUpdateCustomThemeMetadata(
  event: H3Event,
  id: string,
  body: AdminUpdateCustomThemeBody
) {
  const db = getDB(event);
  const existing = await getCustomThemeById(db, id);
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Theme not found' });
  }

  const updates: string[] = [];
  const params: unknown[] = [];

  if (body.name !== undefined) {
    updates.push('name = ?');
    params.push(body.name.trim());
  }
  if (body.slug !== undefined) {
    const nextSlug = slugify(body.slug.trim());
    if (!nextSlug) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid slug' });
    }
    const slugTaken = await db
      .prepare('SELECT id FROM custom_themes WHERE slug = ? AND id != ?')
      .bind(nextSlug, id)
      .first();
    if (slugTaken) {
      throw createError({
        statusCode: 409,
        statusMessage: `Slug "${nextSlug}" is already in use`
      });
    }
    updates.push('slug = ?');
    params.push(nextSlug);
  }
  if (body.description !== undefined) {
    updates.push('description = ?');
    params.push(body.description.trim());
  }
  if (body.author !== undefined) {
    updates.push('author = ?');
    params.push(body.author.trim());
  }
  if (body.license !== undefined) {
    updates.push('license = ?');
    params.push(body.license.trim() || 'MIT');
  }
  if (body.version !== undefined) {
    updates.push('version = ?');
    params.push(body.version.trim());
  }
  if (body.category !== undefined) {
    updates.push('category = ?');
    params.push(body.category);
  }
  if (body.tags !== undefined) {
    updates.push('tags = ?');
    params.push(JSON.stringify(body.tags));
  }
  if (body.compatibility_min !== undefined) {
    const min = typeof body.compatibility_min === 'string' ? body.compatibility_min.trim() : '';
    updates.push('compatibility_min = ?');
    params.push(min || '0.0.0');
  }
  if (body.compatibility_max !== undefined) {
    const max =
      typeof body.compatibility_max === 'string' && body.compatibility_max.trim()
        ? body.compatibility_max.trim()
        : null;
    updates.push('compatibility_max = ?');
    params.push(max);
  }
  if (body.submission_notes !== undefined) {
    updates.push('submission_notes = ?');
    params.push(body.submission_notes?.trim() || null);
  }

  if (updates.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'At least one field is required'
    });
  }

  updates.push('updated_at = ?');
  params.push(nowUnixSeconds());
  params.push(id);

  await db.prepare(`UPDATE custom_themes SET ${updates.join(', ')} WHERE id = ?`).bind(...params).run();

  const theme = await getCustomThemeById(db, id);
  return createApiEnvelope({
    theme: formatCustomThemeOwner(theme as unknown as Record<string, unknown>)
  });
}

export async function adminUpdateCustomThemeFiles(event: H3Event, id: string) {
  const db = getDB(event);
  const bucket = getBucket(event);
  const config = useRuntimeConfig(event);
  const siteUrl = (config.public?.siteUrl ?? 'https://betterseqta.org').replace(/\/$/, '');

  const existingTheme = (await getCustomThemeById(db, id)) as Record<string, unknown> | null;
  if (!existingTheme) {
    throw createError({ statusCode: 404, statusMessage: 'Theme not found' });
  }

  const formData = await readMultipartFormData(event);
  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No files uploaded' });
  }

  let zipFile: { filename?: string; data: Uint8Array } | null = null;
  const looseFiles = new Map<string, ArrayBuffer>();

  for (const part of formData) {
    if (part.name === 'theme_zip' && part.filename) {
      zipFile = part;
    } else if (part.name === 'theme_folder' && part.filename?.endsWith('.zip')) {
      zipFile = part;
    } else if (part.filename) {
      const path = part.name || part.filename;
      looseFiles.set(path, new Uint8Array(part.data).buffer);
    }
  }

  const themeFiles = new Map<string, ArrayBuffer>();
  if (zipFile) {
    try {
      const extracted = await extractZipToMap(new Uint8Array(zipFile.data).buffer);
      for (const [k, v] of extracted) themeFiles.set(k, v);
    } catch (error: unknown) {
      throw createError({
        statusCode: 400,
        statusMessage: `Failed to extract ZIP: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }
  for (const [k, v] of looseFiles) {
    themeFiles.set(k, v);
  }

  if (themeFiles.size === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ZIP file or at least one file is required'
    });
  }

  const layout = themeStorageLayout('custom-themes', id, siteUrl, 'custom-themes');
  const now = nowUnixSeconds();

  if (existingTheme.theme_type === 'betterseqta') {
    const themeJsonPath = findThemeJsonPath(themeFiles);
    const bannerEntry = findBannerEntry(themeFiles);
    const marqueeEntry = findMarqueeEntry(themeFiles);

    if (!themeJsonPath) {
      if (!bannerEntry && !marqueeEntry) {
        return {
          success: false,
          data: null,
          error: {
            code: 'INVALID_THEME_STRUCTURE',
            message:
              'BetterSEQTA update requires theme.json and/or banner/marquee webp images (e.g. images/banner.webp).'
          },
          meta: { timestamp: Date.now(), version: '1.0.0' }
        };
      }

      const patch: ThemeFileIndexEntry[] = [];
      let coverImageUrl = existingTheme.cover_image_url as string | null;
      let marqueeImageUrl = existingTheme.marquee_image_url as string | null;

      if (bannerEntry) {
        const bannerKey = `${layout.r2BaseKey}/images/banner.webp`;
        await bucket.put(bannerKey, bannerEntry[1], {
          httpMetadata: { contentType: 'image/webp' }
        });
        coverImageUrl = imagePublicUrl(siteUrl, bannerKey);
        patch.push({
          path: 'images/banner.webp',
          key: bannerKey,
          fileType: 'cover',
          size: bannerEntry[1].byteLength,
          mimeType: 'image/webp'
        });
      }
      if (marqueeEntry) {
        const marqueeKey = `${layout.r2BaseKey}/images/marquee.webp`;
        await bucket.put(marqueeKey, marqueeEntry[1], {
          httpMetadata: { contentType: 'image/webp' }
        });
        marqueeImageUrl = imagePublicUrl(siteUrl, marqueeKey);
        patch.push({
          path: 'images/marquee.webp',
          key: marqueeKey,
          fileType: 'marquee',
          size: marqueeEntry[1].byteLength,
          mimeType: 'image/webp'
        });
      }

      await db
        .prepare(
          `UPDATE custom_themes SET cover_image_url = ?, marquee_image_url = ?, updated_at = ? WHERE id = ?`
        )
        .bind(coverImageUrl, marqueeImageUrl, now, id)
        .run();

      if (patch.length > 0) {
        await mergeCustomThemeFileIndex(db, id, patch);
      }

      const theme = await getCustomThemeById(db, id);
      return createApiEnvelope({
        theme: formatCustomThemeOwner(theme as unknown as Record<string, unknown>),
        validation: { valid: true, warnings: [], errors: [] }
      });
    }

    const validation = validateBetterSeqtaStructure(themeFiles);
    if (!validation.valid) {
      return {
        success: false,
        data: null,
        error: {
          code: 'INVALID_THEME_STRUCTURE',
          message: 'BetterSEQTA theme validation failed',
          details: { errors: validation.errors, warnings: validation.warnings }
        },
        meta: { timestamp: Date.now(), version: '1.0.0' }
      };
    }

    const themeJsonContent = new TextDecoder().decode(themeFiles.get(themeJsonPath)!);
    const bsTheme = await parseBetterSeqtaTheme(themeJsonContent);

    if (bsTheme.id !== id) {
      return {
        success: false,
        data: null,
        error: {
          code: 'THEME_ID_MISMATCH',
          message: `Theme ID in theme.json (${bsTheme.id}) does not match this theme (${id}).`
        },
        meta: { timestamp: Date.now(), version: '1.0.0' }
      };
    }

    const themeJsonKey = `${layout.r2BaseKey}/theme.json`;
    await bucket.put(themeJsonKey, new TextEncoder().encode(themeJsonContent), {
      httpMetadata: { contentType: 'application/json' }
    });

    const indexEntries: ThemeFileIndexEntry[] = [
      {
        path: 'theme.json',
        key: themeJsonKey,
        fileType: 'theme_json',
        size: themeJsonContent.length,
        mimeType: 'application/json'
      }
    ];

    let coverImageUrl = existingTheme.cover_image_url as string | null;
    let marqueeImageUrl = existingTheme.marquee_image_url as string | null;

    if (bannerEntry) {
      const bannerKey = `${layout.r2BaseKey}/images/banner.webp`;
      await bucket.put(bannerKey, bannerEntry[1], {
        httpMetadata: { contentType: 'image/webp' }
      });
      coverImageUrl = imagePublicUrl(siteUrl, bannerKey);
      indexEntries.push({
        path: 'images/banner.webp',
        key: bannerKey,
        fileType: 'cover',
        size: bannerEntry[1].byteLength,
        mimeType: 'image/webp'
      });
    }
    if (marqueeEntry) {
      const marqueeKey = `${layout.r2BaseKey}/images/marquee.webp`;
      await bucket.put(marqueeKey, marqueeEntry[1], {
        httpMetadata: { contentType: 'image/webp' }
      });
      marqueeImageUrl = imagePublicUrl(siteUrl, marqueeKey);
      indexEntries.push({
        path: 'images/marquee.webp',
        key: marqueeKey,
        fileType: 'marquee',
        size: marqueeEntry[1].byteLength,
        mimeType: 'image/webp'
      });
    }

    const nextSlug = await ensureUniqueSlug(db, slugify(bsTheme.name), id);

    await db
      .prepare(
        `UPDATE custom_themes SET
          name = ?, slug = ?, description = ?,
          cover_image_url = ?, marquee_image_url = ?,
          updated_at = ?
         WHERE id = ?`
      )
      .bind(bsTheme.name, nextSlug, bsTheme.description, coverImageUrl, marqueeImageUrl, now, id)
      .run();

    await mergeCustomThemeFileIndex(db, id, indexEntries);

    const theme = await getCustomThemeById(db, id);
    return createApiEnvelope({
      theme: formatCustomThemeOwner(theme as unknown as Record<string, unknown>),
      validation: { valid: true, warnings: validation.warnings, errors: [] }
    });
  }

  // DesQTA
  let mergedFiles = themeFiles;
  let validation = validateThemeStructure(mergedFiles);

  if (!validation.valid) {
    const zipKey = zipR2KeyFromTheme(existingTheme as { zip_download_url?: string | null; id: string });
    const existingObj = await bucket.get(zipKey);
    if (!existingObj) {
      return {
        success: false,
        data: null,
        error: {
          code: 'INVALID_THEME_STRUCTURE',
          message: 'Theme validation failed and no existing theme package was found to merge with.',
          details: { errors: validation.errors, warnings: validation.warnings }
        },
        meta: { timestamp: Date.now(), version: '1.0.0' }
      };
    }
    const baseMap = await extractZipToMap(await existingObj.arrayBuffer());
    mergedFiles = mergeThemeFileMaps(baseMap, themeFiles, String(existingTheme.slug));
    validation = validateThemeStructure(mergedFiles);
  }

  if (!validation.valid) {
    return {
      success: false,
      data: null,
      error: {
        code: 'INVALID_THEME_STRUCTURE',
        message: 'Theme validation failed',
        details: { errors: validation.errors, warnings: validation.warnings }
      },
      meta: { timestamp: Date.now(), version: '1.0.0' }
    };
  }

  const manifestEntry = Array.from(mergedFiles.entries()).find(([path]) =>
    path.endsWith('theme-manifest.json')
  );
  if (!manifestEntry) {
    throw createError({ statusCode: 400, statusMessage: 'theme-manifest.json not found' });
  }

  const manifest = await parseManifest(new TextDecoder().decode(manifestEntry[1]));
  const themeSlug = String(existingTheme.slug);
  const assets = await uploadDesqtaThemeAssets(bucket, id, themeSlug, mergedFiles, layout);

  await db
    .prepare(
      `UPDATE custom_themes SET
        name = ?, slug = ?, version = ?, description = ?, author = ?,
        license = ?, category = ?, tags = ?,
        preview_thumbnail_url = ?, preview_screenshots = ?,
        zip_download_url = ?, file_size = ?, checksum = ?,
        compatibility_min = ?, compatibility_max = ?,
        updated_at = ?
       WHERE id = ?`
    )
    .bind(
      manifest.name,
      await ensureUniqueSlug(db, slugify(manifest.name), id),
      manifest.version,
      manifest.description,
      manifest.author,
      manifest.license || 'MIT',
      manifest.category || inferCategory(manifest),
      JSON.stringify(manifest.tags || []),
      assets.previewUrl,
      JSON.stringify(assets.screenshotUrls),
      assets.zipUrl,
      assets.zipSize,
      `sha256:${assets.zipChecksum}`,
      manifest.compatibility.minVersion,
      manifest.compatibility.maxVersion || null,
      now,
      id
    )
    .run();

  await replaceCustomThemeFileIndex(db, id, assets.r2Keys);

  const theme = await getCustomThemeById(db, id);
  return createApiEnvelope({
    theme: formatCustomThemeOwner(theme as unknown as Record<string, unknown>),
    validation: { valid: true, warnings: validation.warnings, errors: [] }
  });
}
