import { getDB } from '../../../utils/db';
import { requireAdmin } from '../../../utils/auth';

interface UpdateThemeBody {
  name?: string;
  description?: string;
  category?: string;
  tags?: string[];
  featured?: boolean;
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

  if (body.description !== undefined) {
    updates.push('description = ?');
    params.push(body.description);
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
        rating_count: theme.rating_count
      }
    },
    error: null,
    meta: {
      timestamp: Date.now(),
      version: '1.0.0'
    }
  };
});
