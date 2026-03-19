import { t as getDB } from "./db.js";
import { a as flushSessions, i as flushDesqtaSessions } from "./analytics.js";
//#region server/api/analytics/flush.post.ts
var flush_post_default = defineEventHandler(async (event) => {
	const user = await $fetch("/api/auth/me", { headers: { cookie: getHeader(event, "cookie") || "" } }).catch(() => null);
	if (!user || !user.admin_level || user.admin_level < 1) throw createError({
		statusCode: 403,
		message: "Forbidden"
	});
	const db = getDB(event);
	try {
		return {
			success: true,
			flushed: {
				sessions: await flushSessions(db),
				desqtaSessions: await flushDesqtaSessions(db)
			}
		};
	} catch (e) {
		throw createError({
			statusCode: 500,
			message: "Failed to flush sessions"
		});
	}
});
//#endregion
export { flush_post_default as default };
