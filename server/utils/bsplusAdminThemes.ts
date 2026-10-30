import type { H3Event } from 'h3';
import { requireAdmin } from './auth';
import { getDB } from './db';
import { getBucket } from './r2';
import { customThemeR2Key, createApiEnvelope, getCustomThemeById } from './customThemes';
import { formatPublicThemeResponse } from './formatPublicTheme';
import { loadFlavoursForMasters } from './themeFlavours';

export type BsplusThemeSource = 'marketplace' | 'community';

export async function requireBsplusAdmin(event: H3Event) {
  return requireAdmin(event);
}

export function getSiteUrl(event: H3Event): string {
  const config = useRuntimeConfig(event);
  return (String(config.public?.siteUrl ?? 'https://betterseqta.org') || 'https://betterseqta.org').replace(
    /\/$/,
    ''
  );
}

export function parseBsplusThemeSource(value: unknown, required = true): BsplusThemeSource {
  if (value === 'marketplace' || value === 'community') {
    return value;
  }
  if (!required) {
    return 'marketplace';
  }
  throw createError({
    statusCode: 400,
    statusMessage: 'Query parameter source is required and must be marketplace or community'
  });
}

export function bsplusAdminThemeJsonUrl(siteUrl: string, id: string, source: BsplusThemeSource): string {
  return `${siteUrl}/api/bsplus/admin/themes/${encodeURIComponent(id)}/theme.json?source=${source}`;
}

export function bsplusAdminPreviewApiUrl(siteUrl: string, id: string, source: BsplusThemeSource): string {
  return `${siteUrl}/api/bsplus/admin/themes/${encodeURIComponent(id)}/preview?source=${source}`;
}

function parseJsonArray(value: unknown): unknown[] {
  if (!value || typeof value !== 'string') return [];
  try {
    return JSON.parse(value) as unknown[];
  } catch {
    return [];
  }
}

function listPreviewThumbnail(theme: Record<string, unknown>): string | null {
  return (
    (theme.preview_thumbnail_url as string) ||
    (theme.cover_image_url as string) ||
    null
  );
}

export function withBsplusAdminUrls(
  theme: Record<string, unknown>,
  source: BsplusThemeSource,
  siteUrl: string
) {
  const id = String(theme.id);
  return {
    ...theme,
    source,
    admin_preview_url: bsplusAdminPreviewApiUrl(siteUrl, id, source),
    admin_theme_json_url: bsplusAdminThemeJsonUrl(siteUrl, id, source)
  };
}

export interface BsplusAdminThemeListQuery {
  page?: string;
  limit?: string;
  status?: string;
  search?: string;
  source?: string;
}

export async function listBsplusAdminThemes(event: H3Event, query: BsplusAdminThemeListQuery) {
  await requireBsplusAdmin(event);
  const db = getDB(event);
  const siteUrl = getSiteUrl(event);

  const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
  const limit = Math.min(Math.max(1, parseInt(query.limit || '20', 10) || 20), 100);
  const offset = (page - 1) * limit;
  const status = query.status?.trim() || null;
  const search = query.search?.trim() || null;
  const sourceFilter =
    query.source === 'marketplace' || query.source === 'community' ? query.source : null;

  const includeMarketplace = !sourceFilter || sourceFilter === 'marketplace';
  const includeCommunity = !sourceFilter || sourceFilter === 'community';

  const parts: string[] = [];
  const params: unknown[] = [];

  if (includeMarketplace) {
    const cond: string[] = ["theme_type = 'betterseqta'"];
    if (status) {
      cond.push('status = ?');
      params.push(status);
    }
    if (search) {
      cond.push('(name LIKE ? OR description LIKE ? OR author LIKE ? OR slug LIKE ?)');
      const pattern = `%${search}%`;
      params.push(pattern, pattern, pattern, pattern);
    }
    parts.push(`
      SELECT id, name, slug, description, author, status, created_at, updated_at,
             cover_image_url, preview_thumbnail_url, preview_screenshots,
             'marketplace' AS source
      FROM themes
      WHERE ${cond.join(' AND ')}
    `);
  }

  if (includeCommunity) {
    const cond: string[] = ["theme_type = 'betterseqta'"];
    if (status) {
      cond.push('status = ?');
      params.push(status);
    }
    if (search) {
      cond.push('(name LIKE ? OR description LIKE ? OR author LIKE ? OR slug LIKE ?)');
      const pattern = `%${search}%`;
      params.push(pattern, pattern, pattern, pattern);
    }
    parts.push(`
      SELECT id, name, slug, description, author, status, created_at, updated_at,
             cover_image_url, preview_thumbnail_url, preview_screenshots,
             'community' AS source
      FROM custom_themes
      WHERE ${cond.join(' AND ')}
    `);
  }

  if (parts.length === 0) {
    return createApiEnvelope({
      themes: [],
      pagination: { page, limit, total: 0, totalPages: 0 }
    });
  }

  const unionSql = parts.join(' UNION ALL ');
  const countSql = `SELECT COUNT(*) AS total FROM (${unionSql})`;
  const countRow = (await db.prepare(countSql).bind(...params).first()) as { total?: number } | null;
  const total = countRow?.total ?? 0;
  const totalPages = Math.ceil(total / limit) || 0;

  const listSql = `SELECT * FROM (${unionSql}) ORDER BY created_at DESC LIMIT ? OFFSET ?`;
  const rows = (await db.prepare(listSql).bind(...params, limit, offset).all()) as {
    results?: Record<string, unknown>[];
  };

  const themes = (rows.results ?? []).map((row) => {
    const source = row.source as BsplusThemeSource;
    const base = {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      author: row.author,
      status: row.status,
      theme_type: 'betterseqta' as const,
      created_at: row.created_at,
      updated_at: row.updated_at,
      preview: {
        thumbnail: listPreviewThumbnail(row),
        screenshots: parseJsonArray(row.preview_screenshots)
      },
      coverImage: row.cover_image_url ?? null,
      source
    };
    return withBsplusAdminUrls(base, source, siteUrl);
  });

  return createApiEnvelope({
    themes,
    pagination: { page, limit, total, totalPages }
  });
}

async function loadMarketplaceTheme(db: ReturnType<typeof getDB>, id: string) {
  return (await db
    .prepare("SELECT * FROM themes WHERE id = ? AND theme_type = 'betterseqta'")
    .bind(id)
    .first()) as Record<string, unknown> | null;
}

export async function getBsplusAdminThemeDetail(
  event: H3Event,
  id: string,
  source: BsplusThemeSource
) {
  await requireBsplusAdmin(event);
  const db = getDB(event);
  const siteUrl = getSiteUrl(event);

  if (source === 'community') {
    const theme = await getCustomThemeById(db, id);
    if (!theme || theme.theme_type !== 'betterseqta') {
      throw createError({ statusCode: 404, statusMessage: 'Theme not found' });
    }
    const formatted = {
      id: theme.id,
      name: theme.name,
      slug: theme.slug,
      version: theme.version,
      description: theme.description,
      author: theme.author,
      license: theme.license,
      status: theme.status,
      theme_type: 'betterseqta',
      download_count: theme.download_count ?? 0,
      coverImage: theme.cover_image_url,
      marqueeImage: theme.marquee_image_url,
      theme_json_url: theme.theme_json_url,
      preview: {
        thumbnail: listPreviewThumbnail(theme),
        screenshots: parseJsonArray(theme.preview_screenshots)
      },
      submission_notes: theme.submission_notes,
      rejection_reason: theme.rejection_reason,
      created_at: theme.created_at,
      updated_at: theme.updated_at,
      published_at: theme.published_at
    };
    return createApiEnvelope({
      theme: withBsplusAdminUrls(formatted, source, siteUrl)
    });
  }

  const theme = await loadMarketplaceTheme(db, id);
  if (!theme) {
    throw createError({ statusCode: 404, statusMessage: 'Theme not found' });
  }

  const flavoursOpts =
    !theme.flavour_master_id
      ? { flavours: (await loadFlavoursForMasters(db, [id])).get(id) ?? [] }
      : undefined;

  const publicShape = formatPublicThemeResponse(theme, false, flavoursOpts);
  const themeData = publicShape.data.theme as Record<string, unknown>;
  return createApiEnvelope({
    theme: withBsplusAdminUrls(themeData, source, siteUrl)
  });
}

export async function getBsplusAdminThemePreview(
  event: H3Event,
  id: string,
  source: BsplusThemeSource
) {
  await requireBsplusAdmin(event);
  const db = getDB(event);
  const siteUrl = getSiteUrl(event);

  let status: string;
  let downloadCount: number;

  if (source === 'community') {
    const theme = await getCustomThemeById(db, id);
    if (!theme || theme.theme_type !== 'betterseqta') {
      throw createError({ statusCode: 404, statusMessage: 'Theme not found' });
    }
    status = String(theme.status);
    downloadCount = Number(theme.download_count ?? 0);
  } else {
    const theme = (await db
      .prepare(
        'SELECT status, download_count FROM themes WHERE id = ? AND theme_type = ?'
      )
      .bind(id, 'betterseqta')
      .first()) as { status?: string; download_count?: number } | undefined;
    if (!theme) {
      throw createError({ statusCode: 404, statusMessage: 'Theme not found' });
    }
    status = String(theme.status);
    downloadCount = Number(theme.download_count ?? 0);
  }

  return createApiEnvelope({
    theme_json_url: bsplusAdminThemeJsonUrl(siteUrl, id, source),
    source,
    status,
    preview: true,
    counts_toward_downloads: false,
    download_count: downloadCount
  });
}

export async function serveBsplusAdminThemeJson(
  event: H3Event,
  id: string,
  source: BsplusThemeSource
) {
  await requireBsplusAdmin(event);
  const db = getDB(event);
  const bucket = getBucket(event);

  if (source === 'community') {
    const theme = await getCustomThemeById(db, id);
    if (!theme || theme.theme_type !== 'betterseqta') {
      throw createError({
        statusCode: 404,
        statusMessage: 'Theme not found or not a BetterSEQTA theme'
      });
    }
    const key = customThemeR2Key(id, 'theme.json');
    const object = await bucket.get(key);
    if (!object) {
      throw createError({ statusCode: 404, statusMessage: 'Theme file not found' });
    }
    const json = new TextDecoder().decode(await object.arrayBuffer());
    setHeader(event, 'Cache-Control', 'private, no-store');
    return send(event, json, 'application/json');
  }

  const theme = (await db
    .prepare(
      'SELECT theme_type, theme_json_url, is_pseudo_theme FROM themes WHERE id = ?'
    )
    .bind(id)
    .first()) as {
    theme_type?: string;
    theme_json_url?: string;
    is_pseudo_theme?: number | boolean;
  } | null;

  if (!theme || theme.theme_type !== 'betterseqta') {
    throw createError({
      statusCode: 404,
      statusMessage: 'Theme not found or not a BetterSEQTA theme'
    });
  }

  if (theme.is_pseudo_theme && theme.theme_json_url) {
    setHeader(event, 'Cache-Control', 'private, no-store');
    return sendRedirect(event, theme.theme_json_url, 302);
  }

  const key = `themes/${id}/theme.json`;
  const object = await bucket.get(key);
  if (!object) {
    throw createError({ statusCode: 404, statusMessage: 'Theme file not found' });
  }
  const json = new TextDecoder().decode(await object.arrayBuffer());
  setHeader(event, 'Cache-Control', 'private, no-store');
  return send(event, json, 'application/json');
}
