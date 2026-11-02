import { createApiEnvelope } from './customThemes';
import {
  isValidOverrideKind,
  newOverrideId,
  parseAudienceRule,
  serializeAudienceRule,
  type RemoteConfigOverrideRow,
} from './bsplusRemoteConfigTargeting';
import { isValidInstallId } from './feedback';

function validationError(message: string): never {
  throw createError({ statusCode: 422, statusMessage: message });
}

function nowUnix(): number {
  return Math.floor(Date.now() / 1000);
}

function parseJsonObject(value: unknown): Record<string, unknown> | null {
  if (value == null || value === '') return null;
  if (typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  if (typeof value !== 'string') return null;
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === 'object' && parsed && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export function mapOverrideRow(row: RemoteConfigOverrideRow) {
  let value: unknown = null;
  try {
    value = JSON.parse(row.value_json);
  } catch {
    value = row.value_json;
  }
  return {
    id: row.id,
    scope: row.scope,
    scopeId: row.scope_id,
    kind: row.kind,
    targetKey: row.target_key,
    value,
    enabled: row.enabled === 1,
    note: row.note,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function listOverrides(
  db: any,
  query: { scope?: string; scopeId?: string; limit?: number }
) {
  const limit = Math.min(query.limit ?? 100, 500);
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (query.scope) {
    conditions.push('scope = ?');
    params.push(query.scope);
  }
  if (query.scopeId) {
    conditions.push('scope_id = ?');
    params.push(query.scopeId.trim().toLowerCase());
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await db
    .prepare(
      `SELECT * FROM bsplus_remote_config_overrides ${where}
       ORDER BY updated_at DESC
       LIMIT ?`
    )
    .bind(...params, limit)
    .all();

  return ((result.results || []) as RemoteConfigOverrideRow[]).map(mapOverrideRow);
}

/** Overrides for a cloud user and their install IDs (user-scoped + per-install). */
export async function listOverridesForClient(
  db: any,
  input: { userId: string; installIds: string[]; limit?: number },
) {
  const limit = Math.min(input.limit ?? 200, 500);
  const userId = input.userId.trim().toLowerCase();
  const installIds = [...new Set(input.installIds.map((id) => id.trim().toLowerCase()).filter(Boolean))];

  if (!installIds.length) {
    return listOverrides(db, { scope: 'user', scopeId: userId, limit });
  }

  const installPlaceholders = installIds.map(() => '?').join(', ');
  const result = await db
    .prepare(
      `SELECT * FROM bsplus_remote_config_overrides
       WHERE (scope = 'user' AND scope_id = ?)
          OR (scope = 'install' AND scope_id IN (${installPlaceholders}))
       ORDER BY updated_at DESC
       LIMIT ?`,
    )
    .bind(userId, ...installIds, limit)
    .all();

  return ((result.results || []) as RemoteConfigOverrideRow[]).map(mapOverrideRow);
}

export async function createOverride(db: any, body: Record<string, unknown>) {
  const scope = typeof body.scope === 'string' ? body.scope.trim() : '';
  if (scope !== 'install' && scope !== 'user') {
    validationError('scope must be install or user');
  }

  const scopeIdRaw = typeof body.scopeId === 'string' ? body.scopeId : typeof body.scope_id === 'string' ? body.scope_id : '';
  if (!isValidInstallId(scopeIdRaw)) {
    validationError('scopeId must be a valid UUID');
  }

  const kind = typeof body.kind === 'string' ? body.kind.trim() : '';
  if (!isValidOverrideKind(kind)) {
    validationError('Invalid override kind');
  }

  const targetKey =
    typeof body.targetKey === 'string'
      ? body.targetKey.trim()
      : typeof body.target_key === 'string'
        ? body.target_key.trim()
        : null;

  const value = body.value !== undefined ? body.value : body.value_json;
  if (value === undefined) {
    validationError('value is required');
  }

  const valueJson = typeof value === 'string' ? value : JSON.stringify(value);
  if (!valueJson || valueJson.length > 32_768) {
    validationError('value_json too large');
  }

  const note = typeof body.note === 'string' ? body.note.trim().slice(0, 500) : null;
  const enabled = body.enabled !== false;
  const id = newOverrideId();
  const now = nowUnix();

  await db
    .prepare(
      `INSERT INTO bsplus_remote_config_overrides (
         id, scope, scope_id, kind, target_key, value_json, enabled, note, created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      scope,
      scopeIdRaw.toLowerCase(),
      kind,
      targetKey,
      valueJson,
      enabled ? 1 : 0,
      note,
      now,
      now
    )
    .run();

  const row = await db
    .prepare('SELECT * FROM bsplus_remote_config_overrides WHERE id = ?')
    .bind(id)
    .first<RemoteConfigOverrideRow>();
  return mapOverrideRow(row!);
}

export async function patchOverride(db: any, id: string, body: Record<string, unknown>) {
  const existing = await db
    .prepare('SELECT * FROM bsplus_remote_config_overrides WHERE id = ?')
    .bind(id)
    .first<RemoteConfigOverrideRow>();
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Override not found' });
  }

  let valueJson = existing.value_json;
  if (body.value !== undefined || body.value_json !== undefined) {
    const value = body.value !== undefined ? body.value : body.value_json;
    valueJson = typeof value === 'string' ? value : JSON.stringify(value);
  }

  const enabled =
    body.enabled !== undefined ? (body.enabled !== false ? 1 : 0) : existing.enabled;
  const note =
    body.note !== undefined
      ? typeof body.note === 'string'
        ? body.note.trim().slice(0, 500)
        : null
      : existing.note;

  const updatedAt = nowUnix();
  await db
    .prepare(
      `UPDATE bsplus_remote_config_overrides SET
         value_json = ?, enabled = ?, note = ?, updated_at = ?
       WHERE id = ?`
    )
    .bind(valueJson, enabled, note, updatedAt, id)
    .run();

  const row = await db
    .prepare('SELECT * FROM bsplus_remote_config_overrides WHERE id = ?')
    .bind(id)
    .first<RemoteConfigOverrideRow>();
  return mapOverrideRow(row!);
}

export async function deleteOverride(db: any, id: string): Promise<boolean> {
  const result = await db
    .prepare('DELETE FROM bsplus_remote_config_overrides WHERE id = ?')
    .bind(id)
    .run();
  return (result.meta?.changes ?? 0) > 0;
}

export function parseTargetingFromBody(
  body: Record<string, unknown>
): string | null | undefined {
  if (!('targeting' in body) && !('targeting_json' in body) && !('targetingJson' in body)) {
    return undefined;
  }
  const raw = body.targeting ?? body.targetingJson ?? body.targeting_json;
  if (raw === null) return null;
  const rule = parseAudienceRule(raw);
  if (raw !== null && raw !== undefined && !rule && typeof raw === 'object') {
    validationError('Invalid targeting audience rule');
  }
  if (raw !== null && raw !== undefined && !rule && typeof raw === 'string' && raw.trim()) {
    validationError('Invalid targeting audience rule');
  }
  return serializeAudienceRule(rule);
}
