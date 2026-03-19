import { t as getDB } from "./db.js";
import { t as getBucket } from "./r2.js";
//#region server/api/questionnaire/[id].delete.ts
var _id__delete_default = defineEventHandler(async (event) => {
	const user = await $fetch("/api/auth/me", { headers: { cookie: getHeader(event, "cookie") || "" } }).catch(() => null);
	if (!user || !user.admin_level || user.admin_level < 1) throw createError({
		statusCode: 403,
		message: "Forbidden"
	});
	const id = event.path.split("/").pop();
	if (!id) throw createError({
		statusCode: 400,
		message: "Invalid question ID"
	});
	const db = getDB(event);
	try {
		const question = await db.prepare("SELECT cover_image FROM daily_questions WHERE id = ?").bind(id).first();
		if (!question) throw createError({
			statusCode: 404,
			message: "Question not found"
		});
		if (question.cover_image && question.cover_image.startsWith("/api/images/")) {
			const imageKey = question.cover_image.replace("/api/images/", "");
			try {
				await getBucket(event).delete(imageKey);
				console.log(`[Questionnaire] Deleted cover image: ${imageKey}`);
			} catch (e) {
				console.error("[Questionnaire] Failed to delete cover image:", e);
			}
		}
		await db.prepare("DELETE FROM question_votes WHERE question_id = ?").bind(id).run();
		await db.prepare("DELETE FROM question_results WHERE question_id = ?").bind(id).run();
		await db.prepare("DELETE FROM daily_questions WHERE id = ?").bind(id).run();
		return { success: true };
	} catch (e) {
		console.error("[Questionnaire] Failed to delete question:", e);
		if (e.statusCode) throw e;
		throw createError({
			statusCode: 500,
			message: "Failed to delete question",
			cause: e
		});
	}
});
//#endregion
export { _id__delete_default as default };
