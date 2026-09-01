import { getDbFromEvent, getSurveyBySlug, getUserSurveyResponse } from '../../../utils/surveys';
import { getOptionalUser } from '../../../utils/auth';
import { fetchFoundingEligibility } from '../../../utils/survey-accounts';
import { verifySurveyInviteToken } from '../../../utils/survey-invite';

interface SurveyAnswers {
  performance_rating: number;
  cloud_features: string;
  improvements: string;
  nps_rating: number;
  referral_source: string;
  additional_feedback?: string;
}

const REFERRAL_SOURCES = new Set([
  'friend',
  'school',
  'social_media',
  'search',
  'extension',
  'other',
]);

const TEXT_ANSWER_MAX = 5000;

function requireTextAnswer(value: unknown, field: string): string {
  const text = String(value ?? '').trim();
  if (!text) {
    throw createError({ statusCode: 400, statusMessage: `${field} is required` });
  }
  return text.slice(0, TEXT_ANSWER_MAX);
}

function validateAnswers(body: Partial<SurveyAnswers>): SurveyAnswers {
  const performance = Number(body.performance_rating);
  const nps = Number(body.nps_rating);

  if (!Number.isFinite(performance) || performance < 1 || performance > 10) {
    throw createError({ statusCode: 400, statusMessage: 'performance_rating must be 1-10' });
  }
  if (!Number.isFinite(nps) || nps < 1 || nps > 10) {
    throw createError({ statusCode: 400, statusMessage: 'nps_rating must be 1-10' });
  }

  const cloudFeatures = requireTextAnswer(body.cloud_features, 'cloud_features');
  const improvements = requireTextAnswer(body.improvements, 'improvements');

  const referral = String(body.referral_source || '').trim();
  if (!REFERRAL_SOURCES.has(referral)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid referral_source' });
  }

  const additional = body.additional_feedback
    ? String(body.additional_feedback).trim().slice(0, TEXT_ANSWER_MAX)
    : undefined;

  return {
    performance_rating: performance,
    cloud_features: cloudFeatures,
    improvements,
    nps_rating: nps,
    referral_source: referral,
    additional_feedback: additional,
  };
}

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug');
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Survey slug is required' });
  }

  const user = await getOptionalUser(event);
  if (!user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Sign in required' });
  }

  const db = getDbFromEvent(event);
  const survey = await getSurveyBySlug(db, slug);
  if (!survey) {
    throw createError({ statusCode: 404, statusMessage: 'Survey not found' });
  }

  if (survey.status !== 'active') {
    throw createError({ statusCode: 403, statusMessage: 'This survey is not accepting responses' });
  }

  const existing = await getUserSurveyResponse(db, survey.id, user.id);
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'You have already completed this survey' });
  }

  const eligibility = await fetchFoundingEligibility(event, user.id);
  if (!eligibility.eligible) {
    throw createError({
      statusCode: 403,
      statusMessage: 'You are not eligible for this survey',
    });
  }

  const body = await readBody<Partial<SurveyAnswers>>(event);
  const answers = validateAnswers(body);

  const query = getQuery(event);
  let inviteAttribution: string | null = null;
  if (typeof query.invite === 'string' && query.invite.trim()) {
    const verified = await verifySurveyInviteToken(query.invite.trim(), survey.id, event, {
      recordClick: false,
    });
    inviteAttribution = verified?.userId ?? null;
  }

  const responseId = crypto.randomUUID();
  const answersPayload = {
    ...answers,
    invite_attribution: inviteAttribution,
    submitted_by: user.id,
  };

  await db
    .prepare(
      `INSERT INTO survey_responses (id, survey_id, user_id, signup_number, answers_json, completed_at)
       VALUES (?, ?, ?, ?, ?, unixepoch())`
    )
    .bind(
      responseId,
      survey.id,
      user.id,
      eligibility.signup_number ?? null,
      JSON.stringify(answersPayload)
    )
    .run();

  return {
    ok: true,
    response_id: responseId,
    signup_number: eligibility.signup_number ?? null,
    badges: eligibility.badges ?? [],
  };
});
