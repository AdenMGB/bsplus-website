import { t as getDB } from "./db.js";
import { t as getBucket } from "./r2.js";
import { n as requireAdmin } from "./auth2.js";
//#region server/api/admin/collections/[id].delete.ts
var _id__delete_default = defineEventHandler(async (event) => {
	await requireAdmin(event);
	const db = getDB(event);
	const bucket = getBucket(event);
	const id = getRouterParam(event, "id");
	if (!id) throw createError({
		statusCode: 400,
		statusMessage: "Collection ID is required"
	});
	const collection = await db.prepare("SELECT cover_image_url FROM collections WHERE id = ?").bind(id).first();
	if (!collection) throw createError({
		statusCode: 404,
		statusMessage: "Collection not found"
	});
	if (collection.cover_image_url) try {
		const coverKey = collection.cover_image_url.replace("/api/images/", "");
		await bucket.delete(coverKey);
	} catch (error) {
		console.error("Error deleting cover image:", error);
	}
	await db.prepare("DELETE FROM collections WHERE id = ?").bind(id).run();
	return {
		success: true,
		data: { message: "Collection deleted successfully" },
		error: null,
		meta: {
			timestamp: Date.now(),
			version: "1.0.0"
		}
	};
});
//#endregion
export { _id__delete_default as default };
