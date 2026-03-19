import { t as getDB } from "./db.js";
//#region server/api/analytics/save-hourly-stats.ts
var save_hourly_stats_default = defineEventHandler(async (event) => {
	const db = getDB(event);
	try {
		const stats = await db.prepare("SELECT * FROM page_stats").all();
		const sessions = stats.results.find((r) => r.path === "bs_sessions")?.views || 0;
		const desqtaSessions = stats.results.find((r) => r.path === "desqta_sessions")?.views || 0;
		const now = Math.floor(Date.now() / 1e3);
		const hourTimestamp = Math.floor(now / 3600) * 3600;
		await db.prepare(`INSERT INTO hourly_stats (timestamp, extension_sessions, desqta_sessions)
       VALUES (?, ?, ?)
       ON CONFLICT(timestamp) DO UPDATE SET
         extension_sessions = excluded.extension_sessions,
         desqta_sessions = excluded.desqta_sessions`).bind(hourTimestamp, sessions, desqtaSessions).run();
		console.log(`[Hourly Stats] Saved stats for ${(/* @__PURE__ */ new Date(hourTimestamp * 1e3)).toISOString()}: ${sessions} extension sessions, ${desqtaSessions} desqta sessions`);
		return {
			success: true,
			timestamp: hourTimestamp,
			sessions,
			desqtaSessions
		};
	} catch (e) {
		console.error("[Hourly Stats] Failed to save:", e);
		throw createError({
			statusCode: 500,
			message: "Failed to save hourly stats",
			cause: e
		});
	}
});
//#endregion
export { save_hourly_stats_default as default };
