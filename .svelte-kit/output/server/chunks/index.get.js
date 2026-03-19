import { t as getDB } from "./db.js";
import { n as requireAdmin } from "./auth2.js";
//#region server/api/admin/collections/index.get.ts
var index_get_default = defineEventHandler(async (event) => {
	await requireAdmin(event);
	const collectionsResult = await getDB(event).prepare("SELECT * FROM collections ORDER BY created_at DESC").all();
	return {
		success: true,
		data: { collections: await Promise.all(collectionsResult.results.map(async (collection) => {
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
