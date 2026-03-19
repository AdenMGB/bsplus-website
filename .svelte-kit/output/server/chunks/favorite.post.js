import { t as getDB } from "./db.js";
import { t as getOptionalUser } from "./auth2.js";
//#region server/api/themes/[id]/favorite.post.ts
var favorite_post_default = defineEventHandler(async (event) => {
	const db = getDB(event);
	const id = getRouterParam(event, "id");
	const user = await getOptionalUser(event);
	if (!user) throw createError({
		statusCode: 401,
		statusMessage: "Authentication required"
	});
	if (!id) throw createError({
		statusCode: 400,
		statusMessage: "Theme ID is required"
	});
	if (!await db.prepare("SELECT id FROM themes WHERE id = ? AND status = ?").bind(id, "approved").first()) throw createError({
		statusCode: 404,
		statusMessage: "Theme not found"
	});
	if (await db.prepare("SELECT id FROM user_favorites WHERE user_id = ? AND theme_id = ?").bind(user.id, id).first()) return {
		success: true,
		data: {
			favorited: true,
			favorite_count: 0
		},
		error: null,
		meta: {
			timestamp: Date.now(),
			version: "1.0.0"
		}
	};
	const favoriteId = crypto.randomUUID();
	await db.prepare("INSERT INTO user_favorites (id, user_id, theme_id, created_at) VALUES (?, ?, ?, ?)").bind(favoriteId, user.id, id, Date.now()).run();
	await db.prepare("UPDATE themes SET favorite_count = favorite_count + 1 WHERE id = ?").bind(id).run();
	return {
		success: true,
		data: {
			favorited: true,
			favorite_count: (await db.prepare("SELECT favorite_count FROM themes WHERE id = ?").bind(id).first())?.favorite_count || 0
		},
		error: null,
		meta: {
			timestamp: Date.now(),
			version: "1.0.0"
		}
	};
});
//#endregion
export { favorite_post_default as default };
