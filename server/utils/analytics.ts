// Global aggregation buffer
const viewBuffer = new Map<string, number>();
let lastFlushTime = Date.now();

export const FLUSH_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes
export const FLUSH_THRESHOLD = 50;

export const getViewBufferStats = () => {
  let totalBuffered = 0;
  for (const count of viewBuffer.values()) {
    totalBuffered += count;
  }
  return {
    size: viewBuffer.size,
    totalBuffered,
    lastFlush: lastFlushTime
  };
};

export const bufferView = (path: string) => {
  const count = viewBuffer.get(path) || 0;
  viewBuffer.set(path, count + 1);
};

export const flushBuffer = async (db: any) => {
  if (viewBuffer.size === 0) return 0;

  const entries = Array.from(viewBuffer.entries());
  // Clear buffer immediately to prevent double processing
  viewBuffer.clear();
  lastFlushTime = Date.now();

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
      viewBuffer.set(path, (viewBuffer.get(path) || 0) + count);
    });
    throw e;
  }
};

