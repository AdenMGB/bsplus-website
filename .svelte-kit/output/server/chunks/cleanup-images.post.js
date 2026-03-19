import { t as getDB } from "./db.js";
import { t as getBucket } from "./r2.js";
//#region server/api/questionnaire/cleanup-images.post.ts
var cleanup_images_post_default = defineEventHandler(async (event) => {
	if (!(event.headers.get("cf-cron") === "true")) {
		const user = await $fetch("/api/auth/me", { headers: { cookie: getHeader(event, "cookie") || "" } }).catch(() => null);
		if (!user || !user.admin_level || user.admin_level < 1) throw createError({
			statusCode: 403,
			message: "Forbidden"
		});
	}
	const db = getDB(event);
	const bucket = getBucket(event);
	try {
		const thirtyDaysAgo = Math.floor(Date.now() / 1e3) - 720 * 60 * 60;
		const questions = await db.prepare(`
      SELECT id, cover_image 
      FROM daily_questions 
      WHERE cover_image IS NOT NULL 
        AND cover_image_uploaded_at IS NOT NULL
        AND cover_image_uploaded_at < ?
    `).bind(thirtyDaysAgo).all();
		let deletedCount = 0;
		let errorCount = 0;
		for (const question of questions.results) if (question.cover_image && question.cover_image.startsWith("/api/images/")) {
			const imageKey = question.cover_image.replace("/api/images/", "");
			try {
				await bucket.delete(imageKey);
				await db.prepare(`
            UPDATE daily_questions 
            SET cover_image = NULL, cover_image_uploaded_at = NULL 
            WHERE id = ?
          `).bind(question.id).run();
				deletedCount++;
				console.log(`[Questionnaire Cleanup] Deleted image ${imageKey} for question ${question.id}`);
			} catch (e) {
				errorCount++;
				console.error(`[Questionnaire Cleanup] Failed to delete image ${imageKey}:`, e);
			}
		}
		const themes = await db.prepare("SELECT id FROM themes WHERE status = ?").bind("approved").all();
		let themesUpdated = 0;
		let themesErrors = 0;
		for (const theme of themes.results) try {
			const favoriteCount = (await db.prepare("SELECT COUNT(*) as count FROM user_favorites WHERE theme_id = ?").bind(theme.id).first())?.count || 0;
			const ratingResult = await db.prepare("SELECT AVG(rating) as avg, COUNT(*) as count FROM theme_ratings WHERE theme_id = ?").bind(theme.id).first();
			const ratingAverage = ratingResult?.avg || 0;
			const ratingCount = ratingResult?.count || 0;
			await db.prepare("UPDATE themes SET favorite_count = ?, rating_average = ?, rating_count = ? WHERE id = ?").bind(favoriteCount, ratingAverage, ratingCount, theme.id).run();
			themesUpdated++;
		} catch (e) {
			console.error(`[Theme Stats] Error updating theme ${theme.id}:`, e);
			themesErrors++;
		}
		console.log(`[Theme Stats] Updated ${themesUpdated} themes, ${themesErrors} errors`);
		return {
			success: true,
			questionnaire: {
				deleted: deletedCount,
				errors: errorCount,
				total: questions.results.length
			},
			themes: {
				updated: themesUpdated,
				errors: themesErrors,
				total: themes.results.length
			}
		};
	} catch (e) {
		console.error("[Daily Cleanup] Failed:", e);
		throw createError({
			statusCode: 500,
			message: "Failed to run daily cleanup",
			cause: e
		});
	}
});
//#endregion
export { cleanup_images_post_default as default };
