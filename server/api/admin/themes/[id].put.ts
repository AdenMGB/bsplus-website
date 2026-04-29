import { getDB } from '../../../utils/db';
import { requireAdmin } from '../../../utils/auth';
import { slugify, normalizeAndValidateExternalThemeJsonUrl } from '../../../utils/themes';

interface UpdateThemeBody {
  name?: string;
  slug?: string;
  description?: string;
  author?: string;
  license?: string;
  version?: string;
  category?: string | null;
  tags?: string[];
  featured?: boolean;
  compatibility_min?: string | null;
  compatibility_max?: string | null;
  /** Only for pseudo BetterSEQTA themes: external HTTPS URL for theme.json (e.g. GitHub raw). */
  theme_json_url?: string;
  /**
   * BetterSEQTA only: set another theme id to list this variant under that master`s `flavours` (hidden from grid); null clears.
   */
  flavour_master_id?: string | null;
  /** Order under master (BetterSEQTA slave only). Default 0. */
  flavour_sort_order?: number;
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const db = getDB(event);
  const id = getRouterParam(event, 'id');
  const body = await readBody<UpdateThemeBody>(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Theme ID is required'
    });
  }

  // Check if theme exists
  const existing = await db.prepare(
    `SELECT id, theme_type, is_pseudo_theme, flavour_master_id,
            flavour_sort_order FROM themes WHERE id = ?`
  ).bind(id).first() as
    | {
        id: string;
        theme_type?: string;
        is_pseudo_theme?: number;
        flavour_master_id?: string | null;
        flavour_sort_order?: number;
      }
    | undefined;

  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Theme not found'
    });
  }

  // Build update query
  const updates: string[] = [];
  const params: any[] = [];

  if (body.theme_json_url !== undefined) {
    if (existing.theme_type !== 'betterseqta' || !existing.is_pseudo_theme) {
      throw createError({
        statusCode: 400,
        statusMessage: 'theme_json_url may only be updated for pseudo BetterSEQTA themes'
      });
    }
    const v = normalizeAndValidateExternalThemeJsonUrl(body.theme_json_url);
    if (!v.ok) {
      throw createError({
        statusCode: 400,
        statusMessage: v.error
      });
    }
    updates.push('theme_json_url = ?');
    params.push(v.url);
  }

  if (body.name !== undefined) {
    updates.push('name = ?');
    params.push(body.name);
  }

  if (body.slug !== undefined) {
    const nextSlug = slugify(body.slug.trim());
    if (!nextSlug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid slug'
      });
    }
    const slugTaken = await db.prepare(
      'SELECT id FROM themes WHERE slug = ? AND id != ?'
    )
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
    params.push(body.description);
  }

  if (body.author !== undefined) {
    updates.push('author = ?');
    params.push(body.author);
  }

  if (body.license !== undefined) {
    updates.push('license = ?');
    params.push(body.license);
  }

  if (body.version !== undefined) {
    updates.push('version = ?');
    params.push(body.version);
  }

  if (body.category !== undefined) {
    updates.push('category = ?');
    params.push(body.category);
  }

  if (body.tags !== undefined) {
    updates.push('tags = ?');
    params.push(JSON.stringify(body.tags));
  }

  if (body.featured !== undefined) {
    updates.push('featured = ?');
    params.push(body.featured ? 1 : 0);
  }

  if (body.compatibility_min !== undefined) {
    updates.push('compatibility_min = ?');
    const min = typeof body.compatibility_min === 'string' ? body.compatibility_min.trim() : '';
    params.push(min || '0.0.0');
  }

  if (body.compatibility_max !== undefined) {
    updates.push('compatibility_max = ?');
    const max =
      typeof body.compatibility_max === 'string' && body.compatibility_max.trim()
        ? body.compatibility_max.trim()
        : null;
    params.push(max);
  }

  if (body.flavour_master_id !== undefined || body.flavour_sort_order !== undefined) {
    if (existing.theme_type !== 'betterseqta') {
      throw createError({
        statusCode: 400,
        statusMessage: 'flavour_master_id / flavour_sort_order apply only to BetterSEQTA themes'
      });
    }
  }

  if (body.flavour_master_id !== undefined) {
    const fid = body.flavour_master_id;
    if (fid === null || fid === '') {
      updates.push('flavour_master_id = ?');
      params.push(null);
      updates.push('flavour_sort_order = ?');
      params.push(0);
    } else {
      const mid = String(fid).trim();
      if (mid === id) {
        throw createError({
          statusCode: 400,
          statusMessage: 'A theme cannot be its own flavour master'
        });
      }

      const hasSlaves = await db
        .prepare('SELECT COUNT(*) as n FROM themes WHERE flavour_master_id = ?')
        .bind(id)
        .first() as { n: number };
      if (hasSlaves?.n && hasSlaves.n > 0) {
        throw createError({
          statusCode: 400,
          statusMessage:
            'Detach or re-home existing flavour variants before this theme can become a slave of another master'
        });
      }

      const masterRow = await db
        .prepare(
          'SELECT id, theme_type, flavour_master_id FROM themes WHERE id = ?'
        )
        .bind(mid)
        .first() as
        | {
            id: string;
            theme_type?: string;
            flavour_master_id?: string | null;
          }
        | null;

      if (!masterRow) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Flavour master theme not found'
        });
      }
      if (masterRow.theme_type !== 'betterseqta') {
        throw createError({
          statusCode: 400,
          statusMessage: 'Flavour master must be a BetterSEQTA theme'
        });
      }
      if (masterRow.flavour_master_id) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Flavour master must be a standalone or master theme (not a slave)'
        });
      }

      updates.push('flavour_master_id = ?');
      params.push(mid);

      const nextSortRaw =
        body.flavour_sort_order !== undefined
          ? Number(body.flavour_sort_order)
          : existing.flavour_master_id === mid
            ? Number(existing.flavour_sort_order ?? 0)
            : 0;

      updates.push('flavour_sort_order = ?');
      params.push(Number.isFinite(nextSortRaw) ? nextSortRaw : 0);
    }
  } else if (body.flavour_sort_order !== undefined) {
    const n = Number(body.flavour_sort_order);
    if (existing.theme_type !== 'betterseqta') {
      throw createError({ statusCode: 400, statusMessage: 'flavour_sort_order applies only to BetterSEQTA themes' });
    }
    const mid = typeof existing.flavour_master_id === 'string' ? existing.flavour_master_id.trim() : '';
    if (!mid) {
      throw createError({
        statusCode: 400,
        statusMessage: 'flavour_sort_order applies only when this theme is a flavour slave (set flavour_master_id first)'
      });
    }
    updates.push('flavour_sort_order = ?');
    params.push(Number.isFinite(n) ? n : 0);
  }

  if (updates.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No fields to update'
    });
  }

  updates.push('updated_at = ?');
  params.push(Date.now(), id);

  await db.prepare(
    `UPDATE themes SET ${updates.join(', ')} WHERE id = ?`
  ).bind(...params).run();

  // Get updated theme
  const theme = await db.prepare(
    'SELECT * FROM themes WHERE id = ?'
  ).bind(id).first() as any;

  return {
    success: true,
    data: {
      theme: {
        id: theme.id,
        name: theme.name,
        slug: theme.slug,
        version: theme.version,
        description: theme.description,
        author: theme.author,
        license: theme.license,
        category: theme.category,
        tags: theme.tags ? JSON.parse(theme.tags) : [],
        status: theme.status,
        featured: Boolean(theme.featured),
        download_count: theme.download_count,
        favorite_count: theme.favorite_count,
        rating_average: theme.rating_average,
        rating_count: theme.rating_count,
        compatibility: {
          min: theme.compatibility_min,
          max: theme.compatibility_max || undefined
        },
        theme_json_url: theme.theme_json_url,
        is_pseudo_theme: Boolean(theme.is_pseudo_theme)
      }
    },
    error: null,
    meta: {
      timestamp: Date.now(),
      version: '1.0.0'
    }
  };
});
