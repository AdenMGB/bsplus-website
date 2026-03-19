import { t as getDB } from "./db.js";
import { getHeader } from "h3";
//#region server/api/analytics/themes.get.ts
/**
* Theme analytics - admin only.
* Aggregates theme marketplace stats.
*/
var themes_get_default = defineEventHandler(async (event) => {
	const user = await $fetch("/api/auth/me", { headers: { cookie: getHeader(event, "cookie") || "" } }).catch(() => null);
	if (!user || !user.admin_level || user.admin_level < 1) throw createError({
		statusCode: 403,
		message: "Forbidden"
	});
	const db = getDB(event);
	try {
		const summary = await db.prepare(`SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
          COALESCE(SUM(download_count), 0) as total_downloads,
          COALESCE(SUM(favorite_count), 0) as total_favorites,
          COALESCE(SUM(rating_count), 0) as total_ratings,
          COALESCE(AVG(CASE WHEN rating_count > 0 THEN rating_average END), 0) as avg_rating
         FROM themes`).first();
		const byCategory = await db.prepare(`SELECT 
          COALESCE(category, 'uncategorized') as category,
          COUNT(*) as count,
          SUM(download_count) as downloads
         FROM themes
         WHERE status = 'approved'
         GROUP BY category
         ORDER BY downloads DESC`).all();
		const topByDownloads = await db.prepare(`SELECT id, name, author, download_count, favorite_count, rating_average, rating_count
         FROM themes
         WHERE status = 'approved'
         ORDER BY download_count DESC
         LIMIT 10`).all();
		return {
			summary: {
				total: summary?.total ?? 0,
				approved: summary?.approved ?? 0,
				pending: summary?.pending ?? 0,
				rejected: summary?.rejected ?? 0,
				totalDownloads: summary?.total_downloads ?? 0,
				totalFavorites: summary?.total_favorites ?? 0,
				totalRatings: summary?.total_ratings ?? 0,
				avgRating: Math.round((summary?.avg_rating ?? 0) * 10) / 10
			},
			byCategory: (byCategory?.results || []).map((r) => ({
				category: r.category,
				count: r.count,
				downloads: r.downloads
			})),
			topByDownloads: (topByDownloads?.results || []).map((r) => ({
				id: r.id,
				name: r.name,
				author: r.author,
				download_count: r.download_count,
				favorite_count: r.favorite_count,
				rating_average: r.rating_average,
				rating_count: r.rating_count
			}))
		};
	} catch (e) {
		console.error("[Analytics] Failed to fetch theme stats:", e);
		throw createError({
			statusCode: 500,
			message: "Database error"
		});
	}
});
//#endregion
export { themes_get_default as default };
