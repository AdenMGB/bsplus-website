import { t as getDB } from "./db.js";
//#region server/api/questionnaire/reorder.post.ts
var reorder_post_default = defineEventHandler(async (event) => {
	const user = await $fetch("/api/auth/me", { headers: { cookie: getHeader(event, "cookie") || "" } }).catch(() => null);
	if (!user || !user.admin_level || user.admin_level < 1) throw createError({
		statusCode: 403,
		message: "Forbidden"
	});
	const { questionIds } = await readBody(event);
	if (!Array.isArray(questionIds) || questionIds.length === 0) throw createError({
		statusCode: 400,
		message: "questionIds must be a non-empty array"
	});
	const db = getDB(event);
	try {
		const updates = questionIds.map((id, index) => {
			return db.prepare("UPDATE daily_questions SET queue_order = ? WHERE id = ?").bind(index + 1, id);
		});
		await db.batch(updates);
		return { success: true };
	} catch (e) {
		throw createError({
			statusCode: 500,
			message: "Failed to reorder questions",
			cause: e
		});
	}
});
//#endregion
export { reorder_post_default as default };
