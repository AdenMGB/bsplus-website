import type { H3Event } from 'h3';
import { getDB } from './db';
import { getAccountsOAuthBaseUrl, isLocalDev } from './accounts';

const SETTINGS_ID = 1;
const PRODUCTION_MAIL_URL = 'https://mail.internal.betterseqta.org';

interface IntegrationRow {
  accounts_api_key: string | null;
  mail_api_key: string | null;
  mail_from_address: string | null;
  updated_at: number | null;
}

export interface SiteIntegrationSettings {
  accountsApiKey: string;
  mailApiKey: string;
  mailFromAddress: string;
  hasAccountsApiKey: boolean;
  hasMailApiKey: boolean;
  hasMailFromAddress: boolean;
  updatedAt: number | null;
}

function mapRow(row: IntegrationRow | null): SiteIntegrationSettings {
  const accountsApiKey = String(row?.accounts_api_key ?? '').trim();
  const mailApiKey = String(row?.mail_api_key ?? '').trim();
  const mailFromAddress = String(row?.mail_from_address ?? '').trim();
  return {
    accountsApiKey,
    mailApiKey,
    mailFromAddress,
    hasAccountsApiKey: Boolean(accountsApiKey),
    hasMailApiKey: Boolean(mailApiKey),
    hasMailFromAddress: Boolean(mailFromAddress),
    updatedAt: row?.updated_at ?? null,
  };
}

function getCloudflareEnv(event?: H3Event | null) {
  if (!event) {
    return (globalThis as any).__env__ ?? null;
  }
  return (
    (event as any).context?.cloudflare?.env ??
    (event as any).req?.runtime?.cloudflare?.env ??
    (globalThis as any).__env__ ??
    null
  );
}

function readDevMailUrl(event?: H3Event | null): string | null {
  const cfEnv = getCloudflareEnv(event);
  const raw = cfEnv?.DEV_MAIL_URL ?? process.env.DEV_MAIL_URL ?? null;
  return raw ? String(raw).replace(/\/$/, '') : null;
}

export function getMailApiBaseUrl(event?: H3Event | null): string {
  const cfEnv = getCloudflareEnv(event);
  const config = (() => {
    try {
      return useRuntimeConfig(event as H3Event);
    } catch {
      return {} as Record<string, unknown>;
    }
  })();

  let apiUrl = (
    cfEnv?.BS_MAIL_API_URL ??
    process.env.BS_MAIL_API_URL ??
    (config.bsMailApiUrl as string | undefined) ??
    PRODUCTION_MAIL_URL
  )
    .toString()
    .replace(/\/$/, '');

  const devMailUrl = readDevMailUrl(event);
  if (devMailUrl && isLocalDev(event)) {
    apiUrl = devMailUrl;
  } else if (isLocalDev(event)) {
    apiUrl = 'http://localhost:8789';
  }

  return apiUrl;
}

export async function getSiteIntegrationSettings(event: H3Event): Promise<SiteIntegrationSettings> {
  const cached = (event.context as { siteIntegrationSettings?: SiteIntegrationSettings }).siteIntegrationSettings;
  if (cached) return cached;

  const db = getDB(event);
  const row = await db
    .prepare(
      `SELECT accounts_api_key, mail_api_key, mail_from_address, updated_at
       FROM site_integration_settings WHERE id = ? LIMIT 1`,
    )
    .bind(SETTINGS_ID)
    .first<IntegrationRow>();

  const settings = mapRow(row);
  (event.context as { siteIntegrationSettings?: SiteIntegrationSettings }).siteIntegrationSettings = settings;
  return settings;
}

export async function saveSiteIntegrationSettings(
  event: H3Event,
  input: {
    accountsApiKey?: string;
    mailApiKey?: string;
    mailFromAddress?: string;
  },
  updatedBy: string,
): Promise<void> {
  const db = getDB(event);
  const existing = await getSiteIntegrationSettings(event);
  const accountsApiKey = input.accountsApiKey !== undefined
    ? String(input.accountsApiKey).trim()
    : existing.accountsApiKey;
  const mailApiKey = input.mailApiKey !== undefined
    ? String(input.mailApiKey).trim()
    : existing.mailApiKey;
  const mailFromAddress = input.mailFromAddress !== undefined
    ? String(input.mailFromAddress).trim()
    : existing.mailFromAddress;
  const now = Math.floor(Date.now() / 1000);

  await db
    .prepare(
      `INSERT INTO site_integration_settings (id, accounts_api_key, mail_api_key, mail_from_address, updated_at, updated_by)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         accounts_api_key = excluded.accounts_api_key,
         mail_api_key = excluded.mail_api_key,
         mail_from_address = excluded.mail_from_address,
         updated_at = excluded.updated_at,
         updated_by = excluded.updated_by`,
    )
    .bind(
      SETTINGS_ID,
      accountsApiKey || null,
      mailApiKey || null,
      mailFromAddress || null,
      now,
      updatedBy,
    )
    .run();

  delete (event.context as { siteIntegrationSettings?: SiteIntegrationSettings }).siteIntegrationSettings;
}

export async function getIntegrationDevContext(event: H3Event) {
  return {
    accountsApiUrl: getAccountsOAuthBaseUrl(event),
    mailApiUrl: getMailApiBaseUrl(event),
  };
}
