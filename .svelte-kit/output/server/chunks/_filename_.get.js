import { t as getBucket } from "./r2.js";
//#region server/api/images/themes/[id]/[filename].get.ts
var _filename__get_default = defineEventHandler(async (event) => {
	const id = getRouterParam(event, "id");
	const filename = getRouterParam(event, "filename");
	if (!id || !filename) throw createError({
		statusCode: 400,
		message: "Invalid image path"
	});
	const key = `themes/${id}/${filename}`;
	const object = await getBucket(event).get(key);
	if (!object) throw createError({
		statusCode: 404,
		message: "Image not found"
	});
	const headers = new Headers();
	object.writeHttpMetadata(headers);
	headers.set("etag", object.httpEtag);
	return sendStream(event, object.body);
});
//#endregion
export { _filename__get_default as default };
