import { t as getDB } from "./db.js";
//#region server/api/news/[slug].put.ts
var _slug__put_default = defineEventHandler(async (event) => {
	const user = await $fetch("/api/auth/me", { headers: { cookie: getHeader(event, "cookie") || "" } }).catch(() => null);
	if (!user || !user.admin_level || user.admin_level < 1) throw createError({
		statusCode: 403,
		message: "Forbidden"
	});
	const slug = event.path.split("/").pop();
	const body = await readBody(event);
	if (!slug) throw createError({
		statusCode: 400,
		message: "Invalid slug parameter"
	});
	const db = getDB(event);
	try {
		const existing = await db.prepare("SELECT id FROM news WHERE slug = ?").bind(slug).first();
		if (!existing) throw createError({
			statusCode: 404,
			message: "Post not found"
		});
		if (body.slug !== slug) {
			if (await db.prepare("SELECT id FROM news WHERE slug = ? AND id != ?").bind(body.slug, existing.id).first()) throw createError({
				statusCode: 409,
				message: "Slug already in use"
			});
		}
		await db.prepare(`UPDATE news 
       SET title = ?, slug = ?, content = ?, cover_image = ?, published = ?, updated_at = unixepoch() 
       WHERE slug = ?`).bind(body.title, body.slug, body.content, body.cover_image || null, body.published ? 1 : 0, slug).run();
		return { success: true };
	} catch (e) {
		console.error("[API Error] Update post failed:", e);
		if (e.statusCode) throw e;
		throw createError({
			statusCode: 500,
			message: "Database error",
			cause: e
		});
	}
});
//#endregion
export { _slug__put_default as default };
