import { getDbFromEvent, getSurveyBySlug, getSurveyStats, getUserSurveyResponse } from '../../../utils/surveys';
import { getOptionalUser } from '../../../utils/auth';
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

  const user = await getOptionalUser(event);
  const stats = await getSurveyStats(db, survey.id);

  let completed = false;
  let invitePayload: Record<string, unknown> | null = null;

  const inviteParam = getQuery(event).invite;
  if (typeof inviteParam === 'string' && inviteParam.trim()) {
    const inviteRow = await lookupSurveyInvite(db, survey.id, inviteParam.trim(), {
      recordClick: true,
    });

    if (inviteRow) {
      const inviteCompleted = Boolean(
        await getUserSurveyResponse(db, survey.id, inviteRow.user_id),
      );
      invitePayload = {
        valid: true,
        user_id: inviteRow.user_id,
        display_name: inviteRow.display_name,
        signup_number: inviteRow.signup_number,
        eligible: isFounding2500Signup(inviteRow.signup_number),
        completed: inviteCompleted,
        clicked_at: inviteRow.clicked_at,
        email_sent: inviteRow.status === 'sent',
      };
      if (inviteCompleted) {
        completed = true;
      }
    } else {
      invitePayload = { valid: false };
    }
  }

  if (user?.id) {
    const existing = await getUserSurveyResponse(db, survey.id, user.id);
    completed = Boolean(existing);
  }

  return {
    slug: survey.slug,
    title: survey.title,
    description: survey.description,
    status: survey.status,
    active: survey.status === 'active',
    stats,
    auth: {
      logged_in: Boolean(user),
      user_id: user?.id ?? null,
      displayName: user?.displayName ?? user?.username ?? null,
    },
    completed,
    invite: invitePayload,
    invite_attribution: invitePayload?.valid ? (invitePayload.user_id as string) : null,
  };
});
