import type { H3Event } from 'h3';
import { getDbFromEvent } from './surveys';

export interface SurveyInviteRecord {
  id: string;
  user_id: string;
  email: string;
  display_name: string | null;
  signup_number: number | null;
  invite_token: string;
  clicked_at: number | null;
  status: string;
}

function toBase64Url(bytes: Uint8Array): string {
  const binary = String.fromCharCode(...bytes);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Cryptographically random per-recipient token (stored in survey_email_queue.invite_token). */
export function generateSurveyInviteToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
}

export async function lookupSurveyInvite(
  db: any,
  surveyId: string,
  token: string,
  options?: { recordClick?: boolean },
): Promise<SurveyInviteRecord | null> {
  const trimmed = token.trim();
  if (!trimmed) return null;

  const row = await db
    .prepare(
      `SELECT id, user_id, email, display_name, signup_number, invite_token, clicked_at, status
       FROM survey_email_queue
       WHERE survey_id = ? AND invite_token = ?
       LIMIT 1`,
    )
    .bind(surveyId, trimmed)
    .first<SurveyInviteRecord>();

  if (!row) return null;

  if (options?.recordClick && row.clicked_at == null) {
    const now = Math.floor(Date.now() / 1000);
    await db
      .prepare(
        `UPDATE survey_email_queue
         SET clicked_at = ?
         WHERE id = ? AND clicked_at IS NULL`,
      )
      .bind(now, row.id)
      .run();
    row.clicked_at = now;
  }

  return row;
}

export function isFounding2500Signup(signupNumber: number | null | undefined): boolean {
  return signupNumber != null && signupNumber > 0 && signupNumber <= 2500;
}

/** Resolve invite token from D1; records first click when recordClick is true. */
export async function verifySurveyInviteToken(
  token: string,
  surveyId: string,
  event?: H3Event | null,
  options?: { recordClick?: boolean },
): Promise<{ userId: string } | null> {
  const db = getDbFromEvent(event as H3Event);
  const row = await lookupSurveyInvite(db, surveyId, token, {
    recordClick: options?.recordClick ?? true,
  });
  if (!row) return null;
  return { userId: row.user_id };
}
