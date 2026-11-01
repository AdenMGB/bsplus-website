import type { H3Event } from 'h3';
import { getOptionalUser } from './auth';
import { isValidInstallId } from './feedback';
import { EXTENSION_CHANNELS } from './bsplusRemoteConfig';

export type BsplusExtensionClientContext = {
  extensionVersion: string | null;
  channel: (typeof EXTENSION_CHANNELS)[number];
  installId: string | null;
  userId: string | null;
};

function parseChannel(raw: unknown): (typeof EXTENSION_CHANNELS)[number] {
  if (typeof raw !== 'string' || !raw.trim()) return 'unknown';
  const channel = raw.trim();
  if (EXTENSION_CHANNELS.includes(channel as (typeof EXTENSION_CHANNELS)[number])) {
    return channel as (typeof EXTENSION_CHANNELS)[number];
  }
  return 'unknown';
}

function parseOptionalUuid(raw: unknown): string | null {
  if (typeof raw !== 'string' || !raw.trim()) return null;
  const value = raw.trim();
  if (!isValidInstallId(value)) return null;
  return value.toLowerCase();
}

function parseExtensionVersion(raw: unknown): string | null {
  if (typeof raw !== 'string' || !raw.trim()) return null;
  const version = raw.trim();
  if (version.length > 32) return null;
  return version;
}

/**
 * Lenient parser for BetterSEQTA+ extension query params on theme/catalog routes.
 * Invalid optional values are dropped (request still succeeds).
 */
export function parseOptionalBsplusExtensionQuery(
  query: Record<string, unknown>
): BsplusExtensionClientContext {
  return {
    extensionVersion: parseExtensionVersion(query.extensionVersion),
    channel: parseChannel(query.channel),
    installId: parseOptionalUuid(query.installId),
    userId: parseOptionalUuid(query.userId),
  };
}

/** Bearer session user wins over query `userId` (download analytics / entitlements). */
export async function resolveBsplusClientUserId(
  event: H3Event,
  queryUserId: string | null | undefined
): Promise<string | null> {
  const sessionUser = await getOptionalUser(event);
  if (sessionUser?.id) {
    return sessionUser.id;
  }
  return queryUserId ?? null;
}

/** Updates last_seen when the install was previously registered (no insert). */
export async function touchBsplusInstallActivity(
  db: { prepare: (sql: string) => { bind: (...args: unknown[]) => { run: () => Promise<unknown> } } },
  context: BsplusExtensionClientContext,
  resolvedUserId: string | null
): Promise<void> {
  if (!context.installId) return;
  const now = Math.floor(Date.now() / 1000);
  const channel = context.channel === 'unknown' ? null : context.channel;
  await db
    .prepare(
      `UPDATE bsplus_installs SET
         last_seen_at = ?,
         extension_version = COALESCE(?, extension_version),
         channel = COALESCE(?, channel),
         user_id = COALESCE(?, user_id)
       WHERE install_id = ?`
    )
    .bind(now, context.extensionVersion, channel, resolvedUserId, context.installId)
    .run();
}
