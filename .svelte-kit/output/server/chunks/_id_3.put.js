import { t as getDB } from "./db.js";
import { t as getBucket } from "./r2.js";
import { i as getTimezoneLabel, n as convertUTCToACST, r as formatACSTDateTime, t as convertACSTToUTC } from "./timezone.js";
//#region server/api/questionnaire/[id].put.ts
var _id__put_default = defineEventHandler(async (event) => {
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
	const body = await readBody(event);
	const db = getDB(event);
	try {
		const existing = await db.prepare("SELECT * FROM daily_questions WHERE id = ?").bind(id).first();
		if (!existing) throw createError({
			statusCode: 404,
			message: "Question not found"
		});
		let oldCoverImage = null;
		if (body.cover_image !== void 0 && body.cover_image !== existing.cover_image) oldCoverImage = existing.cover_image;
		const updates = [];
		const values = [];
		if (body.question !== void 0) {
			updates.push("question = ?");
			values.push(body.question);
		}
		if (body.options !== void 0) {
			if (!Array.isArray(body.options) || body.options.length < 2 || body.options.length > 4) throw createError({
				statusCode: 400,
				message: "Options must be an array with 2-4 items"
			});
			updates.push("option1 = ?");
			updates.push("option2 = ?");
			updates.push("option3 = ?");
			updates.push("option4 = ?");
			values.push(body.options[0], body.options[1], body.options[2] || null, body.options[3] || null);
		}
		if (body.expiresAt !== void 0) {
			let expiresAtUTC;
			try {
				expiresAtUTC = convertACSTToUTC(body.expiresAt);
			} catch (e) {
				throw createError({
					statusCode: 400,
					message: `Invalid expiresAt format: ${e.message}`
				});
			}
			const now = Math.floor(Date.now() / 1e3);
			if (expiresAtUTC <= now && !existing.is_active) {} else if (expiresAtUTC <= now) throw createError({
				statusCode: 400,
				message: "Expiration date must be in the future for active questions"
			});
			updates.push("expires_at = ?");
			values.push(expiresAtUTC);
		}
		if (body.cover_image !== void 0) {
			updates.push("cover_image = ?");
			updates.push("cover_image_uploaded_at = ?");
			values.push(body.cover_image || null, body.cover_image ? Math.floor(Date.now() / 1e3) : null);
		}
		if (body.is_active !== void 0) {
			updates.push("is_active = ?");
			values.push(body.is_active ? 1 : 0);
			if (body.is_active) await db.prepare("UPDATE daily_questions SET is_active = 0 WHERE id != ? AND is_active = 1").bind(id).run();
		}
		if (updates.length === 0) throw createError({
			statusCode: 400,
			message: "No fields to update"
		});
		values.push(id);
		await db.prepare(`
      UPDATE daily_questions 
      SET ${updates.join(", ")}
      WHERE id = ?
    `).bind(...values).run();
		if (oldCoverImage && oldCoverImage.startsWith("/api/images/")) {
			const imageKey = oldCoverImage.replace("/api/images/", "");
			try {
				await getBucket(event).delete(imageKey);
				console.log(`[Questionnaire] Deleted old cover image: ${imageKey}`);
			} catch (e) {
				console.error("[Questionnaire] Failed to delete old cover image:", e);
			}
		}
		const updated = await db.prepare("SELECT * FROM daily_questions WHERE id = ?").bind(id).first();
		return {
			id: updated.id,
			question: updated.question,
			options: [
				updated.option1,
				updated.option2,
				updated.option3,
				updated.option4
			].filter(Boolean),
			cover_image: updated.cover_image,
			expires_at: updated.expires_at,
			expires_at_acst: convertUTCToACST(updated.expires_at),
			expires_at_formatted: formatACSTDateTime(updated.expires_at),
			timezone_label: getTimezoneLabel(updated.expires_at),
			created_at: updated.created_at,
			is_active: updated.is_active
		};
	} catch (e) {
		console.error("[Questionnaire] Failed to update question:", e);
		if (e.statusCode) throw e;
		throw createError({
			statusCode: 500,
			message: "Failed to update question",
			cause: e
		});
	}
});
//#endregion
export { _id__put_default as default };
