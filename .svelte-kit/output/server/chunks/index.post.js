import { t as getDB } from "./db.js";
import { t as getBucket } from "./r2.js";
import { n as requireAdmin } from "./auth2.js";
import { c as slugify, i as generateUUID } from "./themes.js";
//#region server/api/admin/collections/index.post.ts
var index_post_default = defineEventHandler(async (event) => {
	const adminUser = await requireAdmin(event);
	const db = getDB(event);
	const bucket = getBucket(event);
	const body = await readBody(event);
	if (!body.name) throw createError({
		statusCode: 400,
		statusMessage: "Collection name is required"
	});
	if (!body.theme_ids || body.theme_ids.length === 0) throw createError({
		statusCode: 400,
		statusMessage: "At least one theme ID is required"
	});
	const collectionId = generateUUID();
	const collectionSlug = body.slug || slugify(body.name);
	if (await db.prepare("SELECT id FROM collections WHERE slug = ?").bind(collectionSlug).first()) throw createError({
		statusCode: 409,
		statusMessage: `Collection with slug "${collectionSlug}" already exists`
	});
	let coverImageUrl = null;
	if (body.cover_image) {
		if (body.cover_image.startsWith("data:")) {
			const matches = body.cover_image.match(/^data:([^;]+);base64,(.+)$/);
			if (matches) {
				const contentType = matches[1];
				const base64Data = matches[2];
				const imageBuffer = Buffer.from(base64Data, "base64");
				const coverKey = `collections/${collectionId}/cover.jpg`;
				await bucket.put(coverKey, imageBuffer, { httpMetadata: { contentType: contentType || "image/jpeg" } });
				coverImageUrl = `/api/images/${coverKey}`;
			}
		} else if (body.cover_image.startsWith("/api/images/")) coverImageUrl = body.cover_image;
	}
	const now = Date.now();
	await db.prepare(`INSERT INTO collections (id, name, description, slug, cover_image_url, featured, theme_ids, created_by, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(collectionId, body.name, body.description || null, collectionSlug, coverImageUrl, body.featured ? 1 : 0, JSON.stringify(body.theme_ids), adminUser.id, now, now).run();
	const collection = await db.prepare("SELECT * FROM collections WHERE id = ?").bind(collectionId).first();
	return {
		success: true,
		data: { collection: {
			id: collection.id,
			name: collection.name,
			description: collection.description,
			slug: collection.slug,
			cover_image_url: collection.cover_image_url,
			featured: Boolean(collection.featured),
			theme_ids: JSON.parse(collection.theme_ids),
			created_at: collection.created_at
		} },
		error: null,
		meta: {
			timestamp: Date.now(),
			version: "1.0.0"
		}
	};
});
//#endregion
export { index_post_default as default };
