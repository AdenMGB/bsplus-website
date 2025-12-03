// Analytics Buffers

const sessionBuffer = new Map<string, number>();
const desqtaSessionBuffer = new Map<string, number>();
let lastSessionFlushTime = Date.now();
let lastDesqtaSessionFlushTime = Date.now();

// Configuration

export const SESSION_FLUSH_INTERVAL = 60 * 60 * 1000; // 1 hour
export const SESSION_FLUSH_THRESHOLD = 50;

export const getBufferStats = () => {
  let totalBufferedSessions = 0;
  for (const count of sessionBuffer.values()) {
    totalBufferedSessions += count;
  }

  let totalBufferedDesqtaSessions = 0;
  for (const count of desqtaSessionBuffer.values()) {
    totalBufferedDesqtaSessions += count;
  }

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

export const bufferSession = () => {
  const key = 'bs_sessions';
  const count = sessionBuffer.get(key) || 0;
  sessionBuffer.set(key, count + 1);
};

export const bufferDesqtaSession = () => {
  const key = 'desqta_sessions';
  const count = desqtaSessionBuffer.get(key) || 0;
  desqtaSessionBuffer.set(key, count + 1);
};

const flushMap = async (db: any, map: Map<string, number>) => {
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
    console.error('[Analytics] Failed to flush buffer:', e);
    // Restore buffer on failure
    entries.forEach(([path, count]) => {
      map.set(path, (map.get(path) || 0) + count);
    });
    throw e;
  }
};

export const flushSessions = async (db: any) => {
  lastSessionFlushTime = Date.now();
  const result = await flushMap(db, sessionBuffer);
  await saveHourlyStats(db);
  return result;
};

export const flushDesqtaSessions = async (db: any) => {
  lastDesqtaSessionFlushTime = Date.now();
  const result = await flushMap(db, desqtaSessionBuffer);
  await saveHourlyStats(db);
  return result;
};

const saveHourlyStats = async (db: any) => {
  try {
    // Get current counts from page_stats
    const stats = await db.prepare('SELECT * FROM page_stats').all();
    const sessions = stats.results.find((r: any) => r.path === 'bs_sessions')?.views || 0;
    const desqtaSessions = stats.results.find((r: any) => r.path === 'desqta_sessions')?.views || 0;

    // Round down to the hour (Unix timestamp)
    const now = Math.floor(Date.now() / 1000);
    const hourTimestamp = Math.floor(now / 3600) * 3600;

    // Insert or update hourly stats
    await db.prepare(
      `INSERT INTO hourly_stats (timestamp, extension_sessions, desqta_sessions)
       VALUES (?, ?, ?)
       ON CONFLICT(timestamp) DO UPDATE SET
         extension_sessions = excluded.extension_sessions,
         desqta_sessions = excluded.desqta_sessions`
    ).bind(hourTimestamp, sessions, desqtaSessions).run();

    console.log(`[Hourly Stats] Saved stats for ${new Date(hourTimestamp * 1000).toISOString()}: ${sessions} extension sessions, ${desqtaSessions} desqta sessions`);
  } catch (e) {
    console.error('[Hourly Stats] Failed to save:', e);
    // Don't throw - hourly stats shouldn't break flushing
  }
};

export const checkAndFlush = async (db: any, context: any) => {
  // Check Sessions
  let totalBufferedSessions = 0;
  for (const count of sessionBuffer.values()) totalBufferedSessions += count;

  if (totalBufferedSessions >= SESSION_FLUSH_THRESHOLD || (Date.now() - lastSessionFlushTime) >= SESSION_FLUSH_INTERVAL) {
    const p = flushSessions(db);
    if (context?.waitUntil) context.waitUntil(p);
    else p.catch(console.error);
  }

  // Check DesQTA Sessions
  let totalBufferedDesqtaSessions = 0;
  for (const count of desqtaSessionBuffer.values()) totalBufferedDesqtaSessions += count;

  if (totalBufferedDesqtaSessions >= SESSION_FLUSH_THRESHOLD || (Date.now() - lastDesqtaSessionFlushTime) >= SESSION_FLUSH_INTERVAL) {
    const p = flushDesqtaSessions(db);
    if (context?.waitUntil) context.waitUntil(p);
    else p.catch(console.error);
  }
};
