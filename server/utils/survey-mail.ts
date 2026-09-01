import type { H3Event } from 'h3';
import { escapeHtml, getMailCredentials, sendMail } from './mail';

export interface MailQuota {
  limit: number;
  used: number;
  available: number;
  windowSeconds: number;
  quotaResetAt: number;
  queuePending: number;
}

export interface SurveyEmailRecipient {
  email: string;
  displayName?: string | null;
  signupNumber?: number | null;
  inviteToken: string;
}

function siteBaseUrl(event?: H3Event | null): string {
  try {
    const config = useRuntimeConfig(event as H3Event);
    return String(config.public?.siteUrl || 'https://betterseqta.org').replace(/\/$/, '');
  } catch {
    return 'https://betterseqta.org';
  }
}

export async function getMailQuota(event?: H3Event | null): Promise<MailQuota> {
  const { apiKey, apiUrl } = await getMailCredentials(event);
  if (!apiKey) {
    throw createError({
      statusCode: 503,
      statusMessage: 'BS_MAIL_API_KEY is not configured',
    });
  }

  try {
    const response = await $fetch<{ ok: true; data: MailQuota }>(`${apiUrl}/api/v1/mail/quota`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    return response.data;
  } catch (error: any) {
    const statusCode = error?.statusCode || error?.response?.status || 502;
    throw createError({
      statusCode,
      statusMessage: error?.data?.statusMessage || error?.statusMessage || 'Failed to fetch mail quota',
      data: error?.data,
    });
  }
}

export function buildSurveyInviteUrl(
  slug: string,
  inviteToken: string,
  event?: H3Event | null
): string {
  const base = siteBaseUrl(event);
  return `${base}/surveys/${encodeURIComponent(slug)}?invite=${encodeURIComponent(inviteToken)}`;
}

const FOUNDER_TIER_LABELS = [
  { threshold: 10, label: 'Pioneer' },
  { threshold: 25, label: 'Early Adopter' },
  { threshold: 50, label: 'Founding Member' },
  { threshold: 100, label: 'Centurion' },
  { threshold: 250, label: 'Quarter Thousand' },
  { threshold: 500, label: 'Half Thousand' },
  { threshold: 1000, label: 'Thousand Club' },
  { threshold: 2500, label: 'Founding Cloud' },
] as const;

function founderBadgeLabel(signupNumber: number | null | undefined): string {
  if (!signupNumber || signupNumber <= 0) return 'Founding Cloud';
  return FOUNDER_TIER_LABELS.find((tier) => signupNumber <= tier.threshold)?.label ?? 'Founding Cloud';
}

function surveyBodyHtml(
  displayName: string,
  signupNumber: number | null | undefined,
  badgeLabel: string,
): string {
  const name = escapeHtml(displayName || 'there');
  const tag = escapeHtml(badgeLabel);
  const numberText =
    signupNumber && signupNumber > 0
      ? `#${signupNumber.toLocaleString()}`
      : 'one of the first 2,500';

  return `
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#d4d4d8;">
  <tr>
    <td style="padding:0 0 16px 0;font-size:16px;line-height:1.6;">
      Hi ${name},
    </td>
  </tr>
  <tr>
    <td style="padding:0 0 16px 0;font-size:16px;line-height:1.6;">
      Congrats on being part of <strong style="color:#fafafa;">${tag}</strong>! You're the <strong style="color:#fafafa;">${escapeHtml(numberText)}</strong> user to ever sign up for BetterSEQTA Cloud. Let's celebrate that for a sec.
    </td>
  </tr>
  <tr>
    <td style="padding:0 0 16px 0;font-size:16px;line-height:1.6;">
      We're planning what's next for BetterSEQTA+ and DesQTA, and we wanted to ask early members directly. The link below is a short form for founding Cloud members. Should only take a few minutes.
    </td>
  </tr>
  <tr>
    <td style="padding:0;font-size:16px;line-height:1.6;">
      Thanks,<br />BetterSEQTA team
    </td>
  </tr>
</table>`.trim();
}

export async function sendSurveyCampaignEmail(
  slug: string,
  recipient: SurveyEmailRecipient,
  event?: H3Event | null,
  options?: { test?: boolean },
) {
  const displayName = recipient.displayName?.trim() || 'there';
  const signupNumber = recipient.signupNumber;
  const badgeLabel = founderBadgeLabel(signupNumber);
  const signupLabel =
    signupNumber && signupNumber > 0
      ? `#${signupNumber.toLocaleString()}`
      : 'founding member';

  const ctaUrl = buildSurveyInviteUrl(slug, recipient.inviteToken, event);
  const testPrefix = options?.test ? '[TEST] ' : '';
  const signupPhrase =
    signupNumber && signupNumber > 0
      ? `You're ${signupLabel} (${badgeLabel})!`
      : `You're part of ${badgeLabel}!`;

  return sendMail(
    {
      to: recipient.email,
      subject: `${testPrefix}${signupPhrase}`,
      template: 'bsp',
      bodyHtml: surveyBodyHtml(displayName, signupNumber, badgeLabel),
      templateOptions: {
        preheaderText: `${options?.test ? 'Test send. ' : ''}${signupNumber && signupNumber > 0 ? `You're the ${signupLabel} user to ever join Cloud.` : `You're one of the first 2,500 Cloud members.`}`,
        headline: `Congrats, ${badgeLabel}!`,
        secondaryNote: 'Sent to the email on your BetterSEQTA Cloud account.',
        ctaUrl,
        ctaLabel: 'Open form',
        year: new Date().getFullYear(),
      },
    },
    event
  );
}
