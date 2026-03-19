import { t as getDB } from "./db.js";
import { t as getOptionalUser } from "./auth2.js";
//#region server/api/themes/spotlight.get.ts
var spotlight_get_default = defineEventHandler(async (event) => {
	const db = getDB(event);
	const user = await getOptionalUser(event);
	const themesResult = await db.prepare(`SELECT * FROM themes 
     WHERE status = 'approved' AND featured = 1 
     ORDER BY (download_count * 2 + favorite_count + rating_count) DESC 
     LIMIT 20`).all();
	let favoriteThemeIds = /* @__PURE__ */ new Set();
	let userRatings = /* @__PURE__ */ new Map();
	if (user) {
		const favoritesResult = await db.prepare("SELECT theme_id FROM user_favorites WHERE user_id = ?").bind(user.id).all();
		favoriteThemeIds = new Set(favoritesResult.results.map((f) => f.theme_id));
		const themeIds = themesResult.results.map((t) => t.id);
		if (themeIds.length > 0) {
			const placeholders = themeIds.map(() => "?").join(",");
			(await db.prepare(`SELECT theme_id, rating, comment FROM theme_ratings WHERE user_id = ? AND theme_id IN (${placeholders})`).bind(user.id, ...themeIds).all()).results.forEach((r) => {
				userRatings.set(r.theme_id, {
					rating: r.rating,
					comment: r.comment
				});
			});
		}
	}
	return {
		success: true,
		data: { themes: themesResult.results.map((theme) => {
			const userRating = userRatings.get(theme.id);
			return {
				id: theme.id,
				name: theme.name,
				slug: theme.slug,
				version: theme.version,
				description: theme.description,
				author: theme.author,
				license: theme.license,
				category: theme.category,
				tags: theme.tags ? JSON.parse(theme.tags) : [],
				status: theme.status,
				featured: Boolean(theme.featured),
				download_count: theme.download_count,
				favorite_count: theme.favorite_count,
				rating_average: theme.rating_average,
				rating_count: theme.rating_count,
				compatibility: {
					min: theme.compatibility_min,
					max: theme.compatibility_max || void 0
				},
				preview: {
					thumbnail: theme.preview_thumbnail_url,
					screenshots: theme.preview_screenshots ? JSON.parse(theme.preview_screenshots) : []
				},
				created_at: theme.created_at,
				updated_at: theme.updated_at,
				published_at: theme.published_at,
				file_size: theme.file_size,
				is_favorited: favoriteThemeIds.has(theme.id),
				user_rating: userRating || null
			};
		}) },
		error: null,
		meta: {
			timestamp: Date.now(),
			version: "1.0.0"
		}
	};
});
//#endregion
export { spotlight_get_default as default };
