import { getDB } from '../../../utils/db';
import { getBucket } from '../../../utils/r2';
import { requireAdmin } from '../../../utils/auth';
import { slugify, generateUUID } from '../../../utils/themes';

interface CreateCollectionBody {
  name: string;
  description?: string;
  slug?: string;
  theme_ids: string[];
  cover_image?: string; // base64 or URL
  featured?: boolean;
}

export default defineEventHandler(async (event) => {
  const adminUser = await requireAdmin(event);
  const db = getDB(event);
  const bucket = getBucket(event);
  const body = await readBody<CreateCollectionBody>(event);

  if (!body.name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Collection name is required'
    });
  }

  if (!body.theme_ids || body.theme_ids.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'At least one theme ID is required'
    });
  }

  const collectionId = generateUUID();
  const collectionSlug = body.slug || slugify(body.name);

  // Check for duplicate slug
  const existing = await db.prepare(
    'SELECT id FROM collections WHERE slug = ?'
  ).bind(collectionSlug).first();

  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: `Collection with slug "${collectionSlug}" already exists`
    });
  }

  // Handle cover image upload if provided
  let coverImageUrl: string | null = null;
  if (body.cover_image) {
    if (body.cover_image.startsWith('data:')) {
      // Base64 image
      const matches = body.cover_image.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        const contentType = matches[1];
        const base64Data = matches[2];
        const imageBuffer = Buffer.from(base64Data, 'base64');
        
        const coverKey = `collections/${collectionId}/cover.jpg`;
        await bucket.put(coverKey, imageBuffer, {
          httpMetadata: {
            contentType: contentType || 'image/jpeg',
          },
        });
        coverImageUrl = `/api/images/${coverKey}`;
      }
    } else if (body.cover_image.startsWith('/api/images/')) {
      // Already uploaded
      coverImageUrl = body.cover_image;
    }
  }

  const now = Date.now();

  await db.prepare(
    `INSERT INTO collections (id, name, description, slug, cover_image_url, featured, theme_ids, created_by, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    collectionId,
    body.name,
    body.description || null,
    collectionSlug,
    coverImageUrl,
    body.featured ? 1 : 0,
    JSON.stringify(body.theme_ids),
    adminUser.id,
    now,
    now
  ).run();

  const collection = await db.prepare(
    'SELECT * FROM collections WHERE id = ?'
  ).bind(collectionId).first() as any;

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
        theme_ids: JSON.parse(collection.theme_ids),
        created_at: collection.created_at
      }
    },
    error: null,
    meta: {
      timestamp: Date.now(),
      version: '1.0.0'
    }
  };
});
