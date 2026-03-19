import { t as getDB } from "./db.js";
import { t as getBucket } from "./r2.js";
//#region server/api/themes/[id]/theme.json.get.ts
var theme_json_get_default = defineEventHandler(async (event) => {
	const id = getRouterParam(event, "id");
	if (!id) throw createError({
		statusCode: 400,
		message: "Theme ID required"
	});
	const theme = await getDB(event).prepare("SELECT theme_type, theme_json_url FROM themes WHERE id = ?").bind(id).first();
	if (!theme || theme.theme_type !== "betterseqta") throw createError({
		statusCode: 404,
		message: "Theme not found or not a BetterSEQTA theme"
	});
	const bucket = getBucket(event);
	const key = `themes/${id}/theme.json`;
	const object = await bucket.get(key);
	if (!object) throw createError({
		statusCode: 404,
		message: "Theme file not found"
	});
	const body = await object.arrayBuffer();
	const json = new TextDecoder().decode(body);
	setHeader(event, "Cache-Control", "public, max-age=3600");
	return send(event, json, "application/json");
});
//#endregion
export { theme_json_get_default as default };
