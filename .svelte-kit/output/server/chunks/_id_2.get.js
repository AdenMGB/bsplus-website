import { t as getDB } from "./db.js";
//#region server/api/collections/[id].get.ts
var _id__get_default = defineEventHandler(async (event) => {
	const db = getDB(event);
	const id = getRouterParam(event, "id");
	if (!id) throw createError({
		statusCode: 400,
		statusMessage: "Collection ID is required"
	});
	const collection = await db.prepare("SELECT * FROM collections WHERE id = ?").bind(id).first();
	if (!collection) throw createError({
		statusCode: 404,
		statusMessage: "Collection not found"
	});
	const themeIds = collection.theme_ids ? JSON.parse(collection.theme_ids) : [];
	let themes = [];
	if (themeIds.length > 0) {
		const placeholders = themeIds.map(() => "?").join(",");
		themes = (await db.prepare(`SELECT * FROM themes 
       WHERE id IN (${placeholders}) AND status = 'approved'
       ORDER BY created_at DESC`).bind(...themeIds).all()).results.map((theme) => ({
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
				max: theme.compatibility_max || void 0
			},
			preview: {
				thumbnail: theme.preview_thumbnail_url,
				screenshots: theme.preview_screenshots ? JSON.parse(theme.preview_screenshots) : []
			},
			created_at: theme.created_at,
			updated_at: theme.updated_at,
			published_at: theme.published_at,
			file_size: theme.file_size
		}));
	}
	return {
		success: true,
		data: { collection: {
			id: collection.id,
			name: collection.name,
			description: collection.description,
			slug: collection.slug,
			cover_image_url: collection.cover_image_url,
			featured: Boolean(collection.featured),
			theme_count: themes.length,
			themes,
			created_at: collection.created_at,
			updated_at: collection.updated_at
		} },
		error: null,
		meta: {
			timestamp: Date.now(),
			version: "1.0.0"
		}
	};
});
//#endregion
export { _id__get_default as default };
