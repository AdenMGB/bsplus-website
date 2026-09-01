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

function celebrationBodyHtml(displayName: string, signupNumber: number | null | undefined): string {
  const name = escapeHtml(displayName || 'there');
  const numberText =
    signupNumber && signupNumber > 0
      ? `#${signupNumber.toLocaleString()}`
      : 'one of our first 2,500';

  return `
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="font-family:Inter,Arial,sans-serif;color:#18181b;">
  <tr>
    <td style="padding:0 0 16px 0;font-size:18px;line-height:1.5;">
      Hi ${name},
    </td>
  </tr>
  <tr>
    <td style="padding:0 0 16px 0;font-size:16px;line-height:1.6;">
      🎉 BetterSEQTA Cloud just crossed <strong>2,500 members</strong> — and you signed up as user <strong>${escapeHtml(numberText)}</strong>.
    </td>
  </tr>
  <tr>
    <td style="padding:0 0 16px 0;font-size:16px;line-height:1.6;">
      We would love a few minutes of your feedback as a founding Cloud member. Your answers help us decide what to build next for BetterSEQTA+ and DesQTA.
    </td>
  </tr>
  <tr>
    <td style="padding:0 0 8px 0;font-size:14px;line-height:1.5;color:#52525b;">
      Thank you for being part of the journey from the very beginning. ✨
    </td>
  </tr>
</table>`.trim();
}

export async function sendSurveyCampaignEmail(
  slug: string,
  recipient: SurveyEmailRecipient,
  event?: H3Event | null
) {
  const displayName = recipient.displayName?.trim() || 'BetterSEQTA member';
  const signupLabel =
    recipient.signupNumber && recipient.signupNumber > 0
      ? `#${recipient.signupNumber.toLocaleString()}`
      : 'founding member';

  const ctaUrl = buildSurveyInviteUrl(slug, recipient.inviteToken, event);

  return sendMail(
    {
      to: recipient.email,
      subject: `You're user ${signupLabel} — we want to hear from you 🎉`,
      template: 'bsp',
      bodyHtml: celebrationBodyHtml(displayName, recipient.signupNumber),
      templateOptions: {
        preheaderText: `BetterSEQTA Cloud hit 2,500 users. Share your feedback as user ${signupLabel}.`,
        headline: `You're user ${signupLabel}`,
        kicker: 'BetterSEQTA Cloud — 2,500 Users',
        secondaryNote: 'This short survey is only for our first 2,500 Cloud members.',
        ctaUrl,
        ctaLabel: 'Share your feedback',
        year: new Date().getFullYear(),
      },
    },
    event
  );
}
