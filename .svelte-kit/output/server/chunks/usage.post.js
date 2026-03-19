import { t as getDB } from "./db.js";
//#region server/api/analytics/usage.post.ts
/**
* App usage analytics endpoint for DesQTA / BetterSEQTA Cloud.
* Accepts daily usage reports from the DesQTA app.
*
* Auth: Option A (anonymous) - no auth, client_id in body for deduplication.
*       Option B (authenticated) - Authorization: Bearer <token> to associate with user.
*/
var VALID_PLATFORMS = [
	"windows",
	"macos",
	"linux",
	"android",
	"ios"
];
var DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
var usage_post_default = defineEventHandler(async (event) => {
	if (event.method !== "POST") throw createError({
		statusCode: 405,
		message: "Method Not Allowed"
	});
	const body = await readBody(event).catch(() => null);
	if (!body || typeof body !== "object") throw createError({
		statusCode: 400,
		message: "Invalid JSON body"
	});
	const { date, sessions_count, cloud_signed_in, app_version, platform, client_id } = body;
	if (!date || typeof date !== "string") throw createError({
		statusCode: 400,
		message: "date is required (ISO date YYYY-MM-DD)"
	});
	if (!DATE_REGEX.test(date)) throw createError({
		statusCode: 400,
		message: "date must be ISO format YYYY-MM-DD"
	});
	if (typeof sessions_count !== "number" || sessions_count < 0) throw createError({
		statusCode: 400,
		message: "sessions_count must be a non-negative number"
	});
	if (typeof cloud_signed_in !== "boolean") throw createError({
		statusCode: 400,
		message: "cloud_signed_in must be a boolean"
	});
	if (platform !== void 0 && !VALID_PLATFORMS.includes(platform)) throw createError({
		statusCode: 400,
		message: `platform must be one of: ${VALID_PLATFORMS.join(", ")}`
	});
	let userId = null;
	const authHeader = getHeader(event, "authorization");
	const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
	if (bearerToken) try {
		userId = (await $fetch("https://accounts.betterseqta.org/api/oauth/userinfo", { headers: { Authorization: `Bearer ${bearerToken}` } }))?.id ?? null;
	} catch {}
	const db = getDB(event);
	try {
		await db.prepare(`INSERT INTO app_usage_analytics (date, sessions_count, cloud_signed_in, app_version, platform, client_id, user_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`).bind(date, sessions_count, cloud_signed_in ? 1 : 0, app_version ?? null, platform ?? null, client_id ?? null, userId).run();
		return { ok: true };
	} catch (e) {
		console.error("[Analytics] Failed to store usage:", e);
		throw createError({
			statusCode: 500,
			message: "Failed to store usage"
		});
	}
});
//#endregion
export { usage_post_default as default };
