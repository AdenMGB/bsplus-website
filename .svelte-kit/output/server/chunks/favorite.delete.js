import { t as getDB } from "./db.js";
import { t as getOptionalUser } from "./auth2.js";
//#region server/api/themes/[id]/favorite.delete.ts
var favorite_delete_default = defineEventHandler(async (event) => {
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
	if ((await db.prepare("DELETE FROM user_favorites WHERE user_id = ? AND theme_id = ?").bind(user.id, id).run()).meta.changes > 0) await db.prepare("UPDATE themes SET favorite_count = CASE WHEN favorite_count > 0 THEN favorite_count - 1 ELSE 0 END WHERE id = ?").bind(id).run();
	return {
		success: true,
		data: {
			favorited: false,
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
export { favorite_delete_default as default };
