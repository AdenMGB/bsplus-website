import { t as getDB } from "./db.js";
import { s as saveHourlyStats } from "./analytics.js";
//#region server/api/analytics/test-hourly-stats.get.ts
var test_hourly_stats_get_default = defineEventHandler(async (event) => {
	const user = await $fetch("/api/auth/me", { headers: { cookie: getHeader(event, "cookie") || "" } }).catch(() => null);
	if (!user || !user.admin_level || user.admin_level < 1) throw createError({
		statusCode: 403,
		message: "Forbidden"
	});
	const db = getDB(event);
	try {
		const stats = await db.prepare("SELECT * FROM page_stats").all();
		const sessions = stats.results.find((r) => r.path === "bs_sessions")?.views || 0;
		const desqtaSessions = stats.results.find((r) => r.path === "desqta_sessions")?.views || 0;
		const { results: existingStats } = await db.prepare("SELECT * FROM hourly_stats ORDER BY timestamp DESC LIMIT 10").all();
		await saveHourlyStats(db);
		const now = Math.floor(Date.now() / 1e3);
		const hourTimestamp = Math.floor(now / 3600) * 3600;
		const savedStat = await db.prepare("SELECT * FROM hourly_stats WHERE timestamp = ?").bind(hourTimestamp).first();
		return {
			currentStats: {
				extension_sessions: sessions,
				desqta_sessions: desqtaSessions
			},
			existingStats: existingStats || [],
			savedStat,
			hourTimestamp,
			timestampReadable: (/* @__PURE__ */ new Date(hourTimestamp * 1e3)).toISOString()
		};
	} catch (e) {
		console.error("[Test] Failed:", e);
		throw createError({
			statusCode: 500,
			message: "Test failed",
			cause: e
		});
	}
});
//#endregion
export { test_hourly_stats_get_default as default };
