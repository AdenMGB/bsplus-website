import { getDB } from '../../../utils/db';
import { requireAdmin } from '../../../utils/auth';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const db = getDB(event);

  const rows = await db
    .prepare(
      `SELECT id, name, scopes, created_at, last_used_at, revoked_at
       FROM service_api_keys
       ORDER BY created_at DESC`
    )
    .all();

  const keys = (rows.results || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    scopes: (() => {
      try {
        return JSON.parse(row.scopes || '[]');
      } catch {
        return [];
      }
    })(),
    created_at: row.created_at,
    last_used_at: row.last_used_at,
    revoked_at: row.revoked_at,
    active: !row.revoked_at,
  }));

  return { keys };
});
