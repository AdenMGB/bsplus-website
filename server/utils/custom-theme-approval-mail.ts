import type { H3Event } from 'h3';
import { THEME_SUBMITTER_BADGE_KEY, type EnsureThemeSubmitterBadgeResult } from './accounts-badges';
import { fetchAccountsUserById } from './accounts-user-export';
import { getDB } from './db';
import { customThemeR2Key, getCustomThemeById, nowUnixSeconds } from './customThemes';
import {
  escapeHtml,
  isMailConfigured,
  isMailSendConfirmed,
  sendMail,
} from './mail';

export const THEME_SUBMITTER_BADGE_LABEL = 'Theme Submitter';

function siteBaseUrl(event?: H3Event | null): string {
  try {
    const config = useRuntimeConfig(event as H3Event);
    return String(config.public?.siteUrl || 'https://betterseqta.org').replace(/\/$/, '');
  } catch {
    return 'https://betterseqta.org';
  }
}

function absoluteAssetUrl(siteUrl: string, url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string' || !url.trim()) return null;
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (trimmed.startsWith('/')) return `${siteUrl}${trimmed}`;
  return `${siteUrl}/${trimmed}`;
}

export function resolveCustomThemeBannerUrl(
  theme: Record<string, unknown>,
  siteUrl: string
): string | null {
  const fromRow = absoluteAssetUrl(siteUrl, theme.cover_image_url as string | undefined);
  if (fromRow) return fromRow;
  const id = String(theme.id ?? '');
  if (!id) return null;
  return `${siteUrl}/api/images/${customThemeR2Key(id, 'images', 'banner.webp')}`;
}

function badgeEmailLine(badge?: EnsureThemeSubmitterBadgeResult | null): string {
  if (!badge || badge.skipped_reason === 'missing_author_id') {
    return `You may earn the <strong style="color:#fafafa;">${escapeHtml(THEME_SUBMITTER_BADGE_LABEL)}</strong> badge on your BetterSEQTA Cloud profile when your theme is listed.`;
  }
  if (badge.already_had_badge) {
    return `You already have the <strong style="color:#fafafa;">${escapeHtml(THEME_SUBMITTER_BADGE_LABEL)}</strong> badge on your BetterSEQTA Cloud profile — thanks again for contributing to the community.`;
  }
  if (badge.awarded) {
    return `We've added the <strong style="color:#fafafa;">${escapeHtml(THEME_SUBMITTER_BADGE_LABEL)}</strong> badge (${escapeHtml(THEME_SUBMITTER_BADGE_KEY)}) to your BetterSEQTA Cloud profile.`;
  }
  return `The <strong style="color:#fafafa;">${escapeHtml(THEME_SUBMITTER_BADGE_LABEL)}</strong> badge is awarded when a community theme is approved — check your Cloud profile shortly.`;
}

function approvalBodyHtml(params: {
  greeting: string;
  themeName: string;
  themeDescription: string;
  authorLine: string;
  badgeHtml: string;
  bannerUrl: string | null;
}): string {
  const description = escapeHtml(params.themeDescription).slice(0, 600);
  const bannerBlock = params.bannerUrl
    ? `<tr>
    <td style="padding:8px 0 20px 0;">
      <img
        src="${escapeHtml(params.bannerUrl)}"
        alt="${escapeHtml(params.themeName)} banner"
        width="560"
        style="display:block;max-width:100%;height:auto;border-radius:12px;border:1px solid rgba(255,255,255,0.08);"
      />
    </td>
  </tr>`
    : '';

  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="color:#e4e4e7;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;">
  <tr>
    <td style="padding:0 0 12px 0;font-size:16px;line-height:1.6;">${params.greeting}</td>
  </tr>
  <tr>
    <td style="padding:0 0 16px 0;font-size:16px;line-height:1.6;">
      Great news — your community theme <strong style="color:#fafafa;">${escapeHtml(params.themeName)}</strong> has been approved and is now available for other BetterSEQTA+ users.
    </td>
  </tr>
  ${bannerBlock}
  <tr>
    <td style="padding:0 0 12px 0;font-size:15px;line-height:1.6;color:#a1a1aa;">
      ${description}${params.themeDescription.length > 600 ? '…' : ''}
    </td>
  </tr>
  <tr>
    <td style="padding:0 0 16px 0;font-size:14px;line-height:1.6;color:#a1a1aa;">${escapeHtml(params.authorLine)}</td>
  </tr>
  <tr>
    <td style="padding:0 0 16px 0;font-size:16px;line-height:1.6;">${params.badgeHtml}</td>
  </tr>
  <tr>
    <td style="padding:0;font-size:16px;line-height:1.6;">Thanks for sharing your work,<br />The BetterSEQTA+ team</td>
  </tr>
</table>`.trim();
}

export type SendCustomThemeApprovalEmailResult = {
  sent: boolean;
  reason?: string;
  recipient?: string;
};

export async function sendCustomThemeApprovalEmail(
  event: H3Event,
  theme: Record<string, unknown>,
  badge?: EnsureThemeSubmitterBadgeResult | null
): Promise<SendCustomThemeApprovalEmailResult> {
  if (!(await isMailConfigured(event))) {
    return { sent: false, reason: 'Mail is not configured' };
  }

  const authorId = typeof theme.author_id === 'string' ? theme.author_id.trim() : '';
  if (!authorId) {
    return { sent: false, reason: 'Theme has no author_id' };
  }

  const accountsUser = await fetchAccountsUserById(event, authorId);
  const email = accountsUser?.email?.trim().toLowerCase();
  if (!email || !email.includes('@')) {
    return { sent: false, reason: 'No Cloud account email found for submitter' };
  }

  const siteUrl = siteBaseUrl(event);
  const themeName = String(theme.name ?? 'Your theme');
  const themeDescription = String(theme.description ?? '');
  const displayName =
    accountsUser?.displayName?.trim() ||
    (typeof theme.author === 'string' ? theme.author.trim() : '') ||
    'there';
  const greeting = displayName === 'there' ? 'Hi,' : `Hi ${escapeHtml(displayName)},`;
  const bannerUrl = resolveCustomThemeBannerUrl(theme, siteUrl);
  const authorLine = `Submitted as ${String(theme.author ?? displayName)}.`;
  const badgeHtml = badgeEmailLine(badge);
  const bodyHtml = approvalBodyHtml({
    greeting,
    themeName,
    themeDescription,
    authorLine,
    badgeHtml,
    bannerUrl,
  });

  const plainBadge =
    badge?.awarded && !badge?.already_had_badge
      ? `You've been granted the ${THEME_SUBMITTER_BADGE_LABEL} badge on BetterSEQTA Cloud.`
      : badge?.already_had_badge
        ? `You already have the ${THEME_SUBMITTER_BADGE_LABEL} badge on your Cloud profile.`
        : `The ${THEME_SUBMITTER_BADGE_LABEL} badge is part of our contributor recognition on BetterSEQTA Cloud.`;

  const text = [
    displayName === 'there' ? 'Hi,' : `Hi ${displayName},`,
    '',
    `Your community theme "${themeName}" has been approved.`,
    themeDescription ? themeDescription.slice(0, 800) : '',
    '',
    plainBadge,
    '',
    'Thanks for sharing your work,',
    'The BetterSEQTA+ team',
  ]
    .filter(Boolean)
    .join('\n');

  const mailResult = await sendMail(
    {
      to: email,
      subject: `Your theme “${themeName}” was approved`,
      template: 'bsp',
      bodyHtml,
      text,
      bypassQuota: true,
      templateOptions: {
        kicker: 'Community themes',
        headline: `Approved: ${themeName}`,
        preheaderText: `Your theme was approved. ${THEME_SUBMITTER_BADGE_LABEL} badge update inside.`,
        secondaryNote: 'Sent to the email on your BetterSEQTA Cloud account.',
        ctaUrl: `${siteUrl}/themes`,
        ctaLabel: 'Browse the theme store',
        helpOrLinkUrl: 'https://accounts.betterseqta.org',
        helpOrLinkText: 'BetterSEQTA Cloud',
        year: new Date().getFullYear(),
      },
    },
    event
  );

  if (!isMailSendConfirmed(mailResult)) {
    return { sent: false, reason: 'Mail API did not confirm delivery', recipient: email };
  }

  return { sent: true, recipient: email };
}

export async function recordCustomThemeApprovalEmailSent(
  event: H3Event,
  themeId: string,
  at?: number
): Promise<void> {
  const db = getDB(event);
  const ts = at ?? nowUnixSeconds();
  try {
    await db
      .prepare('UPDATE custom_themes SET approval_emailed_at = ?, updated_at = ? WHERE id = ?')
      .bind(ts, ts, themeId)
      .run();
  } catch {
    // Column missing until migration 030
  }
}

export async function notifyCustomThemeApproved(
  event: H3Event,
  themeId: string,
  badge?: EnsureThemeSubmitterBadgeResult | null
): Promise<SendCustomThemeApprovalEmailResult> {
  const db = getDB(event);
  const theme = await getCustomThemeById(db, themeId);
  if (!theme || theme.status !== 'approved') {
    return { sent: false, reason: 'Theme is not approved' };
  }

  if (theme.approval_emailed_at != null && Number(theme.approval_emailed_at) > 0) {
    return { sent: false, reason: 'Approval email was already sent' };
  }

  const result = await sendCustomThemeApprovalEmail(event, theme, badge);
  if (result.sent) {
    await recordCustomThemeApprovalEmailSent(event, themeId);
  }
  return result;
}

export async function countApprovedThemesMissingApprovalEmail(db: any): Promise<number> {
  try {
    const row = await db
      .prepare(
        `SELECT COUNT(*) AS total FROM custom_themes
         WHERE status = 'approved' AND is_current_version = 1
           AND (approval_emailed_at IS NULL OR approval_emailed_at = 0)`
      )
      .first<{ total?: number }>();
    return Number(row?.total ?? 0);
  } catch {
    return 0;
  }
}

export async function sendMissingCustomThemeApprovalEmails(
  event: H3Event,
  options?: { limit?: number }
): Promise<{ sent: number; failed: number; skipped: number; results: Array<{ id: string; sent: boolean; reason?: string }> }> {
  const db = getDB(event);
  const limit = Math.min(Math.max(options?.limit ?? 25, 1), 100);

  let rows: { id: string }[] = [];
  try {
    const result = (await db
      .prepare(
        `SELECT id FROM custom_themes
         WHERE status = 'approved' AND is_current_version = 1
           AND (approval_emailed_at IS NULL OR approval_emailed_at = 0)
         ORDER BY COALESCE(published_at, reviewed_at, created_at) ASC
         LIMIT ?`
      )
      .bind(limit)
      .all()) as { results?: { id: string }[] };
    rows = result.results ?? [];
  } catch {
    return { sent: 0, failed: 0, skipped: 0, results: [] };
  }

  let sent = 0;
  let failed = 0;
  const results: Array<{ id: string; sent: boolean; reason?: string }> = [];

  for (const row of rows) {
    const outcome = await notifyCustomThemeApproved(event, row.id, null);
    results.push({ id: row.id, sent: outcome.sent, reason: outcome.reason });
    if (outcome.sent) sent += 1;
    else failed += 1;
  }

  return { sent, failed, skipped: 0, results };
}