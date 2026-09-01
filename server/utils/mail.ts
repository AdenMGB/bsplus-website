import type { H3Event } from 'h3';
import { getMailApiBaseUrl, getSiteIntegrationSettings } from './site-integrations';

export interface SendMailRequest {
  from: string;
  to: string;
  subject: string;
  cc?: string;
  bcc?: string;
  template?: 'bsp' | 'raw';
  bodyHtml?: string;
  text?: string;
  html?: string;
  templateOptions?: {
    preheaderText?: string;
    headline?: string;
    kicker?: string;
    secondaryNote?: string;
    helpOrLinkUrl?: string;
    helpOrLinkText?: string;
    ctaUrl?: string;
    ctaLabel?: string;
    unsubscribeUrl?: string;
    year?: number;
  };
}

export interface SendMailResult {
  ok: true;
  data: {
    messageId: string | null;
    messageIds: string[];
    sent: number;
    queued: number;
    totalBatches: number;
    queueId?: string;
    processAfter?: number;
    quotaResetAt: number;
  };
}

export interface MailCredentials {
  apiKey: string;
  from: string;
  apiUrl: string;
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

export async function getMailCredentials(event?: H3Event | null): Promise<MailCredentials> {
  const cfEnv = getCloudflareEnv(event);
  const config = (() => {
    try {
      return useRuntimeConfig(event as H3Event);
    } catch {
      return {} as Record<string, unknown>;
    }
  })();

  let storedApiKey = '';
  let storedFrom = '';
  if (event) {
    try {
      const stored = await getSiteIntegrationSettings(event);
      storedApiKey = stored.mailApiKey;
      storedFrom = stored.mailFromAddress;
    } catch {
      // D1 unavailable during build or tests
    }
  }

  const apiKey =
    storedApiKey
    || String(cfEnv?.BS_MAIL_API_KEY ?? process.env.BS_MAIL_API_KEY ?? (config.bsMailApiKey as string | undefined) ?? '');

  const from =
    storedFrom
    || String(cfEnv?.BS_MAIL_FROM ?? process.env.BS_MAIL_FROM ?? (config.bsMailFrom as string | undefined) ?? '');

  const apiUrl = getMailApiBaseUrl(event);

  return {
    apiKey: String(apiKey || '').trim(),
    from: String(from || '').trim(),
    apiUrl,
  };
}

export async function isMailConfigured(event?: H3Event | null): Promise<boolean> {
  const { apiKey, from } = await getMailCredentials(event);
  return Boolean(apiKey && from);
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Convert plain text into safe HTML paragraphs for BSP bodyHtml. */
export function plainTextToBodyHtml(text: string): string {
  return text
    .trim()
    .split(/\n{2,}/)
    .map((paragraph) => {
      const html = escapeHtml(paragraph).replace(/\n/g, '<br>');
      return `<p>${html}</p>`;
    })
    .join('');
}

export async function sendMail(
  payload: Omit<SendMailRequest, 'from'> & { from?: string },
  event?: H3Event | null
): Promise<SendMailResult> {
  const { apiKey, from: defaultFrom, apiUrl } = await getMailCredentials(event);
  if (!apiKey) {
    throw createError({
      statusCode: 503,
      statusMessage: 'BS_MAIL_API_KEY is not configured',
    });
  }

  const from = (payload.from || defaultFrom).trim();
  if (!from) {
    throw createError({
      statusCode: 503,
      statusMessage: 'BS_MAIL_FROM is not configured',
    });
  }

  const body: SendMailRequest = {
    ...payload,
    from,
    template: payload.template || 'bsp',
  };

  try {
    return await $fetch<SendMailResult>(`${apiUrl}/api/v1/mail/send`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body,
    });
  } catch (e: any) {
    const statusCode = e?.statusCode || e?.response?.status || 502;
    const statusMessage =
      e?.data?.statusMessage ||
      e?.statusMessage ||
      e?.message ||
      'Failed to send email via BetterSEQTA Mail API';
    console.error('[Mail] Send failed:', statusMessage);
    throw createError({
      statusCode,
      statusMessage,
      data: e?.data,
    });
  }
}
