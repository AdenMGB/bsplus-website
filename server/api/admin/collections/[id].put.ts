import { getDB } from '../../../utils/db';
import { requireAdmin } from '../../../utils/auth';

interface UpdateCollectionBody {
  name?: string;
  description?: string;
  theme_ids?: string[];
  featured?: boolean;
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const db = getDB(event);
  const id = getRouterParam(event, 'id');
  const body = await readBody<UpdateCollectionBody>(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Collection ID is required'
    });
  }

  const existing = await db.prepare(
    'SELECT id FROM collections WHERE id = ?'
  ).bind(id).first();

  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Collection not found'
    });
  }

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

  if (body.theme_ids !== undefined) {
    updates.push('theme_ids = ?');
    params.push(JSON.stringify(body.theme_ids));
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
    `UPDATE collections SET ${updates.join(', ')} WHERE id = ?`
  ).bind(...params).run();

  const collection = await db.prepare(
    'SELECT * FROM collections WHERE id = ?'
  ).bind(id).first() as any;

  return {
    success: true,
    data: {
      collection: {
        id: collection.id,
        name: collection.name,
        description: collection.description,
        slug: collection.slug,
        cover_image_url: collection.cover_image_url,
        featured: Boolean(collection.featured),
        theme_ids: collection.theme_ids ? JSON.parse(collection.theme_ids) : [],
        created_at: collection.created_at,
        updated_at: collection.updated_at
      }
    },
    error: null,
    meta: {
      timestamp: Date.now(),
      version: '1.0.0'
    }
  };
});
