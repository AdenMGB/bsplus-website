import { getDbFromEvent, getSurveyBySlug, getUserSurveyResponse } from '../../../utils/surveys';
import { getOptionalUser, requireAdmin } from '../../../utils/auth';
import { fetchFoundingEligibility } from '../../../utils/survey-accounts';
import { isFounding2500Signup, lookupSurveyInvite } from '../../../utils/survey-invite';

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug');
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Survey slug is required' });
  }

  const db = getDbFromEvent(event);
  const survey = await getSurveyBySlug(db, slug);
  if (!survey) {
    throw createError({ statusCode: 404, statusMessage: 'Survey not found' });
  }

  const query = getQuery(event);
  const userIdParam = query.userId;

  if (typeof userIdParam === 'string' && userIdParam.trim()) {
    await requireAdmin(event);
    const userId = userIdParam.trim();
    const existing = await getUserSurveyResponse(db, survey.id, userId);
    const eligibility = await fetchFoundingEligibility(event, userId);
    return {
      user_id: userId,
      eligible: eligibility.eligible,
      signup_number: eligibility.signup_number ?? null,
      completed: Boolean(existing),
      badges: eligibility.badges ?? [],
    };
  }

  const inviteParam = query.invite;
  if (typeof inviteParam === 'string' && inviteParam.trim()) {
    const inviteRow = await lookupSurveyInvite(db, survey.id, inviteParam.trim(), {
      recordClick: true,
    });
    if (!inviteRow) {
      throw createError({ statusCode: 404, statusMessage: 'Invalid or expired survey invite link' });
    }

    const existing = await getUserSurveyResponse(db, survey.id, inviteRow.user_id);
    const eligible = isFounding2500Signup(inviteRow.signup_number);

    return {
      user_id: inviteRow.user_id,
      eligible,
      signup_number: inviteRow.signup_number ?? null,
      completed: Boolean(existing),
      badges: [],
      displayName: inviteRow.display_name,
      invite_valid: true,
      survey_status: survey.status,
    };
  }

  const user = await getOptionalUser(event);
  if (!user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Sign in required' });
  }

  const existing = await getUserSurveyResponse(db, survey.id, user.id);
  const eligibility = await fetchFoundingEligibility(event, user.id);

  return {
    user_id: user.id,
    eligible: eligibility.eligible,
    signup_number: eligibility.signup_number ?? null,
    completed: Boolean(existing),
    badges: eligibility.badges ?? [],
    displayName: eligibility.displayName ?? user.displayName ?? user.username,
    created_at: eligibility.created_at ?? null,
    survey_status: survey.status,
  };
});
