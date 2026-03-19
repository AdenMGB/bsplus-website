import { t as getDB } from "./db.js";
import { t as flushVotes } from "./questionnaire.js";
//#region server/api/questionnaire/sync-votes.post.ts
var sync_votes_post_default = defineEventHandler(async (event) => {
	const user = await $fetch("/api/auth/me", { headers: { cookie: getHeader(event, "cookie") || "" } }).catch(() => null);
	if (!user || !user.admin_level || user.admin_level < 1) throw createError({
		statusCode: 403,
		message: "Forbidden"
	});
	let db;
	try {
		db = getDB(event);
	} catch (e) {
		throw createError({
			statusCode: 500,
			message: "Database binding not available",
			cause: e
		});
	}
	try {
		return {
			success: true,
			flushed: await flushVotes(db)
		};
	} catch (e) {
		console.error("[Questionnaire] Failed to sync votes:", e);
		throw createError({
			statusCode: 500,
			message: "Failed to sync votes",
			cause: e
		});
	}
});
//#endregion
export { sync_votes_post_default as default };
