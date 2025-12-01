import { getDB } from '../../utils/db';
import { bufferDesqtaSession, checkAndFlush } from '../../utils/analytics';

export default defineEventHandler(async (event) => {
  // No auth required - public endpoint for DesQTA extension
  const db = getDB(event);
  
  try {
    // Buffer the DesQTA session
    bufferDesqtaSession();
    
    // Check if we need to flush (non-blocking)
    checkAndFlush(db, event.context);
    
    return { success: true };
  } catch (e) {
    console.error('[Analytics] Failed to track DesQTA session:', e);
    // Don't throw error - analytics shouldn't break the extension
    return { success: false };
  }
});

