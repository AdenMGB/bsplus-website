import type { H3Event } from 'h3';
import { getDB } from './db';
import { fetchFounding2500Members } from './survey-accounts';

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

export interface SurveyMemberInfo {
  display_name: string | null;
  email: string | null;
  username: string | null;
}

export interface SurveyResponseOverview {
  total_responses: number;
  avg_performance_rating: number | null;
  avg_nps_rating: number | null;
  performance_distribution: Record<number, number>;
  nps_distribution: Record<number, number>;
  referral_sources: Record<string, number>;
  with_additional_feedback: number;
}

export interface ParsedSurveyResponse {
  id: string;
  user_id: string;
  signup_number: number | null;
  answers_json: string;
  completed_at: number;
  answers: Record<string, unknown> | null;
  display_name?: string | null;
  email?: string | null;
  username?: string | null;
}

export function parseSurveyAnswersJson(answersJson: string): Record<string, unknown> | null {
  try {
    return JSON.parse(answersJson);
  } catch {
    return null;
  }
}

export function computeSurveyResponseOverview(
  responses: Array<{ answers: Record<string, unknown> | null }>,
): SurveyResponseOverview {
  const performanceValues: number[] = [];
  const npsValues: number[] = [];
  const performanceDistribution: Record<number, number> = {};
  const npsDistribution: Record<number, number> = {};
  const referralSources: Record<string, number> = {};
  let withAdditionalFeedback = 0;

  for (const response of responses) {
    const answers = response.answers || {};
    const performance = Number(answers.performance_rating);
    const nps = Number(answers.nps_rating);
    const referral = String(answers.referral_source || '').trim();
    const additionalFeedback = String(answers.additional_feedback || '').trim();

    if (Number.isFinite(performance) && performance >= 1 && performance <= 10) {
      performanceValues.push(performance);
      performanceDistribution[performance] = (performanceDistribution[performance] || 0) + 1;
    }

    if (Number.isFinite(nps) && nps >= 1 && nps <= 10) {
      npsValues.push(nps);
      npsDistribution[nps] = (npsDistribution[nps] || 0) + 1;
    }

    if (referral) {
      referralSources[referral] = (referralSources[referral] || 0) + 1;
    }

    if (additionalFeedback) {
      withAdditionalFeedback += 1;
    }
  }

  const average = (values: number[]) =>
    values.length ? Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10 : null;

  return {
    total_responses: responses.length,
    avg_performance_rating: average(performanceValues),
    avg_nps_rating: average(npsValues),
    performance_distribution: performanceDistribution,
    nps_distribution: npsDistribution,
    referral_sources: referralSources,
    with_additional_feedback: withAdditionalFeedback,
  };
}

async function loadSurveyMemberMap(
  event: H3Event,
  db: any,
  surveyId: string,
  userIds: string[],
): Promise<Map<string, SurveyMemberInfo>> {
  const memberMap = new Map<string, SurveyMemberInfo>();
  if (!userIds.length) return memberMap;

  const placeholders = userIds.map(() => '?').join(', ');
  const queueRows = await db
    .prepare(
      `SELECT user_id, display_name, email
       FROM survey_email_queue
       WHERE survey_id = ? AND user_id IN (${placeholders})`,
    )
    .bind(surveyId, ...userIds)
    .all<{ user_id: string; display_name: string | null; email: string | null }>();

  for (const row of queueRows.results || []) {
    memberMap.set(row.user_id, {
      display_name: row.display_name,
      email: row.email,
      username: null,
    });
  }

  const missingNames = userIds.filter((userId) => {
    const info = memberMap.get(userId);
    return !info?.display_name;
  });

  if (!missingNames.length) return memberMap;

  try {
    const members = await fetchFounding2500Members(event);
    for (const member of members) {
      if (!missingNames.includes(member.id)) continue;

      const existing = memberMap.get(member.id);
      memberMap.set(member.id, {
        display_name: member.displayName || member.username || existing?.display_name || null,
        email: member.email || existing?.email || null,
        username: member.username || existing?.username || null,
      });
    }
  } catch {
    // Accounts export unavailable — keep queue data only.
  }

  return memberMap;
}

export async function enrichSurveyResponsesWithMemberInfo(
  event: H3Event,
  db: any,
  surveyId: string,
  responses: ParsedSurveyResponse[],
): Promise<ParsedSurveyResponse[]> {
  const userIds = [...new Set(responses.map((response) => response.user_id))];
  const memberMap = await loadSurveyMemberMap(event, db, surveyId, userIds);

  return responses.map((response) => {
    const member = memberMap.get(response.user_id);
    return {
      ...response,
      display_name: member?.display_name ?? null,
      email: member?.email ?? null,
      username: member?.username ?? null,
    };
  });
}
