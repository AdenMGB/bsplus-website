import { t as getDB } from "./db.js";
import { t as getOptionalUser } from "./auth2.js";
//#region server/api/themes/[id]/user-status.get.ts
var user_status_get_default = defineEventHandler(async (event) => {
	const db = getDB(event);
	const id = getRouterParam(event, "id");
	const user = await getOptionalUser(event);
	if (!id) throw createError({
		statusCode: 400,
		statusMessage: "Theme ID is required"
	});
	if (!await db.prepare("SELECT id FROM themes WHERE id = ? AND status = ?").bind(id, "approved").first()) throw createError({
		statusCode: 404,
		statusMessage: "Theme not found"
	});
	if (!user) return {
		success: true,
		data: {
			is_favorited: false,
			has_rated: false,
			rating: null
		},
		error: null,
		meta: {
			timestamp: Date.now(),
			version: "1.0.0"
		}
	};
	const favorite = await db.prepare("SELECT id FROM user_favorites WHERE user_id = ? AND theme_id = ?").bind(user.id, id).first();
	const rating = await db.prepare("SELECT id, rating, comment FROM theme_ratings WHERE user_id = ? AND theme_id = ?").bind(user.id, id).first();
	return {
		success: true,
		data: {
			is_favorited: !!favorite,
			has_rated: !!rating,
			rating: rating ? {
				id: rating.id,
				rating: rating.rating,
				comment: rating.comment
			} : null
		},
		error: null,
		meta: {
			timestamp: Date.now(),
			version: "1.0.0"
		}
	};
});
//#endregion
export { user_status_get_default as default };
