import { t as getDB } from "./db.js";
import { r as checkAndFlush, t as bufferDesqtaSession } from "./analytics.js";
//#region server/api/analytics/desqta.get.ts
var desqta_get_default = defineEventHandler(async (event) => {
	const db = getDB(event);
	try {
		bufferDesqtaSession();
		checkAndFlush(db, event.context);
		return { success: true };
	} catch (e) {
		console.error("[Analytics] Failed to track DesQTA session:", e);
		return { success: false };
	}
});
//#endregion
export { desqta_get_default as default };
