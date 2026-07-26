import type { H3Event } from 'h3';
import { getAccountsApiCredentials } from './accounts';
import {
  escapeHtml,
  isMailConfigured,
  plainTextToBodyHtml,
  sendMail,
} from './mail';
import { toIsoTimestamp } from './feedback';

interface FeedbackRow {
  id: string;
  category: string;
  subject: string | null;
  message: string;
  status: string;
  admin_response: string | null;
  contact_included: number | boolean;
  contact_name: string | null;
  contact_email: string | null;
  extension_version?: string | null;
  browser?: string | null;
  created_at: number;
}

interface AdminUser {
  email?: string;
  admin_level?: number;
  is_admin?: number;
}

function siteBaseUrl(event?: H3Event | null): string {
  try {
    const config = useRuntimeConfig(event as H3Event);
    return String(config.public?.siteUrl || 'https://betterseqta.org').replace(/\/$/, '');
  } catch {
    return 'https://betterseqta.org';
  }
}

function formatLabel(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export async function fetchAdminEmails(event?: H3Event | null): Promise<string[]> {
  const { apiKey, url: baseUrl } = getAccountsApiCredentials(event as H3Event);
  if (!apiKey) {
    console.warn('[FeedbackMail] ACCOUNTS_API_KEY missing; cannot resolve admin emails');
    return [];
  }

  const res = await $fetch<{ users: AdminUser[] }>(`${baseUrl}/api/export/users/full`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'X-API-Key': apiKey,
    },
  });

  const emails = new Set<string>();
  for (const user of res?.users || []) {
    const isAdmin =
      (typeof user.admin_level === 'number' && user.admin_level >= 1) ||
      user.is_admin === 1;
    const email = user.email?.trim().toLowerCase();
    if (isAdmin && email && email.includes('@')) {
      emails.add(email);
    }
  }

  return [...emails];
}

export async function sendFeedbackReplyEmail(
  row: FeedbackRow,
  responseText: string,
  event?: H3Event | null
): Promise<{ sent: boolean; reason?: string }> {
  if (!isMailConfigured(event)) {
    return { sent: false, reason: 'Mail is not configured' };
  }

  if (!row.contact_included || !row.contact_email) {
    return { sent: false, reason: 'No contact email on this submission' };
  }

  const name = row.contact_name?.trim();
  const subject = `Re: ${row.subject || 'Your BetterSEQTA+ feedback'} [${row.id}]`;
  const greeting = name ? `Hi ${escapeHtml(name)},` : 'Hi,';
  const bodyHtml = `
    <p>${greeting}</p>
    ${plainTextToBodyHtml(responseText)}
    <p>Thanks,<br>The BetterSEQTA+ team</p>
    <p><strong>Reference:</strong> ${escapeHtml(row.id)}</p>
  `;

  await sendMail(
    {
      to: row.contact_email,
      subject,
      bodyHtml,
      text: `${name ? `Hi ${name}` : 'Hi'},\n\n${responseText.trim()}\n\nThanks,\nThe BetterSEQTA+ team\n\nReference: ${row.id}`,
      templateOptions: {
        kicker: 'Feedback reply',
        headline: 'Response to your feedback',
        preheaderText: 'The BetterSEQTA+ team replied to your feedback',
        secondaryNote: `Reference ${row.id}`,
        ctaUrl: `${siteBaseUrl(event)}/privacy`,
        ctaLabel: 'Privacy policy',
      },
    },
    event
  );

  return { sent: true };
}

export async function sendAdminFeedbackDigest(
  db: any,
  event?: H3Event | null
): Promise<{
  notified: number;
  admins: number;
  skipped: boolean;
  reason?: string;
}> {
  if (!isMailConfigured(event)) {
    return { notified: 0, admins: 0, skipped: true, reason: 'Mail is not configured' };
  }

  const pending = await db
    .prepare(
      `SELECT id, category, subject, message, status, created_at,
              contact_included, contact_name, extension_version, browser
       FROM feedback_submissions
       WHERE admin_notified_at IS NULL
         AND status != 'spam'
       ORDER BY created_at ASC
       LIMIT 50`
    )
    .all();

  const items = (pending.results || []) as FeedbackRow[];
  if (!items.length) {
    return { notified: 0, admins: 0, skipped: true, reason: 'No unnotified feedback' };
  }

  const admins = await fetchAdminEmails(event);
  if (!admins.length) {
    return { notified: 0, admins: 0, skipped: true, reason: 'No admin emails found' };
  }

  const base = siteBaseUrl(event);
  const listHtml = items
    .map((item) => {
      const title = escapeHtml(item.subject || 'Untitled feedback');
      const meta = `${formatLabel(item.category)} · ${formatLabel(item.status)} · ${toIsoTimestamp(item.created_at)}`;
      const preview = escapeHtml((item.message || '').slice(0, 180));
      return `
        <li style="margin-bottom: 12px;">
          <p style="margin: 0 0 4px;">
            <a href="${base}/admin/feedback/${escapeHtml(item.id)}"><strong>${title}</strong></a>
          </p>
          <p style="margin: 0; color: #666; font-size: 13px;">${escapeHtml(meta)}</p>
          <p style="margin: 4px 0 0; color: #444; font-size: 13px;">${preview}${(item.message || '').length > 180 ? '…' : ''}</p>
        </li>
      `;
    })
    .join('');

  const subject =
    items.length === 1
      ? `[BetterSEQTA+] New extension feedback: ${items[0]!.subject || items[0]!.id}`
      : `[BetterSEQTA+] ${items.length} new extension feedback submissions`;

  const bodyHtml = `
    <p>There ${items.length === 1 ? 'is' : 'are'} <strong>${items.length}</strong> new BetterSEQTA+ feedback ${items.length === 1 ? 'item' : 'items'} to triage.</p>
    <ul>${listHtml}</ul>
    <p>Open the admin inbox to respond.</p>
  `;

  const [primary, ...rest] = admins;
  await sendMail(
    {
      to: primary!,
      bcc: rest.length ? rest.join(',') : undefined,
      subject,
      bodyHtml,
      text: `New BetterSEQTA+ feedback (${items.length}):\n\n${items
        .map(
          (item) =>
            `- ${item.subject || 'Untitled'} [${item.id}]\n  ${base}/admin/feedback/${item.id}`
        )
        .join('\n\n')}`,
      templateOptions: {
        kicker: 'Admin digest',
        headline: 'New extension feedback',
        preheaderText: `${items.length} feedback item(s) awaiting triage`,
        ctaUrl: `${base}/admin/feedback`,
        ctaLabel: 'Open feedback inbox',
      },
    },
    event
  );

  const now = Math.floor(Date.now() / 1000);
  const ids = items.map((item) => item.id);
  const placeholders = ids.map(() => '?').join(',');
  await db
    .prepare(
      `UPDATE feedback_submissions
       SET admin_notified_at = ?
       WHERE id IN (${placeholders})`
    )
    .bind(now, ...ids)
    .run();

  return { notified: items.length, admins: admins.length, skipped: false };
}
