import { t as getDB } from "./db.js";
import { n as requireAdmin } from "./auth2.js";
//#region server/api/admin/collections/[id].put.ts
var _id__put_default = defineEventHandler(async (event) => {
	await requireAdmin(event);
	const db = getDB(event);
	const id = getRouterParam(event, "id");
	const body = await readBody(event);
	if (!id) throw createError({
		statusCode: 400,
		statusMessage: "Collection ID is required"
	});
	if (!await db.prepare("SELECT id FROM collections WHERE id = ?").bind(id).first()) throw createError({
		statusCode: 404,
		statusMessage: "Collection not found"
	});
	const updates = [];
	const params = [];
	if (body.name !== void 0) {
		updates.push("name = ?");
		params.push(body.name);
	}
	if (body.description !== void 0) {
		updates.push("description = ?");
		params.push(body.description);
	}
	if (body.theme_ids !== void 0) {
		updates.push("theme_ids = ?");
		params.push(JSON.stringify(body.theme_ids));
	}
	if (body.featured !== void 0) {
		updates.push("featured = ?");
		params.push(body.featured ? 1 : 0);
	}
	if (updates.length === 0) throw createError({
		statusCode: 400,
		statusMessage: "No fields to update"
	});
	updates.push("updated_at = ?");
	params.push(Date.now(), id);
	await db.prepare(`UPDATE collections SET ${updates.join(", ")} WHERE id = ?`).bind(...params).run();
	const collection = await db.prepare("SELECT * FROM collections WHERE id = ?").bind(id).first();
	return {
		success: true,
		data: { collection: {
			id: collection.id,
			name: collection.name,
			description: collection.description,
			slug: collection.slug,
			cover_image_url: collection.cover_image_url,
			featured: Boolean(collection.featured),
			theme_ids: collection.theme_ids ? JSON.parse(collection.theme_ids) : [],
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
export { _id__put_default as default };
