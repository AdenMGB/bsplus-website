import { t as getDB } from "./db.js";
import { t as getOptionalUser } from "./auth2.js";
//#region server/api/themes/[id].get.ts
var _id__get_default = defineEventHandler(async (event) => {
	const db = getDB(event);
	const id = getRouterParam(event, "id");
	const user = await getOptionalUser(event);
	if (!id) throw createError({
		statusCode: 400,
		statusMessage: "Theme ID is required"
	});
	const theme = await db.prepare("SELECT * FROM themes WHERE id = ? AND status = ?").bind(id, "approved").first();
	if (!theme) throw createError({
		statusCode: 404,
		statusMessage: "Theme not found"
	});
	let isFavorited = false;
	if (user) isFavorited = !!await db.prepare("SELECT id FROM user_favorites WHERE user_id = ? AND theme_id = ?").bind(user.id, id).first();
	const themeType = theme.theme_type || "desqta";
	const manifest = themeType === "desqta" ? {
		name: theme.name,
		version: theme.version,
		description: theme.description,
		author: theme.author,
		license: theme.license,
		compatibility: {
			minVersion: theme.compatibility_min,
			maxVersion: theme.compatibility_max || void 0
		},
		preview: {
			thumbnail: theme.preview_thumbnail_url,
			screenshots: theme.preview_screenshots ? JSON.parse(theme.preview_screenshots) : []
		}
	} : void 0;
	const baseTheme = {
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
			thumbnail: theme.preview_thumbnail_url || theme.cover_image_url,
			screenshots: theme.preview_screenshots ? JSON.parse(theme.preview_screenshots) : []
		},
		created_at: theme.created_at,
		updated_at: theme.updated_at,
		published_at: theme.published_at,
		is_favorited: isFavorited,
		theme_type: themeType
	};
	return {
		success: true,
		data: { theme: themeType === "betterseqta" ? {
			...baseTheme,
			coverImage: theme.cover_image_url,
			marqueeImage: theme.marquee_image_url,
			theme_json_url: theme.theme_json_url
		} : {
			...baseTheme,
			preview_thumbnail_url: theme.preview_thumbnail_url,
			zip_download_url: theme.zip_download_url,
			file_size: theme.file_size,
			checksum: theme.checksum,
			manifest
		} },
		error: null,
		meta: {
			timestamp: Date.now(),
			version: "1.0.0"
		}
	};
});
//#endregion
export { _id__get_default as default };
