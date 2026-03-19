import { t as getDB } from "./db.js";
import { t as getBucket } from "./r2.js";
import { n as requireAdmin } from "./auth2.js";
//#region server/api/admin/themes/[id].delete.ts
var _id__delete_default = defineEventHandler(async (event) => {
	await requireAdmin(event);
	const db = getDB(event);
	const bucket = getBucket(event);
	const id = getRouterParam(event, "id");
	if (!id) throw createError({
		statusCode: 400,
		statusMessage: "Theme ID is required"
	});
	const theme = await db.prepare("SELECT zip_download_url, preview_thumbnail_url, preview_screenshots FROM themes WHERE id = ?").bind(id).first();
	if (!theme) throw createError({
		statusCode: 404,
		statusMessage: "Theme not found"
	});
	try {
		if (theme.zip_download_url) {
			const zipKey = theme.zip_download_url.replace("/api/images/", "");
			await bucket.delete(zipKey);
		}
		if (theme.preview_thumbnail_url) {
			const previewKey = theme.preview_thumbnail_url.replace("/api/images/", "");
			await bucket.delete(previewKey);
		}
		if (theme.preview_screenshots) {
			const screenshots = JSON.parse(theme.preview_screenshots);
			for (const screenshotUrl of screenshots) {
				const screenshotKey = screenshotUrl.replace("/api/images/", "");
				await bucket.delete(screenshotKey);
			}
		}
	} catch (error) {
		console.error("Error deleting R2 files:", error);
	}
	await db.prepare("DELETE FROM themes WHERE id = ?").bind(id).run();
	return {
		success: true,
		data: { message: "Theme deleted successfully" },
		error: null,
		meta: {
			timestamp: Date.now(),
			version: "1.0.0"
		}
	};
});
//#endregion
export { _id__delete_default as default };
