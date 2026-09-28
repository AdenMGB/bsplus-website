import type { H3Event } from 'h3';
import { getDB } from './db';

export interface ServiceApiKeyRecord {
  id: string;
  name: string;
  scopes: string[];
}

async function hashToken(token: string): Promise<string> {
  const data = new TextEncoder().encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function parseScopes(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function extractApiToken(event: H3Event): string | null {
  const authHeader = getHeader(event, 'authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const bearer = authHeader.slice(7).trim();
    if (bearer) return bearer;
  }

  const apiKeyHeader = getHeader(event, 'x-api-key');
  return apiKeyHeader?.trim() || null;
}

export async function requireServiceApiKey(
  event: H3Event,
  requiredScope?: string
): Promise<ServiceApiKeyRecord> {
  const token = extractApiToken(event);
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid or missing API key',
    });
  }

  const db = getDB(event);
  const tokenHash = await hashToken(token);

  const row = await db
    .prepare(
      `SELECT id, name, scopes
       FROM service_api_keys
       WHERE token_hash = ? AND revoked_at IS NULL`
    )
    .bind(tokenHash)
    .first<{ id: string; name: string; scopes: string }>();

  if (!row) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid or missing API key',
    });
  }

  const scopes = parseScopes(row.scopes);
  if (requiredScope && !scopes.includes(requiredScope) && !scopes.includes('*')) {
    throw createError({
      statusCode: 403,
      statusMessage: `API key missing required scope: ${requiredScope}`,
    });
  }

  await db
    .prepare(`UPDATE service_api_keys SET last_used_at = unixepoch() WHERE id = ?`)
    .bind(row.id)
    .run();

  return {
    id: row.id,
    name: row.name,
    scopes,
  };
}

export function generateServiceApiKeyToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  const segment = Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
  return `bs_${segment}`;
}

export async function hashServiceApiKeyToken(token: string): Promise<string> {
  return hashToken(token);
}
