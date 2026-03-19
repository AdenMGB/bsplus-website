import { t as getDB } from "./db.js";
//#region server/api/analytics/hourly-stats.get.ts
var hourly_stats_get_default = defineEventHandler(async (event) => {
	const user = await $fetch("/api/auth/me", { headers: { cookie: getHeader(event, "cookie") || "" } }).catch(() => null);
	if (!user || !user.admin_level || user.admin_level < 1) throw createError({
		statusCode: 403,
		message: "Forbidden"
	});
	const query = getQuery(event);
	const hours = Number(query.hours) || 24;
	const db = getDB(event);
	try {
		const now = Math.floor(Date.now() / 1e3);
		const hoursAgo = Math.floor(now / 3600) * 3600 - hours * 3600;
		const { results } = await db.prepare(`SELECT * FROM hourly_stats 
       WHERE timestamp >= ? 
       ORDER BY timestamp ASC`).bind(hoursAgo).all();
		return results;
	} catch (e) {
		console.error("[API Error] Failed to fetch hourly stats:", e);
		if (e.statusCode) throw e;
		throw createError({
			statusCode: 500,
			message: "Database error",
			cause: e
		});
	}
});
//#endregion
export { hourly_stats_get_default as default };
