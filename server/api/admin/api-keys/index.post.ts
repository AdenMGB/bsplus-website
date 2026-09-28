import { getDB } from '../../../utils/db';
import { requireAdmin } from '../../../utils/auth';
import {
  generateServiceApiKeyToken,
  hashServiceApiKeyToken,
} from '../../../utils/requireServiceApiKey';

const DEFAULT_SCOPES = ['surveys:read'];

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const db = getDB(event);

  const body = await readBody<{ name?: string; scopes?: string[] }>(event);
  const name = String(body?.name || '').trim();
  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'API key name is required' });
  }

  const scopes = Array.isArray(body?.scopes) && body.scopes.length > 0
    ? body.scopes.map(String)
    : DEFAULT_SCOPES;

  const id = crypto.randomUUID();
  const token = generateServiceApiKeyToken();
  const tokenHash = await hashServiceApiKeyToken(token);

  await db
    .prepare(
      `INSERT INTO service_api_keys (id, name, token_hash, scopes, created_at)
       VALUES (?, ?, ?, ?, unixepoch())`
    )
    .bind(id, name, tokenHash, JSON.stringify(scopes))
    .run();

  return {
    id,
    name,
    token,
    scopes,
    message: 'Copy this token now — it will not be shown again.',
  };
});
