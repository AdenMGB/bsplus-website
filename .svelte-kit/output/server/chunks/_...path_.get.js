import { t as getBucket } from "./r2.js";
//#region server/api/images/[...path].get.ts
var ____path__get_default = defineEventHandler(async (event) => {
	const key = event.path.replace(/^\/api\/images\//, "").replace(/^\/api\/images$/, "");
	if (!key) throw createError({
		statusCode: 400,
		message: "Invalid image key"
	});
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
export { ____path__get_default as default };
