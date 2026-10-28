import type { H3Event } from 'h3';
import { setHeader } from 'h3';
import type { LegalApiPayload } from '../../lib/legal/legal-api-payload';
import { bufferSession, checkAndFlush } from './analytics';
import { getDB } from './db';

export async function handleLegalApiRequest(
  event: H3Event,
  payload: LegalApiPayload,
): Promise<LegalApiPayload> {
  bufferSession();

  const db = getDB(event);
  checkAndFlush(db, event.context.cloudflare?.context);

  setHeader(event, 'Cache-Control', 'no-store');

  return payload;
}
