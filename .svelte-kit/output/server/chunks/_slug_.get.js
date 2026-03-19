import { t as getDB } from "./db.js";
//#region server/api/news/[slug].get.ts
var _slug__get_default = defineEventHandler(async (event) => {
	let slug = event.context.params?.slug;
	if (!slug) {
		const pathParts = event.path.split("?")[0].split("/").filter(Boolean);
		const newsIndex = pathParts.indexOf("news");
		if (newsIndex >= 0 && newsIndex + 1 < pathParts.length) slug = pathParts[newsIndex + 1];
		else slug = pathParts[pathParts.length - 1];
	}
	if (!slug) throw createError({
		statusCode: 400,
		message: "Invalid slug parameter"
	});
	const db = getDB(event);
	try {
		const item = await db.prepare("SELECT * FROM news WHERE slug = ?").bind(slug).first();
		if (!item) throw createError({
			statusCode: 404,
			message: "News item not found"
		});
		if (item.published === 1) return item;
		const previewToken = getQuery(event).preview;
		if (previewToken) {
			if (item.preview_token && item.preview_token === previewToken) {
				const now = Math.floor(Date.now() / 1e3);
				if (item.preview_expires_at && item.preview_expires_at > now) return item;
			}
		}
		const user = await $fetch("/api/auth/me", { headers: { cookie: getHeader(event, "cookie") || "" } }).catch(() => null);
		if (user && user.admin_level && user.admin_level >= 1) return item;
		throw createError({
			statusCode: 404,
			message: "News item not found"
		});
	} catch (e) {
		if (e.statusCode) throw e;
		console.error("[API Error] Database error:", e);
		throw createError({
			statusCode: 500,
			message: "Database error",
			cause: e
		});
	}
});
//#endregion
export { _slug__get_default as default };
