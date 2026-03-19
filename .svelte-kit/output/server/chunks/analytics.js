//#region server/utils/analytics.ts
var sessionBuffer = /* @__PURE__ */ new Map();
var desqtaSessionBuffer = /* @__PURE__ */ new Map();
var lastSessionFlushTime = Date.now();
var lastDesqtaSessionFlushTime = Date.now();
var SESSION_FLUSH_INTERVAL = 3600 * 1e3;
var getBufferStats = () => {
	let totalBufferedSessions = 0;
	for (const count of sessionBuffer.values()) totalBufferedSessions += count;
	let totalBufferedDesqtaSessions = 0;
	for (const count of desqtaSessionBuffer.values()) totalBufferedDesqtaSessions += count;
	return {
		sessions: {
			size: sessionBuffer.size,
			totalBuffered: totalBufferedSessions,
			lastFlush: lastSessionFlushTime,
			nextFlushEstimate: lastSessionFlushTime + SESSION_FLUSH_INTERVAL
		},
		desqtaSessions: {
			size: desqtaSessionBuffer.size,
			totalBuffered: totalBufferedDesqtaSessions,
			lastFlush: lastDesqtaSessionFlushTime,
			nextFlushEstimate: lastDesqtaSessionFlushTime + SESSION_FLUSH_INTERVAL
		}
	};
};
var bufferSession = () => {
	const key = "bs_sessions";
	const count = sessionBuffer.get(key) || 0;
	sessionBuffer.set(key, count + 1);
};
var bufferDesqtaSession = () => {
	const key = "desqta_sessions";
	const count = desqtaSessionBuffer.get(key) || 0;
	desqtaSessionBuffer.set(key, count + 1);
};
var flushMap = async (db, map) => {
	if (map.size === 0) return 0;
	const entries = Array.from(map.entries());
	map.clear();
	try {
		const stmt = db.prepare(`
      INSERT INTO page_stats (path, views) 
      VALUES (?, ?) 
      ON CONFLICT(path) DO UPDATE SET views = views + ?
    `);
		const batch = entries.map(([path, count]) => stmt.bind(path, count, count));
		await db.batch(batch);
		console.log(`[Analytics] Flushed ${entries.length} paths to DB`);
		return entries.length;
	} catch (e) {
		console.error("[Analytics] Failed to flush buffer:", e);
		entries.forEach(([path, count]) => {
			map.set(path, (map.get(path) || 0) + count);
		});
		throw e;
	}
};
var flushSessions = async (db) => {
	lastSessionFlushTime = Date.now();
	const result = await flushMap(db, sessionBuffer);
	await saveHourlyStats(db);
	return result;
};
var flushDesqtaSessions = async (db) => {
	lastDesqtaSessionFlushTime = Date.now();
	const result = await flushMap(db, desqtaSessionBuffer);
	await saveHourlyStats(db);
	return result;
};
var saveHourlyStats = async (db) => {
	try {
		const stats = await db.prepare("SELECT * FROM page_stats").all();
		const sessions = stats.results.find((r) => r.path === "bs_sessions")?.views || 0;
		const desqtaSessions = stats.results.find((r) => r.path === "desqta_sessions")?.views || 0;
		const now = Math.floor(Date.now() / 1e3);
		const hourTimestamp = Math.floor(now / 3600) * 3600;
		await db.prepare(`INSERT INTO hourly_stats (timestamp, extension_sessions, desqta_sessions)
       VALUES (?, ?, ?)
       ON CONFLICT(timestamp) DO UPDATE SET
         extension_sessions = excluded.extension_sessions,
         desqta_sessions = excluded.desqta_sessions`).bind(hourTimestamp, sessions, desqtaSessions).run();
		console.log(`[Hourly Stats] Saved stats for ${(/* @__PURE__ */ new Date(hourTimestamp * 1e3)).toISOString()}: ${sessions} extension sessions, ${desqtaSessions} desqta sessions`);
		return {
			success: true,
			timestamp: hourTimestamp,
			sessions,
			desqtaSessions
		};
	} catch (e) {
		console.error("[Hourly Stats] Failed to save:", e);
		return {
			success: false,
			error: e
		};
	}
};
var lastHourlyStatsSave = 0;
var checkAndFlush = async (db, context) => {
	const now = Date.now();
	let totalBufferedSessions = 0;
	for (const count of sessionBuffer.values()) totalBufferedSessions += count;
	if (totalBufferedSessions >= 50 || now - lastSessionFlushTime >= 36e5) {
		const p = flushSessions(db);
		if (context?.waitUntil) context.waitUntil(p);
		else p.catch(console.error);
	}
	let totalBufferedDesqtaSessions = 0;
	for (const count of desqtaSessionBuffer.values()) totalBufferedDesqtaSessions += count;
	if (totalBufferedDesqtaSessions >= 50 || now - lastDesqtaSessionFlushTime >= 36e5) {
		const p = flushDesqtaSessions(db);
		if (context?.waitUntil) context.waitUntil(p);
		else p.catch(console.error);
	}
	const currentHour = Math.floor(now / 1e3 / 3600) * 3600;
	if (lastHourlyStatsSave !== currentHour) {
		lastHourlyStatsSave = currentHour;
		const p = saveHourlyStats(db);
		if (context?.waitUntil) context.waitUntil(p);
		else p.catch(console.error);
	}
};
//#endregion
export { flushSessions as a, flushDesqtaSessions as i, bufferSession as n, getBufferStats as o, checkAndFlush as r, saveHourlyStats as s, bufferDesqtaSession as t };
