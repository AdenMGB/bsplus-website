import { t as getDB } from "./db.js";
import { n as requireAdmin } from "./auth2.js";
//#region server/api/admin/themes/[id]/reject.post.ts
var reject_post_default = defineEventHandler(async (event) => {
	const adminUser = await requireAdmin(event);
	const db = getDB(event);
	const id = getRouterParam(event, "id");
	const body = await readBody(event);
	if (!id) throw createError({
		statusCode: 400,
		statusMessage: "Theme ID is required"
	});
	if (!body.reason) throw createError({
		statusCode: 400,
		statusMessage: "Rejection reason is required"
	});
	if (!await db.prepare("SELECT id, status FROM themes WHERE id = ?").bind(id).first()) throw createError({
		statusCode: 404,
		statusMessage: "Theme not found"
	});
	const now = Date.now();
	await db.prepare("UPDATE themes SET status = ?, updated_at = ? WHERE id = ?").bind("rejected", now, id).run();
	await db.prepare(`UPDATE theme_submissions 
     SET status = ?, reviewed_by = ?, reviewed_at = ?, rejection_reason = ?
     WHERE theme_id = ?`).bind("rejected", adminUser.id, now, body.reason, id).run();
	return {
		success: true,
		data: { message: "Theme rejected successfully" },
		error: null,
		meta: {
			timestamp: Date.now(),
			version: "1.0.0"
		}
	};
});
//#endregion
export { reject_post_default as default };
