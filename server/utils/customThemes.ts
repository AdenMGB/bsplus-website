import type { H3Event } from 'h3';
import type { UserInfo } from './auth';
import { getBucket } from './r2';
import { getUserThemesDB } from './userThemesDb';
import {
  parseManifest,
  validateThemeStructure,
  validateBetterSeqtaStructure,
  parseBetterSeqtaTheme,
  detectThemeType,
  slugify,
  generateUUID,
  calculateSHA256,
  inferCategory,
  createZipArchive,
  extractZipToMap
} from './themes';

export const CUSTOM_THEMES_R2_PREFIX = 'custom-themes';
export const MAX_PENDING_PER_USER = 5;
export const MAX_UPLOADS_PER_24H = 10;
export const SECONDS_PER_DAY = 86400;

export type CustomThemeStatus = 'pending' | 'approved' | 'rejected';
export type CustomThemeType = 'betterseqta' | 'desqta';

export interface CustomThemeRow {
  id: string;
  name: string;
  slug: string;
  version: string;
  description: string;
  author: string;
  author_id: string;
  license: string;
  category: string | null;
  tags: string | null;
  status: CustomThemeStatus;
  theme_type: CustomThemeType;
  download_count: number;
  preview_thumbnail_url: string | null;
  preview_screenshots: string | null;
  zip_download_url: string | null;
  theme_json_url: string | null;
  cover_image_url: string | null;
  marquee_image_url: string | null;
  file_size: number | null;
  checksum: string | null;
  compatibility_min: string | null;
  compatibility_max: string | null;
  submission_notes: string | null;
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: number | null;
  created_at: number;
  updated_at: number;
  published_at: number | null;
}

export function nowUnixSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

export function createApiEnvelope<T>(data: T) {
  return {
    success: true as const,
    data,
    error: null,
    meta: {
      timestamp: Date.now(),
      version: '1.0.0'
    }
  };
}

export function createApiError(
  code: string,
  message: string,
  details?: Record<string, unknown>
) {
  return {
    success: false as const,
    data: null,
    error: { code, message, ...(details ? { details } : {}) },
    meta: {
      timestamp: Date.now(),
      version: '1.0.0'
    }
  };
}

export function getSiteUrl(event: H3Event): string {
  const config = useRuntimeConfig(event);
  return (config.public?.siteUrl ?? 'https://betterseqta.org').replace(/\/$/, '');
}

export function customThemeR2Key(themeId: string, ...parts: string[]): string {
  return [CUSTOM_THEMES_R2_PREFIX, themeId, ...parts].join('/');
}

export function assertThemeOwner(theme: CustomThemeRow, userId: string): void {
  if (theme.author_id !== userId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden - you do not own this theme'
    });
  }
}

export function assertEditableStatus(status: CustomThemeStatus): void {
  if (status === 'approved') {
    throw createError({
      statusCode: 409,
      statusMessage: 'Approved themes cannot be edited. Delete and re-submit instead.'
    });
  }
}

export async function ensureUniqueSlug(
  db: any,
  baseSlug: string,
  excludeId?: string
): Promise<string> {
  let slug = baseSlug;
  let suffix = 2;
  while (true) {
    const existing = await db
      .prepare(
        excludeId
          ? 'SELECT id FROM custom_themes WHERE slug = ? AND id != ?'
          : 'SELECT id FROM custom_themes WHERE slug = ?'
      )
      .bind(...(excludeId ? [slug, excludeId] : [slug]))
      .first();
    if (!existing) return slug;
    slug = `${baseSlug}-${suffix}`;
    suffix++;
  }
}

export async function checkUploadRateLimits(db: any, authorId: string): Promise<void> {
  const pending = await db
    .prepare(
      "SELECT COUNT(*) as count FROM custom_themes WHERE author_id = ? AND status = 'pending'"
    )
    .bind(authorId)
    .first<{ count: number }>();

  if ((pending?.count ?? 0) >= MAX_PENDING_PER_USER) {
    throw createError({
      statusCode: 429,
      statusMessage: `You may have at most ${MAX_PENDING_PER_USER} pending submissions`
    });
  }

  const cutoff = nowUnixSeconds() - SECONDS_PER_DAY;
  const recent = await db
    .prepare(
      'SELECT COUNT(*) as count FROM custom_theme_upload_log WHERE author_id = ? AND created_at >= ?'
    )
    .bind(authorId, cutoff)
    .first<{ count: number }>();

  if ((recent?.count ?? 0) >= MAX_UPLOADS_PER_24H) {
    throw createError({
      statusCode: 429,
      statusMessage: `Upload limit reached (${MAX_UPLOADS_PER_24H} per 24 hours)`
    });
  }
}

export async function logThemeUpload(
  db: any,
  authorId: string,
  themeId: string
): Promise<void> {
  await db
    .prepare(
      'INSERT INTO custom_theme_upload_log (id, author_id, theme_id, created_at) VALUES (?, ?, ?, ?)'
    )
    .bind(generateUUID(), authorId, themeId, nowUnixSeconds())
    .run();
}

export async function parseMultipartThemeFiles(
  event: H3Event
): Promise<{ themeFiles: Map<string, ArrayBuffer>; submissionNotes?: string }> {
  const formData = await readMultipartFormData(event);
  if (!formData || formData.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No files uploaded'
    });
  }

  const getMultipartText = (name: string): string | undefined => {
    const part = formData.find((p) => p.name === name && !p.filename);
    if (!part?.data) return undefined;
    return new TextDecoder().decode(part.data).trim();
  };

  const submissionNotes = getMultipartText('submission_notes');

  let zipFile: { filename?: string; data: Uint8Array } | null = null;
  const themeFiles = new Map<string, ArrayBuffer>();

  for (const part of formData) {
    if (
      (part.name === 'theme_zip' || part.name === 'theme_folder') &&
      part.filename?.endsWith('.zip')
    ) {
      zipFile = part;
    } else if (part.filename) {
      const path = part.name || part.filename;
      themeFiles.set(path, new Uint8Array(part.data).buffer);
    }
  }

  if (zipFile) {
    try {
      const extracted = await extractZipToMap(new Uint8Array(zipFile.data).buffer);
      for (const [path, data] of extracted) {
        themeFiles.set(path, data);
      }
    } catch (error: unknown) {
      throw createError({
        statusCode: 400,
        statusMessage: `Failed to extract ZIP: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  if (themeFiles.size === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No theme files found in upload'
    });
  }

  return { themeFiles, submissionNotes };
}

export function formatCustomThemePublic(theme: Record<string, unknown>) {
  const themeType = (theme.theme_type as string) || 'desqta';

  const base = {
    id: theme.id,
    name: theme.name,
    slug: theme.slug,
    version: theme.version,
    description: theme.description,
    author: theme.author,
    license: theme.license,
    category: theme.category,
    tags: theme.tags ? JSON.parse(theme.tags as string) : [],
    theme_type: themeType,
    download_count: theme.download_count ?? 0,
    preview: {
      thumbnail: (theme.preview_thumbnail_url as string) || (theme.cover_image_url as string),
      screenshots: theme.preview_screenshots
        ? JSON.parse(theme.preview_screenshots as string)
        : []
    },
    compatibility: {
      min: theme.compatibility_min,
      max: theme.compatibility_max || undefined
    },
    created_at: theme.created_at,
    updated_at: theme.updated_at,
    published_at: theme.published_at
  };

  if (themeType === 'betterseqta') {
    return {
      ...base,
      coverImage: theme.cover_image_url,
      marqueeImage: theme.marquee_image_url,
      theme_json_url: theme.theme_json_url
    };
  }

  return {
    ...base,
    preview_thumbnail_url: theme.preview_thumbnail_url,
    zip_download_url: theme.zip_download_url,
    file_size: theme.file_size,
    checksum: theme.checksum
  };
}

export function formatCustomThemeOwner(theme: Record<string, unknown>) {
  return {
    ...formatCustomThemePublic(theme),
    status: theme.status,
    submission_notes: theme.submission_notes,
    rejection_reason: theme.rejection_reason,
    reviewed_at: theme.reviewed_at
  };
}

export async function deleteCustomThemeAssets(event: H3Event, themeId: string): Promise<void> {
  const bucket = getBucket(event);
  const db = getUserThemesDB(event);

  const files = await db
    .prepare('SELECT r2_key FROM custom_theme_files WHERE theme_id = ?')
    .bind(themeId)
    .all<{ r2_key: string }>();

  const keys = new Set(files.results?.map((f: { r2_key: string }) => f.r2_key) ?? []);
  keys.add(customThemeR2Key(themeId, 'theme.json'));
  keys.add(customThemeR2Key(themeId, 'theme.zip'));
  keys.add(customThemeR2Key(themeId, 'preview.png'));
  keys.add(customThemeR2Key(themeId, 'images', 'banner.webp'));
  keys.add(customThemeR2Key(themeId, 'images', 'marquee.webp'));

  await Promise.all(
    Array.from(keys).map(async (key) => {
      try {
        await bucket.delete(key);
      } catch {
        // best-effort cleanup
      }
    })
  );

  await db.prepare('DELETE FROM custom_theme_files WHERE theme_id = ?').bind(themeId).run();
}

async function recordThemeFile(
  db: any,
  themeId: string,
  filePath: string,
  fileType: string,
  r2Key: string,
  fileSize: number,
  mimeType?: string,
  checksum?: string
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO custom_theme_files (id, theme_id, file_path, file_type, r2_key, file_size, mime_type, checksum, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      generateUUID(),
      themeId,
      filePath,
      fileType,
      r2Key,
      fileSize,
      mimeType ?? null,
      checksum ?? null,
      nowUnixSeconds()
    )
    .run();
}

export interface ProcessCustomThemeUploadOptions {
  author: UserInfo;
  submissionNotes?: string;
  replaceThemeId?: string;
}

export async function processCustomThemeUpload(
  event: H3Event,
  themeFiles: Map<string, ArrayBuffer>,
  options: ProcessCustomThemeUploadOptions
) {
  const db = getUserThemesDB(event);
  const bucket = getBucket(event);
  const siteUrl = getSiteUrl(event);
  const authorName =
    (options.author.displayName as string) ||
    (options.author.username as string) ||
    'Unknown';

  const themeType = detectThemeType(themeFiles);
  if (!themeType) {
    return createApiError(
      'UNKNOWN_THEME_TYPE',
      'Could not detect theme type. Expected DesQTA (theme-manifest.json + styles/) or BetterSEQTA (theme.json with CustomCSS, id, name).',
      { errors: [], warnings: [] }
    );
  }

  if (themeType === 'betterseqta') {
    const validation = validateBetterSeqtaStructure(themeFiles);
    if (!validation.valid) {
      return createApiError('INVALID_THEME_STRUCTURE', 'BetterSEQTA theme validation failed', {
        errors: validation.errors,
        warnings: validation.warnings
      });
    }

    const themeJsonPath =
      Array.from(themeFiles.keys()).find((k) => k.endsWith('/theme.json')) ?? 'theme.json';
    const themeJsonContent = new TextDecoder().decode(themeFiles.get(themeJsonPath)!);
    const bsTheme = await parseBetterSeqtaTheme(themeJsonContent);
    const themeId = options.replaceThemeId ?? generateUUID();
    const themeSlug = await ensureUniqueSlug(
      db,
      slugify(bsTheme.name),
      options.replaceThemeId
    );

    if (!options.replaceThemeId) {
      const existing = await db
        .prepare('SELECT id FROM custom_themes WHERE id = ?')
        .bind(bsTheme.id)
        .first();
      if (existing && bsTheme.id !== themeId) {
        throw createError({
          statusCode: 409,
          statusMessage: `Theme id "${bsTheme.id}" is already in use`
        });
      }
    }

    const themeJsonKey = customThemeR2Key(themeId, 'theme.json');
    await bucket.put(themeJsonKey, new TextEncoder().encode(themeJsonContent), {
      httpMetadata: { contentType: 'application/json' }
    });
    await recordThemeFile(
      db,
      themeId,
      'theme.json',
      'theme_json',
      themeJsonKey,
      themeJsonContent.length,
      'application/json'
    );

    const themeJsonUrl = `${siteUrl}/api/custom-themes/${themeId}/theme.json`;

    let coverImageUrl: string | null = null;
    let marqueeImageUrl: string | null = null;

    const bannerEntry = Array.from(themeFiles.entries()).find(
      ([p]) => p.includes('images/banner.webp') || p.includes('banner.webp')
    );
    if (bannerEntry) {
      const bannerKey = customThemeR2Key(themeId, 'images', 'banner.webp');
      await bucket.put(bannerKey, bannerEntry[1], {
        httpMetadata: { contentType: 'image/webp' }
      });
      coverImageUrl = `${siteUrl}/api/images/${bannerKey}`;
      await recordThemeFile(
        db,
        themeId,
        'images/banner.webp',
        'cover',
        bannerKey,
        bannerEntry[1].byteLength,
        'image/webp'
      );
    }

    const marqueeEntry = Array.from(themeFiles.entries()).find(
      ([p]) => p.includes('images/marquee.webp') || p.includes('marquee.webp')
    );
    if (marqueeEntry) {
      const marqueeKey = customThemeR2Key(themeId, 'images', 'marquee.webp');
      await bucket.put(marqueeKey, marqueeEntry[1], {
        httpMetadata: { contentType: 'image/webp' }
      });
      marqueeImageUrl = `${siteUrl}/api/images/${marqueeKey}`;
      await recordThemeFile(
        db,
        themeId,
        'images/marquee.webp',
        'marquee',
        marqueeKey,
        marqueeEntry[1].byteLength,
        'image/webp'
      );
    }

    const now = nowUnixSeconds();

    if (options.replaceThemeId) {
      await db
        .prepare(
          `UPDATE custom_themes SET
            name = ?, slug = ?, version = ?, description = ?, author = ?,
            category = ?, tags = ?, status = 'pending', theme_json_url = ?,
            cover_image_url = ?, marquee_image_url = ?, zip_download_url = NULL,
            preview_thumbnail_url = NULL, preview_screenshots = NULL,
            file_size = NULL, checksum = NULL, compatibility_min = NULL,
            compatibility_max = NULL, rejection_reason = NULL, reviewed_by = NULL,
            reviewed_at = NULL, submission_notes = ?, updated_at = ?
           WHERE id = ? AND author_id = ?`
        )
        .bind(
          bsTheme.name,
          themeSlug,
          '1.0.0',
          bsTheme.description,
          authorName,
          'other',
          '[]',
          themeJsonUrl,
          coverImageUrl,
          marqueeImageUrl,
          options.submissionNotes ?? null,
          now,
          themeId,
          options.author.id
        )
        .run();
    } else {
      await db
        .prepare(
          `INSERT INTO custom_themes (
            id, name, slug, version, description, author, author_id, license,
            category, tags, status, theme_type, theme_json_url,
            cover_image_url, marquee_image_url, submission_notes,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          themeId,
          bsTheme.name,
          themeSlug,
          '1.0.0',
          bsTheme.description,
          authorName,
          options.author.id,
          'MIT',
          'other',
          '[]',
          'pending',
          'betterseqta',
          themeJsonUrl,
          coverImageUrl,
          marqueeImageUrl,
          options.submissionNotes ?? null,
          now,
          now
        )
        .run();

      await logThemeUpload(db, options.author.id, themeId);
    }

    const theme = (await db
      .prepare('SELECT * FROM custom_themes WHERE id = ?')
      .bind(themeId)
      .first()) as Record<string, unknown>;

    return createApiEnvelope({
      theme: formatCustomThemeOwner(theme),
      validation: { valid: true, warnings: validation.warnings, errors: [] }
    });
  }

  // DesQTA flow
  const validation = validateThemeStructure(themeFiles);
  if (!validation.valid) {
    return createApiError('INVALID_THEME_STRUCTURE', 'Theme validation failed', {
      errors: validation.errors,
      warnings: validation.warnings
    });
  }

  const manifestEntry = Array.from(themeFiles.entries()).find(([path]) =>
    path.endsWith('theme-manifest.json')
  );
  if (!manifestEntry) {
    throw createError({
      statusCode: 400,
      statusMessage: 'theme-manifest.json not found'
    });
  }

  const manifest = await parseManifest(new TextDecoder().decode(manifestEntry[1]));
  const themeId = options.replaceThemeId ?? generateUUID();
  const themeSlug = await ensureUniqueSlug(db, slugify(manifest.name), options.replaceThemeId);

  let previewUrl: string | null = null;
  const previewPaths = ['preview.png', 'preview.jpg', 'preview.jpeg'];
  for (const path of previewPaths) {
    const entry = Array.from(themeFiles.entries()).find(
      ([p]) =>
        p.includes(path) && (p.endsWith('.png') || p.endsWith('.jpg') || p.endsWith('.jpeg'))
    );
    if (entry) {
      const previewKey = customThemeR2Key(themeId, 'preview.png');
      await bucket.put(previewKey, entry[1], {
        httpMetadata: { contentType: 'image/png' }
      });
      previewUrl = `${siteUrl}/api/images/${previewKey}`;
      await recordThemeFile(
        db,
        themeId,
        entry[0],
        'preview',
        previewKey,
        entry[1].byteLength,
        'image/png'
      );
      break;
    }
  }

  const screenshots: Array<{ path: string; data: ArrayBuffer }> = [];
  let screenshotIndex = 1;
  while (true) {
    const screenshotPath = `screenshot${screenshotIndex}.png`;
    const entry = Array.from(themeFiles.entries()).find(
      ([p]) => p.includes(screenshotPath) || p.includes(`screenshot${screenshotIndex}.jpg`)
    );
    if (!entry) break;
    screenshots.push({ path: entry[0], data: entry[1] });
    screenshotIndex++;
  }

  const screenshotUrls: string[] = [];
  for (let i = 0; i < screenshots.length; i++) {
    const screenshot = screenshots[i];
    const screenshotKey = customThemeR2Key(themeId, `screenshot${i + 1}.png`);
    await bucket.put(screenshotKey, screenshot.data, {
      httpMetadata: { contentType: 'image/png' }
    });
    screenshotUrls.push(`${siteUrl}/api/images/${screenshotKey}`);
    await recordThemeFile(
      db,
      themeId,
      screenshot.path,
      'screenshot',
      screenshotKey,
      screenshot.data.byteLength,
      'image/png'
    );
  }

  const zipBuffer = await createZipArchive(themeFiles, themeSlug);
  const zipSize = zipBuffer.byteLength;
  const zipChecksum = await calculateSHA256(zipBuffer);
  const zipKey = customThemeR2Key(themeId, 'theme.zip');
  await bucket.put(zipKey, zipBuffer, {
    httpMetadata: { contentType: 'application/zip' }
  });
  const zipUrl = `${siteUrl}/api/images/${zipKey}`;
  await recordThemeFile(
    db,
    themeId,
    'theme.zip',
    'zip',
    zipKey,
    zipSize,
    'application/zip',
    `sha256:${zipChecksum}`
  );

  const now = nowUnixSeconds();

  if (options.replaceThemeId) {
    await db
      .prepare(
        `UPDATE custom_themes SET
          name = ?, slug = ?, version = ?, description = ?, author = ?,
          license = ?, category = ?, tags = ?, status = 'pending',
          preview_thumbnail_url = ?, preview_screenshots = ?,
          zip_download_url = ?, file_size = ?, checksum = ?,
          compatibility_min = ?, compatibility_max = ?,
          theme_json_url = NULL, cover_image_url = NULL, marquee_image_url = NULL,
          rejection_reason = NULL, reviewed_by = NULL, reviewed_at = NULL,
          submission_notes = ?, updated_at = ?
         WHERE id = ? AND author_id = ?`
      )
      .bind(
        manifest.name,
        themeSlug,
        manifest.version,
        manifest.description,
        authorName,
        manifest.license || 'MIT',
        manifest.category || inferCategory(manifest),
        JSON.stringify(manifest.tags || []),
        previewUrl,
        JSON.stringify(screenshotUrls),
        zipUrl,
        zipSize,
        `sha256:${zipChecksum}`,
        manifest.compatibility.minVersion,
        manifest.compatibility.maxVersion || null,
        options.submissionNotes ?? null,
        now,
        themeId,
        options.author.id
      )
      .run();
  } else {
    await db
      .prepare(
        `INSERT INTO custom_themes (
          id, name, slug, version, description, author, author_id, license,
          category, tags, status, preview_thumbnail_url, preview_screenshots,
          zip_download_url, file_size, checksum, compatibility_min, compatibility_max,
          theme_type, submission_notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        themeId,
        manifest.name,
        themeSlug,
        manifest.version,
        manifest.description,
        authorName,
        options.author.id,
        manifest.license || 'MIT',
        manifest.category || inferCategory(manifest),
        JSON.stringify(manifest.tags || []),
        'pending',
        previewUrl,
        JSON.stringify(screenshotUrls),
        zipUrl,
        zipSize,
        `sha256:${zipChecksum}`,
        manifest.compatibility.minVersion,
        manifest.compatibility.maxVersion || null,
        'desqta',
        options.submissionNotes ?? null,
        now,
        now
      )
      .run();

    await logThemeUpload(db, options.author.id, themeId);
  }

  const theme = (await db
    .prepare('SELECT * FROM custom_themes WHERE id = ?')
    .bind(themeId)
    .first()) as Record<string, unknown>;

  return createApiEnvelope({
    theme: formatCustomThemeOwner(theme),
    validation: { valid: true, warnings: validation.warnings, errors: [] }
  });
}

export async function getCustomThemeById(
  db: any,
  id: string,
  status?: CustomThemeStatus
): Promise<CustomThemeRow | null> {
  const query = status
    ? 'SELECT * FROM custom_themes WHERE id = ? AND status = ?'
    : 'SELECT * FROM custom_themes WHERE id = ?';
  const bindings = status ? [id, status] : [id];
  return (await db.prepare(query).bind(...bindings).first()) as CustomThemeRow | null;
}

export function buildCustomThemeListQuery(params: {
  status?: CustomThemeStatus;
  authorId?: string;
  themeType?: string;
  search?: string;
  sort?: string;
  page: number;
  limit: number;
}) {
  const conditions: string[] = [];
  const bindings: unknown[] = [];

  if (params.status) {
    conditions.push('status = ?');
    bindings.push(params.status);
  }

  if (params.authorId) {
    conditions.push('author_id = ?');
    bindings.push(params.authorId);
  }

  if (params.themeType === 'betterseqta' || params.themeType === 'desqta') {
    conditions.push('theme_type = ?');
    bindings.push(params.themeType);
  }

  if (params.search) {
    conditions.push('(name LIKE ? OR description LIKE ? OR author LIKE ?)');
    const pattern = `%${params.search}%`;
    bindings.push(pattern, pattern, pattern);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  let orderBy = 'created_at DESC';
  switch (params.sort) {
    case 'popular':
      orderBy = 'download_count DESC, created_at DESC';
      break;
    case 'newest':
      orderBy = 'created_at DESC';
      break;
    case 'name':
      orderBy = 'name ASC';
      break;
  }

  const offset = (params.page - 1) * params.limit;

  return { whereClause, orderBy, bindings, offset, limit: params.limit };
}
