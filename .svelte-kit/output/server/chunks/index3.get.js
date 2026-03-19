import { t as getDB } from "./db.js";
//#region server/api/collections/index.get.ts
var index_get_default = defineEventHandler(async (event) => {
	const db = getDB(event);
	const featured = getQuery(event).featured === "true";
	let queryStr = "SELECT * FROM collections";
	const params = [];
	if (featured) queryStr += " WHERE featured = 1";
	queryStr += " ORDER BY created_at DESC";
	const collectionsResult = await db.prepare(queryStr).bind(...params).all();
	return {
		success: true,
		data: { collections: await Promise.all(collectionsResult.results.map(async (collection) => {
			const themeIds = collection.theme_ids ? JSON.parse(collection.theme_ids) : [];
			let themeCount = 0;
			let themes = [];
			if (themeIds.length > 0) {
				const placeholders = themeIds.map(() => "?").join(",");
				const themesResult = await db.prepare(`SELECT id, name, slug, version, description, author, preview_thumbnail_url, 
           download_count, favorite_count, rating_average, rating_count
           FROM themes 
           WHERE id IN (${placeholders}) AND status = 'approved'
           LIMIT 20`).bind(...themeIds).all();
				themeCount = themesResult.results.length;
				themes = themesResult.results.map((theme) => ({
					id: theme.id,
					name: theme.name,
					slug: theme.slug,
					version: theme.version,
					description: theme.description,
					author: theme.author,
					preview: { thumbnail: theme.preview_thumbnail_url },
					download_count: theme.download_count,
					favorite_count: theme.favorite_count,
					rating_average: theme.rating_average,
					rating_count: theme.rating_count
				}));
			}
			return {
				id: collection.id,
				name: collection.name,
				description: collection.description,
				slug: collection.slug,
				cover_image_url: collection.cover_image_url,
				featured: Boolean(collection.featured),
				theme_count: themeCount,
				themes,
				created_at: collection.created_at
			};
		})) },
		error: null,
		meta: {
			timestamp: Date.now(),
			version: "1.0.0"
		}
	};
});
//#endregion
export { index_get_default as default };
