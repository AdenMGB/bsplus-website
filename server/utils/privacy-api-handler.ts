import type { H3Event } from 'h3';
import { setHeader } from 'h3';
import { bufferSession, checkAndFlush } from './analytics';
import { getDB } from './db';
import { getPrivacyApiPayload } from './privacy-api-payload';

export async function handlePrivacyApiRequest(event: H3Event) {
  bufferSession();

  const db = getDB(event);
  checkAndFlush(db, event.context.cloudflare?.context);

  setHeader(event, 'Cache-Control', 'no-store');

  return getPrivacyApiPayload();
}
