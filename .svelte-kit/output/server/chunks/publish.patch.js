import { t as getDB } from "./db.js";
//#region server/api/news/publish.patch.ts
var publish_patch_default = defineEventHandler(async (event) => {
	const user = await $fetch("/api/auth/me", { headers: { cookie: getHeader(event, "cookie") || "" } }).catch(() => null);
	if (!user || !user.admin_level || user.admin_level < 1) throw createError({
		statusCode: 403,
		message: "Forbidden"
	});
	const slug = getQuery(event).slug;
	const body = await readBody(event);
	if (!slug) throw createError({
		statusCode: 400,
		message: "Invalid slug parameter"
	});
	const db = getDB(event);
	try {
		const existing = await db.prepare("SELECT id, published FROM news WHERE slug = ?").bind(slug).first();
		if (!existing) throw createError({
			statusCode: 404,
			message: "Post not found"
		});
		const newPublishedStatus = body.published !== void 0 ? body.published : !existing.published;
		await db.prepare(`UPDATE news 
       SET published = ?, updated_at = unixepoch() 
       WHERE slug = ?`).bind(newPublishedStatus ? 1 : 0, slug).run();
		return {
			success: true,
			published: newPublishedStatus
		};
	} catch (e) {
		console.error("[API Error] Toggle publish failed:", e);
		if (e.statusCode) throw e;
		throw createError({
			statusCode: 500,
			message: "Database error",
			cause: e
		});
	}
});
//#endregion
export { publish_patch_default as default };
