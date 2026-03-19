import { t as getDB } from "./db.js";
//#region server/api/questionnaire/vote.post.ts
var vote_post_default = defineEventHandler(async (event) => {
	const user = await $fetch("/api/auth/me", { headers: { cookie: getHeader(event, "cookie") || "" } }).catch(() => null);
	if (!user) throw createError({
		statusCode: 401,
		message: "Unauthorized"
	});
	const { questionId, optionIndex } = await readBody(event);
	if (!questionId || !optionIndex) throw createError({
		statusCode: 400,
		message: "Missing questionId or optionIndex"
	});
	if (optionIndex < 1 || optionIndex > 4) throw createError({
		statusCode: 400,
		message: "optionIndex must be between 1 and 4"
	});
	const db = getDB(event);
	try {
		const question = await db.prepare(`
      SELECT * FROM daily_questions 
      WHERE id = ? AND is_active = 1
    `).bind(questionId).first();
		if (!question) throw createError({
			statusCode: 404,
			message: "Question not found or not active"
		});
		const now = Math.floor(Date.now() / 1e3);
		if (question.expires_at <= now) {
			await db.prepare("UPDATE daily_questions SET is_active = 0 WHERE id = ?").bind(questionId).run();
			throw createError({
				statusCode: 400,
				message: "Question has expired"
			});
		}
		if (!question[`option${optionIndex}`]) throw createError({
			statusCode: 400,
			message: `Option ${optionIndex} does not exist`
		});
		if (await db.prepare(`
      SELECT id FROM question_votes 
      WHERE question_id = ? AND user_id = ?
    `).bind(questionId, user.id).first()) throw createError({
			statusCode: 400,
			message: "You have already voted on this question"
		});
		await db.prepare(`
      INSERT INTO question_votes (question_id, user_id, option_index, created_at)
      VALUES (?, ?, ?, unixepoch())
    `).bind(questionId, user.id, optionIndex).run();
		await db.prepare(`
      INSERT INTO question_results (question_id, option1_count, option2_count, option3_count, option4_count, total_votes, last_updated)
      VALUES (?, 0, 0, 0, 0, 0, unixepoch())
      ON CONFLICT(question_id) DO UPDATE SET last_updated = unixepoch()
    `).bind(questionId).run();
		const optionColumn = `option${optionIndex}_count`;
		await db.prepare(`
      UPDATE question_results 
      SET ${optionColumn} = ${optionColumn} + 1, 
          total_votes = total_votes + 1,
          last_updated = unixepoch()
      WHERE question_id = ?
    `).bind(questionId).run();
		return { success: true };
	} catch (e) {
		if (e.statusCode) throw e;
		throw createError({
			statusCode: 500,
			message: "Failed to record vote",
			cause: e
		});
	}
});
//#endregion
export { vote_post_default as default };
