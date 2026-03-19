import { t as getBucket } from "./r2.js";
//#region server/api/upload.post.ts
var upload_post_default = defineEventHandler(async (event) => {
	const user = await $fetch("/api/auth/me", { headers: { cookie: getHeader(event, "cookie") || "" } }).catch(() => null);
	if (!user || !user.admin_level || user.admin_level < 1) throw createError({
		statusCode: 403,
		message: "Forbidden"
	});
	const formData = await readMultipartFormData(event);
	if (!formData || formData.length === 0) throw createError({
		statusCode: 400,
		message: "No file uploaded"
	});
	const file = formData[0];
	if (!file.filename || !file.type?.startsWith("image/")) throw createError({
		statusCode: 400,
		message: "Invalid file type"
	});
	const bucket = getBucket(event);
	const key = `${Date.now()}-${file.filename}`;
	await bucket.put(key, file.data, { httpMetadata: { contentType: file.type } });
	return {
		url: `/api/images/${key}`,
		key
	};
});
//#endregion
export { upload_post_default as default };
