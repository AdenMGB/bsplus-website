import { t as getDB } from "./db.js";
import { i as getTimezoneLabel, n as convertUTCToACST, r as formatACSTDateTime, t as convertACSTToUTC } from "./timezone.js";
//#region server/api/questionnaire/create.post.ts
var create_post_default = defineEventHandler(async (event) => {
	const user = await $fetch("/api/auth/me", { headers: { cookie: getHeader(event, "cookie") || "" } }).catch(() => null);
	if (!user || !user.admin_level || user.admin_level < 1) throw createError({
		statusCode: 403,
		message: "Forbidden"
	});
	const { question, options, expiresAt, cover_image, duration, auto_activate, queue_order } = await readBody(event);
	if (!question || !options) throw createError({
		statusCode: 400,
		message: "Missing required fields: question, options"
	});
	if (!Array.isArray(options) || options.length < 2 || options.length > 4) throw createError({
		statusCode: 400,
		message: "Options must be an array with 2-4 items"
	});
	const now = Math.floor(Date.now() / 1e3);
	let expiresAtUTC;
	let isActive = 0;
	if (auto_activate && duration) {
		expiresAtUTC = now + duration;
		isActive = 0;
	} else if (expiresAt) {
		try {
			expiresAtUTC = convertACSTToUTC(expiresAt);
		} catch (e) {
			throw createError({
				statusCode: 400,
				message: `Invalid expiresAt format: ${e.message}`
			});
		}
		if (expiresAtUTC <= now) throw createError({
			statusCode: 400,
			message: "Expiration date must be in the future"
		});
		isActive = 1;
	} else throw createError({
		statusCode: 400,
		message: "Either expiresAt (manual) or duration (queue) must be provided"
	});
	const db = getDB(event);
	try {
		if (!auto_activate) await db.prepare("UPDATE daily_questions SET is_active = 0 WHERE is_active = 1").run();
		const questionId = crypto.randomUUID();
		const coverImageUploadedAt = cover_image ? Math.floor(Date.now() / 1e3) : null;
		await db.prepare(`
      INSERT INTO daily_questions (
        id, question, option1, option2, option3, option4, 
        cover_image, cover_image_uploaded_at, expires_at, created_at, is_active,
        duration, auto_activate, queue_order
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), ?, ?, ?, ?)
    `).bind(questionId, question, options[0], options[1], options[2] || null, options[3] || null, cover_image || null, coverImageUploadedAt, expiresAtUTC, isActive, duration || null, auto_activate ? 1 : 0, queue_order || null).run();
		await db.prepare(`
      INSERT INTO question_results (question_id, option1_count, option2_count, option3_count, option4_count, total_votes, last_updated)
      VALUES (?, 0, 0, 0, 0, 0, unixepoch())
    `).bind(questionId).run();
		const createdQuestion = await db.prepare(`
      SELECT * FROM daily_questions WHERE id = ?
    `).bind(questionId).first();
		return {
			id: createdQuestion.id,
			question: createdQuestion.question,
			options: [
				createdQuestion.option1,
				createdQuestion.option2,
				createdQuestion.option3,
				createdQuestion.option4
			].filter(Boolean),
			cover_image: createdQuestion.cover_image,
			expires_at: createdQuestion.expires_at,
			expires_at_acst: convertUTCToACST(createdQuestion.expires_at),
			expires_at_formatted: formatACSTDateTime(createdQuestion.expires_at),
			timezone_label: getTimezoneLabel(createdQuestion.expires_at),
			created_at: createdQuestion.created_at,
			is_active: createdQuestion.is_active
		};
	} catch (e) {
		console.error("[Questionnaire] Failed to create question:", e);
		if (e.statusCode) throw e;
		throw createError({
			statusCode: 500,
			message: "Failed to create question",
			cause: e
		});
	}
});
//#endregion
export { create_post_default as default };
