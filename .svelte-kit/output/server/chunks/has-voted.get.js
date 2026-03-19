import { t as getDB } from "./db.js";
//#region server/api/questionnaire/has-voted.get.ts
var has_voted_get_default = defineEventHandler(async (event) => {
	const user = await $fetch("/api/auth/me", { headers: { cookie: getHeader(event, "cookie") || "" } }).catch(() => null);
	if (!user) throw createError({
		statusCode: 401,
		message: "Unauthorized"
	});
	const questionId = getQuery(event).questionId;
	if (!questionId) throw createError({
		statusCode: 400,
		message: "Missing questionId parameter"
	});
	const db = getDB(event);
	try {
		return { hasVoted: !!await db.prepare(`
      SELECT id FROM question_votes 
      WHERE question_id = ? AND user_id = ?
    `).bind(questionId, user.id).first() };
	} catch (e) {
		console.error("[Questionnaire] Failed to check vote status:", e);
		throw createError({
			statusCode: 500,
			message: "Failed to check vote status",
			cause: e
		});
	}
});
//#endregion
export { has_voted_get_default as default };
