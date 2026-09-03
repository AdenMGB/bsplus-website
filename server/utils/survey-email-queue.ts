import type { H3Event } from 'h3';
import { isMailSendConfirmed } from './mail';
import { getMailQuota, sendSurveyCampaignEmail } from './survey-mail';

export const SURVEY_EMAIL_MAX_BATCH_SIZE = 40;
/** Max emails per override drain when quota checks are skipped. */
export const SURVEY_EMAIL_IGNORE_QUOTA_BATCH_SIZE = 500;

export interface SurveyEmailDrainResult {
  skipped: boolean;
  reason?: 'quota_exhausted' | 'queue_empty' | 'quota_check_failed';
  quotaResetAt?: number;
  batchSize?: number;
  sent?: number;
  failed?: number;
  skippedInvalid?: number;
  failedDetails?: Array<{ id: string; error: string }>;
  quota?: Awaited<ReturnType<typeof getMailQuota>>;
  error?: string;
  ignoreQuota?: boolean;
}

function resolveQuotaAvailable(quota: Awaited<ReturnType<typeof getMailQuota>>): number {
  if (quota.unlimited || quota.enabled === false) {
    return SURVEY_EMAIL_MAX_BATCH_SIZE;
  }
  return Math.max(Number(quota.available) || 0, 0);
}

/**
 * Drain pending survey_email_queue rows up to mail quota and batch cap.
 * Used by cron and immediately after admin seeds the queue.
 */
export async function drainSurveyEmailQueue(
  db: any,
  event?: H3Event | null,
  options?: { surveyId?: string; useFullQuota?: boolean; ignoreQuota?: boolean },
): Promise<SurveyEmailDrainResult> {
  const ignoreQuota = options?.ignoreQuota === true || options?.useFullQuota === true;

  let quota: Awaited<ReturnType<typeof getMailQuota>> | undefined;
  if (!ignoreQuota) {
    try {
      quota = await getMailQuota(event ?? null);
    } catch (error: unknown) {
      const message = error && typeof error === 'object' && 'statusMessage' in error
        ? String((error as { statusMessage?: string }).statusMessage)
        : error instanceof Error ? error.message : 'quota check failed';
      return { skipped: true, reason: 'quota_check_failed', error: message };
    }

    const available = resolveQuotaAvailable(quota);
    if (available <= 0) {
      return {
        skipped: true,
        reason: 'quota_exhausted',
        quotaResetAt: quota.quotaResetAt,
        quota,
      };
    }
  }

  const surveyFilter = options?.surveyId ? 'AND q.survey_id = ?' : '';
  const pendingCountRow = await db
    .prepare(
      `SELECT COUNT(*) AS count FROM survey_email_queue q
       WHERE q.status = 'pending' ${surveyFilter}`,
    )
    .bind(...(options?.surveyId ? [options.surveyId] : []))
    .first<{ count: number }>();

  const pendingCount = Number(pendingCountRow?.count) || 0;
  if (pendingCount <= 0) {
    return { skipped: true, reason: 'queue_empty', quota, ignoreQuota };
  }

  let batchSize: number;
  if (ignoreQuota) {
    batchSize = Math.min(pendingCount, SURVEY_EMAIL_IGNORE_QUOTA_BATCH_SIZE);
  } else {
    const available = resolveQuotaAvailable(quota!);
    batchSize = options?.useFullQuota
      ? Math.min(available, pendingCount)
      : Math.min(available, SURVEY_EMAIL_MAX_BATCH_SIZE, pendingCount);
  }
  const pendingRows = await db
    .prepare(
      `SELECT q.id, q.survey_id, q.user_id, q.email, q.display_name, q.signup_number, q.invite_token, q.attempts,
              s.slug AS survey_slug
       FROM survey_email_queue q
       JOIN surveys s ON s.id = q.survey_id
       WHERE q.status = 'pending' ${surveyFilter}
       ORDER BY (q.signup_number IS NULL), q.signup_number ASC, q.id ASC
       LIMIT ?`,
    )
    .bind(...(options?.surveyId ? [options.surveyId, batchSize] : [batchSize]))
    .all<{
      id: string;
      survey_id: string;
      user_id: string;
      email: string;
      display_name: string | null;
      signup_number: number | null;
      invite_token: string;
      attempts: number;
      survey_slug: string;
    }>();

  const sent: string[] = [];
  const failed: Array<{ id: string; error: string }> = [];
  const skippedInvalid: string[] = [];

  for (const row of pendingRows.results || []) {
    const email = row.email?.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      await db
        .prepare(
          `UPDATE survey_email_queue
           SET status = 'skipped', error = 'invalid_email', attempts = attempts + 1
           WHERE id = ?`,
        )
        .bind(row.id)
        .run();
      skippedInvalid.push(row.id);
      continue;
    }

    try {
      const mailResult = await sendSurveyCampaignEmail(
        row.survey_slug,
        {
          email,
          displayName: row.display_name,
          signupNumber: row.signup_number,
          inviteToken: row.invite_token,
        },
        event ?? null,
      );

      if (!isMailSendConfirmed(mailResult)) {
        const message = 'BS Mail did not confirm send';
        await db
          .prepare(
            `UPDATE survey_email_queue
             SET status = 'failed', error = ?, attempts = attempts + 1
             WHERE id = ?`,
          )
          .bind(message, row.id)
          .run();
        failed.push({ id: row.id, error: message });
        continue;
      }

      await db
        .prepare(
          `UPDATE survey_email_queue
           SET status = 'sent', sent_at = unixepoch(), error = NULL, attempts = attempts + 1
           WHERE id = ?`,
        )
        .bind(row.id)
        .run();
      sent.push(row.id);
    } catch (error: unknown) {
      const message = String(
        error && typeof error === 'object' && 'statusMessage' in error
          ? (error as { statusMessage?: string }).statusMessage
          : error instanceof Error ? error.message : 'send failed',
      ).slice(0, 500);
      await db
        .prepare(
          `UPDATE survey_email_queue
           SET status = 'failed', error = ?, attempts = attempts + 1
           WHERE id = ?`,
        )
        .bind(message, row.id)
        .run();
      failed.push({ id: row.id, error: message });
    }
  }

  return {
    skipped: false,
    batchSize,
    sent: sent.length,
    failed: failed.length,
    skippedInvalid: skippedInvalid.length,
    failedDetails: failed.slice(0, 5),
    quota,
    ignoreQuota,
  };
}
