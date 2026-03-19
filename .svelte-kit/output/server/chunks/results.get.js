import { t as getDB } from "./db.js";
import { n as getQuestionnaireBufferStats } from "./questionnaire.js";
//#region server/api/questionnaire/results.get.ts
var results_get_default = defineEventHandler(async (event) => {
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
		if (!await db.prepare(`
      SELECT id FROM question_votes 
      WHERE question_id = ? AND user_id = ?
    `).bind(questionId, user.id).first()) throw createError({
			statusCode: 403,
			message: "You must vote before viewing results"
		});
		const question = await db.prepare(`
      SELECT * FROM daily_questions WHERE id = ?
    `).bind(questionId).first();
		if (!question) throw createError({
			statusCode: 404,
			message: "Question not found"
		});
		const results = await db.prepare(`
      SELECT * FROM question_results WHERE question_id = ?
    `).bind(questionId).first();
		getQuestionnaireBufferStats();
		const optionCounts = {
			1: results?.option1_count || 0,
			2: results?.option2_count || 0,
			3: results?.option3_count || 0,
			4: results?.option4_count || 0
		};
		const totalVotes = results?.total_votes || 0;
		const options = [];
		for (let i = 1; i <= 4; i++) {
			const optionKey = `option${i}`;
			if (question[optionKey]) {
				const count = optionCounts[i];
				const percentage = totalVotes > 0 ? Math.round(count / totalVotes * 100) : 0;
				options.push({
					index: i,
					text: question[optionKey],
					count,
					percentage
				});
			}
		}
		return {
			questionId,
			totalVotes,
			options
		};
	} catch (e) {
		console.error("[Questionnaire] Failed to get results:", e);
		if (e.statusCode) throw e;
		throw createError({
			statusCode: 500,
			message: "Failed to get results",
			cause: e
		});
	}
});
//#endregion
export { results_get_default as default };
