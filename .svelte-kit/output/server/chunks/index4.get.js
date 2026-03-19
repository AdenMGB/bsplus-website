import { t as getDB } from "./db.js";
//#region server/api/news/index.get.ts
var index_get_default = defineEventHandler(async (event) => {
	const db = getDB(event);
	const query = getQuery(event);
	const limit = Number(query.limit) || 20;
	const offset = Number(query.offset) || 0;
	let showDrafts = false;
	if (query.admin === "true") {
		const user = await $fetch("/api/auth/me", { headers: { cookie: getHeader(event, "cookie") || "" } }).catch(() => null);
		if (user && user.admin_level && user.admin_level >= 1) showDrafts = true;
	}
	let sql = "SELECT * FROM news";
	if (!showDrafts) sql += " WHERE published = 1";
	sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
	const { results } = await db.prepare(sql).bind(limit, offset).all();
	return results;
});
//#endregion
export { index_get_default as default };
