import { t as getDB } from "./db.js";
//#region server/api/news/[id].delete.ts
var _id__delete_default = defineEventHandler(async (event) => {
	const user = await $fetch("/api/auth/me", { headers: { cookie: getHeader(event, "cookie") || "" } }).catch(() => null);
	if (!user || !user.admin_level || user.admin_level < 1) throw createError({
		statusCode: 403,
		message: "Forbidden"
	});
	const id = event.path.split("/").pop();
	if (!id) throw createError({
		statusCode: 400,
		message: "Invalid ID parameter"
	});
	const { success } = await getDB(event).prepare("DELETE FROM news WHERE id = ?").bind(id).run();
	return { success };
});
//#endregion
export { _id__delete_default as default };
