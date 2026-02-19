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

  const themeType = theme.theme_type || 'desqta';

  const manifest = themeType === 'desqta' ? {
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
  } : undefined;

  const baseTheme = {
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
      thumbnail: theme.preview_thumbnail_url || theme.cover_image_url,
      screenshots: theme.preview_screenshots ? JSON.parse(theme.preview_screenshots) : []
    },
    created_at: theme.created_at,
    updated_at: theme.updated_at,
    published_at: theme.published_at,
    is_favorited: isFavorited,
    theme_type: themeType
  };

  const themeData = themeType === 'betterseqta'
    ? {
        ...baseTheme,
        coverImage: theme.cover_image_url,
        marqueeImage: theme.marquee_image_url,
        theme_json_url: theme.theme_json_url
      }
    : {
        ...baseTheme,
        preview_thumbnail_url: theme.preview_thumbnail_url,
        zip_download_url: theme.zip_download_url,
        file_size: theme.file_size,
        checksum: theme.checksum,
        manifest
      };

  return {
    success: true,
    data: {
      theme: themeData
    },
    error: null,
    meta: {
      timestamp: Date.now(),
      version: '1.0.0'
    }
  };
});
