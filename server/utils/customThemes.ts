import type { H3Event } from 'h3';
import type { UserInfo } from './auth';
import { getBucket } from './r2';
import { getDB } from './db';
import {
  parseManifest,
  validateThemeStructure,
  validateBetterSeqtaStructure,
  parseBetterSeqtaTheme,
  detectThemeType,
  slugify,
  generateUUID,
  inferCategory,
  themeStorageLayout,
  uploadBetterSeqtaThemeAssets,
  uploadDesqtaThemeAssets,
  type ThemeFileIndexEntry,
  type ThemeValidationResult
} from './themes';

export const CUSTOM_THEMES_R2_PREFIX = 'custom-themes';
export const MAX_PENDING_PER_USER = 5;
export const MAX_UPLOADS_PER_24H = 10;
const SECONDS_PER_DAY = 86400;

const RESUBMIT_RESET =
  "status = 'pending', rejection_reason = NULL, reviewed_by = NULL, reviewed_at = NULL";

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

function parseJsonArray(value: unknown): unknown[] {
  if (!value || typeof value !== 'string') return [];
  try {
    return JSON.parse(value) as unknown[];
  } catch {
    return [];
  }
}

function customThemePreview(theme: Record<string, unknown>) {
  return {
    thumbnail: (theme.preview_thumbnail_url as string) || (theme.cover_image_url as string),
    screenshots: parseJsonArray(theme.preview_screenshots)
  };
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
    tags: parseJsonArray(theme.tags),
    theme_type: themeType,
    download_count: theme.download_count ?? 0,
    preview: customThemePreview(theme),
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
  const db = getDB(event);

  const files = await db
    .prepare('SELECT r2_key FROM custom_theme_files WHERE theme_id = ?')
    .bind(themeId)
    .all<{ r2_key: string }>();

  const keys = (files.results ?? []).map((f) => f.r2_key);
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
    keys.map(async (key) => {
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
  entries: ThemeFileIndexEntry[]
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

async function uploadResult(
  db: any,
  themeId: string,
  validation: ThemeValidationResult
) {
  const theme = (await db
    .prepare('SELECT * FROM custom_themes WHERE id = ?')
    .bind(themeId)
    .first()) as Record<string, unknown>;

  return createApiEnvelope({
    theme: formatCustomThemeOwner(theme),
    validation: { valid: true, warnings: validation.warnings, errors: [] }
  });
}

async function saveBetterSeqtaCustomTheme(
  db: any,
  params: {
    themeId: string;
    replaceThemeId?: string;
    authorId: string;
    authorName: string;
    submissionNotes?: string;
    slug: string;
    bsTheme: Awaited<ReturnType<typeof parseBetterSeqtaTheme>>;
    assets: Awaited<ReturnType<typeof uploadBetterSeqtaThemeAssets>>;
  }
) {
  const now = nowUnixSeconds();
  const {
    themeId,
    replaceThemeId,
    authorId,
    authorName,
    submissionNotes,
    slug,
    bsTheme,
    assets
  } = params;

  if (replaceThemeId) {
    await db
      .prepare(
        `UPDATE custom_themes SET
          name = ?, slug = ?, version = ?, description = ?, author = ?,
          category = ?, tags = ?, theme_type = 'betterseqta',
          theme_json_url = ?, cover_image_url = ?, marquee_image_url = ?,
          zip_download_url = NULL, preview_thumbnail_url = NULL, preview_screenshots = NULL,
          file_size = NULL, checksum = NULL, compatibility_min = NULL, compatibility_max = NULL,
          ${RESUBMIT_RESET}, submission_notes = ?, updated_at = ?
         WHERE id = ? AND author_id = ?`
      )
      .bind(
        bsTheme.name,
        slug,
        '1.0.0',
        bsTheme.description,
        authorName,
        'other',
        '[]',
        assets.themeJsonUrl,
        assets.coverImageUrl,
        assets.marqueeImageUrl,
        submissionNotes ?? null,
        now,
        themeId,
        authorId
      )
      .run();
    return;
  }

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
      slug,
      '1.0.0',
      bsTheme.description,
      authorName,
      authorId,
      'MIT',
      'other',
      '[]',
      'pending',
      'betterseqta',
      assets.themeJsonUrl,
      assets.coverImageUrl,
      assets.marqueeImageUrl,
      submissionNotes ?? null,
      now,
      now
    )
    .run();
}

async function saveDesqtaCustomTheme(
  db: any,
  params: {
    themeId: string;
    replaceThemeId?: string;
    authorId: string;
    authorName: string;
    submissionNotes?: string;
    slug: string;
    manifest: Awaited<ReturnType<typeof parseManifest>>;
    assets: Awaited<ReturnType<typeof uploadDesqtaThemeAssets>>;
  }
) {
  const now = nowUnixSeconds();
  const { themeId, replaceThemeId, authorId, authorName, submissionNotes, slug, manifest, assets } =
    params;
  const category = manifest.category || inferCategory(manifest);
  const tagsJson = JSON.stringify(manifest.tags || []);
  const screenshotsJson = JSON.stringify(assets.screenshotUrls);

  if (replaceThemeId) {
    await db
      .prepare(
        `UPDATE custom_themes SET
          name = ?, slug = ?, version = ?, description = ?, author = ?,
          license = ?, category = ?, tags = ?, theme_type = 'desqta',
          preview_thumbnail_url = ?, preview_screenshots = ?,
          zip_download_url = ?, file_size = ?, checksum = ?,
          compatibility_min = ?, compatibility_max = ?,
          theme_json_url = NULL, cover_image_url = NULL, marquee_image_url = NULL,
          ${RESUBMIT_RESET}, submission_notes = ?, updated_at = ?
         WHERE id = ? AND author_id = ?`
      )
      .bind(
        manifest.name,
        slug,
        manifest.version,
        manifest.description,
        authorName,
        manifest.license || 'MIT',
        category,
        tagsJson,
        assets.previewUrl,
        screenshotsJson,
        assets.zipUrl,
        assets.zipSize,
        `sha256:${assets.zipChecksum}`,
        manifest.compatibility.minVersion,
        manifest.compatibility.maxVersion || null,
        submissionNotes ?? null,
        now,
        themeId,
        authorId
      )
      .run();
    return;
  }

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
      slug,
      manifest.version,
      manifest.description,
      authorName,
      authorId,
      manifest.license || 'MIT',
      category,
      tagsJson,
      'pending',
      assets.previewUrl,
      screenshotsJson,
      assets.zipUrl,
      assets.zipSize,
      `sha256:${assets.zipChecksum}`,
      manifest.compatibility.minVersion,
      manifest.compatibility.maxVersion || null,
      'desqta',
      submissionNotes ?? null,
      now,
      now
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
  const db = getDB(event);
  const bucket = getBucket(event);
  const config = useRuntimeConfig(event);
  const siteUrl = (config.public?.siteUrl ?? 'https://betterseqta.org').replace(/\/$/, '');
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

  const storageLayout = (themeId: string) =>
    themeStorageLayout('custom-themes', themeId, siteUrl, 'custom-themes');

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
    const assets = await uploadBetterSeqtaThemeAssets(
      bucket,
      themeId,
      themeFiles,
      storageLayout(themeId),
      { themeJsonContent }
    );

    await saveBetterSeqtaCustomTheme(db, {
      themeId,
      replaceThemeId: options.replaceThemeId,
      authorId: options.author.id,
      authorName,
      submissionNotes: options.submissionNotes,
      slug: themeSlug,
      bsTheme,
      assets
    });
    await replaceCustomThemeFiles(db, themeId, assets.r2Keys);

    return uploadResult(db, themeId, validation);
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
  const assets = await uploadDesqtaThemeAssets(
    bucket,
    themeId,
    themeSlug,
    themeFiles,
    storageLayout(themeId)
  );

  await saveDesqtaCustomTheme(db, {
    themeId,
    replaceThemeId: options.replaceThemeId,
    authorId: options.author.id,
    authorName,
    submissionNotes: options.submissionNotes,
    slug: themeSlug,
    manifest,
    assets
  });
  await replaceCustomThemeFiles(db, themeId, assets.r2Keys);

  return uploadResult(db, themeId, validation);
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
  if (params.sort === 'popular') orderBy = 'download_count DESC, created_at DESC';
  else if (params.sort === 'name') orderBy = 'name ASC';
  const limit = params.limit;
  const offset = (params.page - 1) * limit;

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
  const db = getDB(event);
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
