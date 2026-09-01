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

function surveyBodyHtml(displayName: string, signupNumber: number | null | undefined): string {
  const name = escapeHtml(displayName || 'there');
  const numberText =
    signupNumber && signupNumber > 0
      ? `#${signupNumber.toLocaleString()}`
      : 'in the first 2,500';

  return `
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#d4d4d8;">
  <tr>
    <td style="padding:0 0 16px 0;font-size:16px;line-height:1.6;">
      Hi ${name},
    </td>
  </tr>
  <tr>
    <td style="padding:0 0 16px 0;font-size:16px;line-height:1.6;">
      You signed up for BetterSEQTA Cloud as user <strong style="color:#fafafa;">${escapeHtml(numberText)}</strong>. We are planning what to build next for BetterSEQTA+ and DesQTA, and we wanted to ask early members directly.
    </td>
  </tr>
  <tr>
    <td style="padding:0 0 16px 0;font-size:16px;line-height:1.6;">
      The link below opens a short form for founding Cloud members. It should only take a few minutes.
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
  const signupLabel =
    recipient.signupNumber && recipient.signupNumber > 0
      ? `#${recipient.signupNumber.toLocaleString()}`
      : 'founding member';

  const ctaUrl = buildSurveyInviteUrl(slug, recipient.inviteToken, event);
  const testPrefix = options?.test ? '[TEST] ' : '';

  return sendMail(
    {
      to: recipient.email,
      subject: `${testPrefix}Cloud user ${signupLabel}: quick question`,
      template: 'bsp',
      bodyHtml: surveyBodyHtml(displayName, recipient.signupNumber),
      templateOptions: {
        preheaderText: `${options?.test ? 'Test send. ' : ''}A short form for founding Cloud members (${signupLabel}).`,
        headline: `Cloud user ${signupLabel}`,
        secondaryNote: 'Sent to the email on your BetterSEQTA Cloud account.',
        ctaUrl,
        ctaLabel: 'Open form',
        year: new Date().getFullYear(),
      },
    },
    event
  );
}
