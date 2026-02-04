import { getDB } from '../../../utils/db';
import { requireAdmin } from '../../../utils/auth';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const db = getDB(event);

  const collectionsResult = await db.prepare(
    'SELECT * FROM collections ORDER BY created_at DESC'
  ).all();

  const collections = await Promise.all(
    collectionsResult.results.map(async (collection: any) => {
      const themeIds = collection.theme_ids ? JSON.parse(collection.theme_ids) : [];
      
      return {
        id: collection.id,
        name: collection.name,
        description: collection.description,
        slug: collection.slug,
        cover_image_url: collection.cover_image_url,
        featured: Boolean(collection.featured),
        theme_count: themeIds.length,
        created_at: collection.created_at,
        updated_at: collection.updated_at
      };
    })
  );

  return {
    success: true,
    data: {
      collections
    },
    error: null,
    meta: {
      timestamp: Date.now(),
      version: '1.0.0'
    }
  };
});
