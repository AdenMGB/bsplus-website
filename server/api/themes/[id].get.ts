import { getDB } from '../../utils/db';
import { getOptionalUser } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const db = getDB(event);
  const id = getRouterParam(event, 'id');
  const user = await getOptionalUser(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Theme ID is required'
    });
  }

  // Get theme
  const theme = await db.prepare(
    'SELECT * FROM themes WHERE id = ? AND status = ?'
  ).bind(id, 'approved').first() as any;

  if (!theme) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Theme not found'
    });
  }

  // Check if favorited
  let isFavorited = false;
  if (user) {
    const favorite = await db.prepare(
      'SELECT id FROM user_favorites WHERE user_id = ? AND theme_id = ?'
    ).bind(user.id, id).first();
    isFavorited = !!favorite;
  }

  // Parse manifest from ZIP (for now, we'll store it separately or reconstruct from DB)
  // For full manifest, we'd need to fetch from ZIP, but for MVP we can reconstruct
  const manifest = {
    name: theme.name,
    version: theme.version,
    description: theme.description,
    author: theme.author,
    license: theme.license,
    compatibility: {
      minVersion: theme.compatibility_min,
      maxVersion: theme.compatibility_max || undefined
    },
    preview: {
      thumbnail: theme.preview_thumbnail_url,
      screenshots: theme.preview_screenshots ? JSON.parse(theme.preview_screenshots) : []
    }
  };

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
        preview: {
          thumbnail: theme.preview_thumbnail_url,
          screenshots: theme.preview_screenshots ? JSON.parse(theme.preview_screenshots) : []
        },
        preview_thumbnail_url: theme.preview_thumbnail_url,
        zip_download_url: theme.zip_download_url,
        file_size: theme.file_size,
        checksum: theme.checksum,
        created_at: theme.created_at,
        updated_at: theme.updated_at,
        published_at: theme.published_at,
        is_favorited: isFavorited,
        manifest
      }
    },
    error: null,
    meta: {
      timestamp: Date.now(),
      version: '1.0.0'
    }
  };
});
