import { t as getDB } from "./db.js";
//#region server/api/themes/recalculate-stats.post.ts
var recalculate_stats_post_default = defineEventHandler(async (event) => {
	if (!(event.headers.get("cf-cron") === "true")) {
		const user = await $fetch("/api/auth/me", { headers: { cookie: getHeader(event, "cookie") || "" } }).catch(() => null);
		if (!user || !user.admin_level || user.admin_level < 1) throw createError({
			statusCode: 403,
			statusMessage: "Forbidden - Admin access or cron trigger required"
		});
	}
	const db = getDB(event);
	try {
		const themes = await db.prepare("SELECT id FROM themes WHERE status = ?").bind("approved").all();
		let updated = 0;
		let errors = 0;
		for (const theme of themes.results) try {
			const favoriteCount = (await db.prepare("SELECT COUNT(*) as count FROM user_favorites WHERE theme_id = ?").bind(theme.id).first())?.count || 0;
			const ratingResult = await db.prepare("SELECT AVG(rating) as avg, COUNT(*) as count FROM theme_ratings WHERE theme_id = ?").bind(theme.id).first();
			const ratingAverage = ratingResult?.avg || 0;
			const ratingCount = ratingResult?.count || 0;
			await db.prepare("UPDATE themes SET favorite_count = ?, rating_average = ?, rating_count = ? WHERE id = ?").bind(favoriteCount, ratingAverage, ratingCount, theme.id).run();
			updated++;
		} catch (e) {
			console.error(`[Recalculate Stats] Error updating theme ${theme.id}:`, e);
			errors++;
		}
		console.log(`[Recalculate Stats] Updated ${updated} themes, ${errors} errors`);
		return {
			success: true,
			data: {
				updated,
				errors,
				total: themes.results.length
			},
			error: null,
			meta: {
				timestamp: Date.now(),
				version: "1.0.0"
			}
		};
	} catch (e) {
		console.error("[Recalculate Stats] Failed:", e);
		throw createError({
			statusCode: 500,
			statusMessage: "Failed to recalculate theme stats",
			cause: e
		});
	}
});
//#endregion
export { recalculate_stats_post_default as default };
