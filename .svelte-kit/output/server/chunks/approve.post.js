import { t as getDB } from "./db.js";
import { n as requireAdmin } from "./auth2.js";
//#region server/api/admin/themes/[id]/approve.post.ts
var approve_post_default = defineEventHandler(async (event) => {
	const adminUser = await requireAdmin(event);
	const db = getDB(event);
	const id = getRouterParam(event, "id");
	const body = await readBody(event);
	if (!id) throw createError({
		statusCode: 400,
		statusMessage: "Theme ID is required"
	});
	if (!await db.prepare("SELECT id, status FROM themes WHERE id = ?").bind(id).first()) throw createError({
		statusCode: 404,
		statusMessage: "Theme not found"
	});
	const now = Date.now();
	await db.prepare("UPDATE themes SET status = ?, published_at = ?, updated_at = ? WHERE id = ?").bind("approved", now, now, id).run();
	await db.prepare(`UPDATE theme_submissions 
     SET status = ?, reviewed_by = ?, reviewed_at = ?, submission_notes = ?
     WHERE theme_id = ?`).bind("approved", adminUser.id, now, body.notes || null, id).run();
	return {
		success: true,
		data: { message: "Theme approved successfully" },
		error: null,
		meta: {
			timestamp: Date.now(),
			version: "1.0.0"
		}
	};
});
//#endregion
export { approve_post_default as default };
