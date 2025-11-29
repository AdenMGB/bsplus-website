// Analytics Buffers
const viewBuffer = new Map<string, number>();
let lastViewFlushTime = Date.now();

const sessionBuffer = new Map<string, number>();
let lastSessionFlushTime = Date.now();

// Configuration
export const VIEW_FLUSH_INTERVAL = 10 * 60 * 1000; // 10 minutes
export const VIEW_FLUSH_THRESHOLD = 50;

export const SESSION_FLUSH_INTERVAL = 60 * 60 * 1000; // 1 hour
export const SESSION_FLUSH_THRESHOLD = 50;

export const getBufferStats = () => {
  let totalBufferedViews = 0;
  for (const count of viewBuffer.values()) {
    totalBufferedViews += count;
  }

  let totalBufferedSessions = 0;
  for (const count of sessionBuffer.values()) {
    totalBufferedSessions += count;
  }

  return {
    views: {
      size: viewBuffer.size,
      totalBuffered: totalBufferedViews,
      lastFlush: lastViewFlushTime,
      nextFlushEstimate: lastViewFlushTime + VIEW_FLUSH_INTERVAL
    },
    sessions: {
      size: sessionBuffer.size,
      totalBuffered: totalBufferedSessions,
      lastFlush: lastSessionFlushTime,
      nextFlushEstimate: lastSessionFlushTime + SESSION_FLUSH_INTERVAL
    }
  };
};

export const bufferView = (path: string) => {
  const count = viewBuffer.get(path) || 0;
  viewBuffer.set(path, count + 1);
};

export const bufferSession = () => {
  const key = 'bs_sessions';
  const count = sessionBuffer.get(key) || 0;
  sessionBuffer.set(key, count + 1);
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

export const flushViews = async (db: any) => {
  lastViewFlushTime = Date.now();
  return await flushMap(db, viewBuffer);
};

export const flushSessions = async (db: any) => {
  lastSessionFlushTime = Date.now();
  return await flushMap(db, sessionBuffer);
};

export const checkAndFlush = async (db: any, context: any) => {
  // Check Views
  let totalBufferedViews = 0;
  for (const count of viewBuffer.values()) totalBufferedViews += count;
  
  if (totalBufferedViews >= VIEW_FLUSH_THRESHOLD || (Date.now() - lastViewFlushTime) >= VIEW_FLUSH_INTERVAL) {
    const p = flushViews(db);
    if (context?.waitUntil) context.waitUntil(p);
    else p.catch(console.error);
  }

  // Check Sessions
  let totalBufferedSessions = 0;
  for (const count of sessionBuffer.values()) totalBufferedSessions += count;

  if (totalBufferedSessions >= SESSION_FLUSH_THRESHOLD || (Date.now() - lastSessionFlushTime) >= SESSION_FLUSH_INTERVAL) {
    const p = flushSessions(db);
    if (context?.waitUntil) context.waitUntil(p);
    else p.catch(console.error);
  }
};
