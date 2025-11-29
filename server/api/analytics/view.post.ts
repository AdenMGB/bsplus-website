import { getDB } from '../../utils/db';
import { bufferView, getViewBufferStats, flushBuffer, FLUSH_THRESHOLD, FLUSH_INTERVAL_MS } from '../../utils/analytics';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const path = body.path || '/';
  
  // Use shared util to buffer
  bufferView(path);
  
  // Check conditions
  const stats = getViewBufferStats();
  const timeSinceLastFlush = Date.now() - stats.lastFlush;
  const shouldFlush = stats.totalBuffered >= FLUSH_THRESHOLD || timeSinceLastFlush >= FLUSH_INTERVAL_MS;

  if (shouldFlush) {
    const db = getDB(event);
    const flushPromise = flushBuffer(db);

    // If environment supports waitUntil (Cloudflare), use it
    if (event.context.cloudflare?.context?.waitUntil) {
      event.context.cloudflare.context.waitUntil(flushPromise);
    } else {
      flushPromise.catch((e: any) => console.error(e));
    }
  }

  return { success: true, buffered: true };
});
