import { getDB } from '../../../utils/db';
import { requireAdmin } from '../../../utils/auth';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const db = getDB(event);
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Theme ID is required'
    });
  }

  // Get theme with submission data
  const theme = await db.prepare(
    `SELECT t.*, ts.submission_notes, ts.reviewed_by, ts.reviewed_at, ts.rejection_reason 
     FROM themes t
     LEFT JOIN theme_submissions ts ON t.id = ts.theme_id
     WHERE t.id = ?`
  ).bind(id).first() as any;

  if (!theme) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Theme not found'
    });
  }

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
        preview_screenshots: theme.preview_screenshots,
        zip_download_url: theme.zip_download_url,
        file_size: theme.file_size,
        checksum: theme.checksum,
        created_at: theme.created_at,
        updated_at: theme.updated_at,
        published_at: theme.published_at,
        submission_notes: theme.submission_notes,
        reviewed_by: theme.reviewed_by,
        reviewed_at: theme.reviewed_at,
        rejection_reason: theme.rejection_reason
      }
    },
    error: null,
    meta: {
      timestamp: Date.now(),
      version: '1.0.0'
    }
  };
});
