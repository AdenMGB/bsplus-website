import { getDB } from '../../utils/db';
import { bufferView, checkAndFlush } from '../../utils/analytics';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const path = body.path || '/';
  
  // Use shared util to buffer
  bufferView(path);
  
  // Check conditions
  const db = getDB(event);
  checkAndFlush(db, event.context.cloudflare?.context);

  return { success: true, buffered: true };
});
