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
  inferCategory,
  parseThemeUploadMultipart,
  themeStorageLayout,
  uploadBetterSeqtaThemeAssets,
  uploadDesqtaThemeAssets
} from './themes';

export const CUSTOM_THEMES_R2_PREFIX = 'custom-themes';
export const MAX_PENDING_PER_USER = 5;
export const MAX_UPLOADS_PER_24H = 10;
export const SECONDS_PER_DAY = 86400;

export type CustomThemeStatus = 'pending' | 'approved' | 'rejected';

export function nowUnixSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

export function createApiEnvelope<T>(data: T) {
  return {
    success: true as const,
    data,
    error: null,
    meta: { timestamp: Date.now(), version: '1.0.0' }
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
    meta: { timestamp: Date.now(), version: '1.0.0' }
  };
}

export function getSiteUrl(event: H3Event): string {
  const config = useRuntimeConfig(event);
  return (config.public?.siteUrl ?? 'https://betterseqta.org').replace(/\/$/, '');
}

export function customThemeR2Key(themeId: string, ...parts: string[]): string {
  return [CUSTOM_THEMES_R2_PREFIX, themeId, ...parts].join('/');
}

export function assertThemeOwner(theme: Record<string, unknown>, userId: string): void {
  if (theme.author_id !== userId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden - you do not own this theme'
    });
  }
}

export function assertEditableStatus(status: unknown): void {
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
      'SELECT COUNT(*) as count FROM custom_themes WHERE author_id = ? AND created_at >= ?'
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

export async function parseMultipartThemeFiles(event: H3Event) {
  const parsed = await parseThemeUploadMultipart(event);
  return { themeFiles: parsed.themeFiles, submissionNotes: parsed.submissionNotes };
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

  const keys = (files.results ?? []).map((f: { r2_key: string }) => f.r2_key);

  // Legacy uploads may predate custom_theme_files rows.
  if (keys.length === 0) {
    keys.push(
      customThemeR2Key(themeId, 'theme.json'),
      customThemeR2Key(themeId, 'theme.zip'),
      customThemeR2Key(themeId, 'preview.png'),
      customThemeR2Key(themeId, 'images', 'banner.webp'),
      customThemeR2Key(themeId, 'images', 'marquee.webp')
    );
  }

  await Promise.all(
    keys.map(async (key: string) => {
      try {
        await bucket.delete(key);
      } catch {
        // best-effort cleanup
      }
    })
  );

  await db.prepare('DELETE FROM custom_theme_files WHERE theme_id = ?').bind(themeId).run();
}

async function replaceCustomThemeFiles(
  db: any,
  themeId: string,
  entries: Array<{
    path: string;
    key: string;
    fileType: string;
    size: number;
    mimeType?: string;
    checksum?: string;
  }>
): Promise<void> {
  await db.prepare('DELETE FROM custom_theme_files WHERE theme_id = ?').bind(themeId).run();
  const now = nowUnixSeconds();
  for (const entry of entries) {
    await db
      .prepare(
        `INSERT INTO custom_theme_files (id, theme_id, file_path, file_type, r2_key, file_size, mime_type, checksum, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        generateUUID(),
        themeId,
        entry.path,
        entry.fileType,
        entry.key,
        entry.size,
        entry.mimeType ?? null,
        entry.checksum ?? null,
        now
      )
      .run();
  }
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
    const themeSlug = await ensureUniqueSlug(db, slugify(bsTheme.name), options.replaceThemeId);

    const layout = themeStorageLayout('custom-themes', themeId, siteUrl, 'custom-themes');
    const assets = await uploadBetterSeqtaThemeAssets(bucket, themeId, themeFiles, layout, {
      themeJsonContent
    });

    const bannerEntry = Array.from(themeFiles.entries()).find(
      ([p]) => p.includes('images/banner.webp') || p.includes('banner.webp')
    );
    const marqueeEntry = Array.from(themeFiles.entries()).find(
      ([p]) => p.includes('images/marquee.webp') || p.includes('marquee.webp')
    );

    const fileEntries: Array<{
      path: string;
      key: string;
      fileType: string;
      size: number;
      mimeType?: string;
    }> = [
      {
        path: 'theme.json',
        key: `${layout.r2BaseKey}/theme.json`,
        fileType: 'theme_json',
        size: themeJsonContent.length,
        mimeType: 'application/json'
      }
    ];
    if (bannerEntry) {
      fileEntries.push({
        path: 'images/banner.webp',
        key: `${layout.r2BaseKey}/images/banner.webp`,
        fileType: 'cover',
        size: bannerEntry[1].byteLength,
        mimeType: 'image/webp'
      });
    }
    if (marqueeEntry) {
      fileEntries.push({
        path: 'images/marquee.webp',
        key: `${layout.r2BaseKey}/images/marquee.webp`,
        fileType: 'marquee',
        size: marqueeEntry[1].byteLength,
        mimeType: 'image/webp'
      });
    }
    await replaceCustomThemeFiles(db, themeId, fileEntries);

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
          assets.themeJsonUrl,
          assets.coverImageUrl,
          assets.marqueeImageUrl,
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
          assets.themeJsonUrl,
          assets.coverImageUrl,
          assets.marqueeImageUrl,
          options.submissionNotes ?? null,
          now,
          now
        )
        .run();
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
    throw createError({ statusCode: 400, statusMessage: 'theme-manifest.json not found' });
  }

  const manifest = await parseManifest(new TextDecoder().decode(manifestEntry[1]));
  const themeId = options.replaceThemeId ?? generateUUID();
  const themeSlug = await ensureUniqueSlug(db, slugify(manifest.name), options.replaceThemeId);
  const layout = themeStorageLayout('custom-themes', themeId, siteUrl, 'custom-themes');
  const assets = await uploadDesqtaThemeAssets(bucket, themeId, themeSlug, themeFiles, layout);

  await replaceCustomThemeFiles(db, themeId, assets.r2Keys);

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
        assets.previewUrl,
        JSON.stringify(assets.screenshotUrls),
        assets.zipUrl,
        assets.zipSize,
        `sha256:${assets.zipChecksum}`,
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
        assets.previewUrl,
        JSON.stringify(assets.screenshotUrls),
        assets.zipUrl,
        assets.zipSize,
        `sha256:${assets.zipChecksum}`,
        manifest.compatibility.minVersion,
        manifest.compatibility.maxVersion || null,
        'desqta',
        options.submissionNotes ?? null,
        now,
        now
      )
      .run();
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
): Promise<Record<string, unknown> | null> {
  const query = status
    ? 'SELECT * FROM custom_themes WHERE id = ? AND status = ?'
    : 'SELECT * FROM custom_themes WHERE id = ?';
  const bindings = status ? [id, status] : [id];
  return (await db.prepare(query).bind(...bindings).first()) as Record<string, unknown> | null;
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
    case 'name':
      orderBy = 'name ASC';
      break;
  }

  return {
    whereClause,
    orderBy,
    bindings,
    offset: (params.page - 1) * params.limit,
    limit: params.limit
  };
}

export async function listCustomThemes(
  db: any,
  params: {
    status?: CustomThemeStatus;
    authorId?: string;
    themeType?: string;
    search?: string;
    sort?: string;
    page: number;
    limit: number;
  },
  format: (theme: Record<string, unknown>) => unknown
) {
  const { whereClause, orderBy, bindings, offset, limit } = buildCustomThemeListQuery(params);

  const countRow = await db
    .prepare(`SELECT COUNT(*) as total FROM custom_themes ${whereClause}`)
    .bind(...bindings)
    .first<{ total: number }>();

  const total = countRow?.total ?? 0;

  const rows = await db
    .prepare(
      `SELECT * FROM custom_themes ${whereClause} ORDER BY ${orderBy} LIMIT ? OFFSET ?`
    )
    .bind(...bindings, limit, offset)
    .all<Record<string, unknown>>();

  return {
    themes: (rows.results ?? []).map(format),
    pagination: {
      page: params.page,
      limit,
      total,
      total_pages: Math.ceil(total / limit)
    }
  };
}

export async function getCustomThemeStatusCounts(db: any) {
  const row = await db
    .prepare(
      `SELECT
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
       FROM custom_themes`
    )
    .first<{ pending: number; approved: number; rejected: number }>();

  return {
    pending: row?.pending ?? 0,
    approved: row?.approved ?? 0,
    rejected: row?.rejected ?? 0
  };
}

export async function fetchApprovedCustomThemeList(
  event: H3Event,
  options?: { includeSearchQuery?: boolean }
) {
  const db = getUserThemesDB(event);
  const query = getQuery<{
    page?: string;
    limit?: string;
    type?: string;
    search?: string;
    q?: string;
    sort?: string;
  }>(event);

  const page = Math.max(parseInt(query.page || '1', 10), 1);
  const limit = Math.min(parseInt(query.limit || '20', 10), 100);
  const search = (query.search || query.q || '').trim() || undefined;

  const listed = await listCustomThemes(
    db,
    {
      status: 'approved',
      themeType: query.type,
      search,
      sort: query.sort || 'popular',
      page,
      limit
    },
    formatCustomThemePublic
  );

  const data: Record<string, unknown> = { ...listed };
  if (options?.includeSearchQuery) {
    data.query = query.q ?? query.search ?? '';
  }

  return createApiEnvelope(data);
}

