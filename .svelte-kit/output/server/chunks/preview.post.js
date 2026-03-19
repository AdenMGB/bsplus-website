import { t as getDB } from "./db.js";
//#region server/api/news/preview.post.ts
var preview_post_default = defineEventHandler(async (event) => {
	const user = await $fetch("/api/auth/me", { headers: { cookie: getHeader(event, "cookie") || "" } }).catch(() => null);
	if (!user || !user.admin_level || user.admin_level < 1) throw createError({
		statusCode: 403,
		message: "Forbidden"
	});
	const slug = getQuery(event).slug;
	if (!slug) throw createError({
		statusCode: 400,
		message: "Invalid slug parameter"
	});
	const durationMinutes = (await readBody(event)).duration;
	if (!durationMinutes || typeof durationMinutes !== "number") throw createError({
		statusCode: 400,
		message: "Invalid duration"
	});
	const db = getDB(event);
	try {
		const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
		const expiresAt = Math.floor(Date.now() / 1e3) + durationMinutes * 60;
		if ((await db.prepare(`UPDATE news 
       SET preview_token = ?, preview_expires_at = ?
       WHERE slug = ?`).bind(token, expiresAt, slug).run()).meta.changes === 0) throw createError({
			statusCode: 404,
			message: "Post not found"
		});
		return {
			success: true,
			token,
			expiresAt
		};
	} catch (e) {
		console.error("[API Error] Generate preview failed:", e);
		if (e.statusCode) throw e;
		throw createError({
			statusCode: 500,
			message: "Database error",
			cause: e
		});
	}
});
//#endregion
export { preview_post_default as default };
