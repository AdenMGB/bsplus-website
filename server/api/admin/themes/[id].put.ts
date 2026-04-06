import { getDB } from '../../../utils/db';
import { requireAdmin } from '../../../utils/auth';
import { slugify } from '../../../utils/themes';

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
    'SELECT id FROM themes WHERE id = ?'
  ).bind(id).first();

  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Theme not found'
    });
  }

  // Build update query
  const updates: string[] = [];
  const params: any[] = [];

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
        }
      }
    },
    error: null,
    meta: {
      timestamp: Date.now(),
      version: '1.0.0'
    }
  };
});
