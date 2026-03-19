import { t as getDB } from "./db.js";
import { n as requireAdmin } from "./auth2.js";
//#region server/api/admin/themes/[id].put.ts
var _id__put_default = defineEventHandler(async (event) => {
	await requireAdmin(event);
	const db = getDB(event);
	const id = getRouterParam(event, "id");
	const body = await readBody(event);
	if (!id) throw createError({
		statusCode: 400,
		statusMessage: "Theme ID is required"
	});
	if (!await db.prepare("SELECT id FROM themes WHERE id = ?").bind(id).first()) throw createError({
		statusCode: 404,
		statusMessage: "Theme not found"
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
	if (body.category !== void 0) {
		updates.push("category = ?");
		params.push(body.category);
	}
	if (body.tags !== void 0) {
		updates.push("tags = ?");
		params.push(JSON.stringify(body.tags));
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
	await db.prepare(`UPDATE themes SET ${updates.join(", ")} WHERE id = ?`).bind(...params).run();
	const theme = await db.prepare("SELECT * FROM themes WHERE id = ?").bind(id).first();
	return {
		success: true,
		data: { theme: {
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
			rating_count: theme.rating_count
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
