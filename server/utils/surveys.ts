import type { H3Event } from 'h3';
import { getDB } from './db';

export type SurveyStatus = 'draft' | 'active' | 'closed';
export type EmailQueueStatus = 'pending' | 'sent' | 'failed' | 'skipped';

export interface SurveyRow {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: SurveyStatus;
  eligibility_rule: string;
  created_at: number;
  activated_at: number | null;
}

export interface SurveyResponseRow {
  id: string;
  survey_id: string;
  user_id: string;
  signup_number: number | null;
  answers_json: string;
  completed_at: number;
}

export interface SurveyEmailQueueRow {
  id: string;
  survey_id: string;
  user_id: string;
  email: string;
  display_name: string | null;
  signup_number: number | null;
  invite_token: string;
  status: EmailQueueStatus;
  sent_at: number | null;
  error: string | null;
  attempts: number;
}

export interface SurveyStats {
  response_count: number;
  queue_pending: number;
  queue_sent: number;
  queue_failed: number;
  queue_skipped: number;
  queue_clicked: number;
}

export async function getSurveyBySlug(db: any, slug: string): Promise<SurveyRow | null> {
  return db
    .prepare(
      `SELECT id, slug, title, description, status, eligibility_rule, created_at, activated_at
       FROM surveys WHERE slug = ?`
    )
    .bind(slug)
    .first<SurveyRow>();
}

export async function getSurveyStats(db: any, surveyId: string): Promise<SurveyStats> {
  const responses = await db
    .prepare(`SELECT COUNT(*) AS count FROM survey_responses WHERE survey_id = ?`)
    .bind(surveyId)
    .first<{ count: number }>();

  const queueRows = await db
    .prepare(
      `SELECT status, COUNT(*) AS count
       FROM survey_email_queue
       WHERE survey_id = ?
       GROUP BY status`
    )
    .bind(surveyId)
    .all<{ status: EmailQueueStatus; count: number }>();

  const queueCounts: Record<EmailQueueStatus, number> = {
    pending: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
  };

  for (const row of queueRows.results || []) {
    queueCounts[row.status] = Number(row.count) || 0;
  }

  const clicked = await db
    .prepare(
      `SELECT COUNT(*) AS count FROM survey_email_queue
       WHERE survey_id = ? AND clicked_at IS NOT NULL`,
    )
    .bind(surveyId)
    .first<{ count: number }>();

  return {
    response_count: Number(responses?.count) || 0,
    queue_pending: queueCounts.pending,
    queue_sent: queueCounts.sent,
    queue_failed: queueCounts.failed,
    queue_skipped: queueCounts.skipped,
    queue_clicked: Number(clicked?.count) || 0,
  };
}

export async function getUserSurveyResponse(
  db: any,
  surveyId: string,
  userId: string
): Promise<SurveyResponseRow | null> {
  return db
    .prepare(
      `SELECT id, survey_id, user_id, signup_number, answers_json, completed_at
       FROM survey_responses
       WHERE survey_id = ? AND user_id = ?`
    )
    .bind(surveyId, userId)
    .first<SurveyResponseRow>();
}

export function getDbFromEvent(event: H3Event | { cloudflare?: { env?: { DB?: any } } }): any {
  return getDB(event);
}
