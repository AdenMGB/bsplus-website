import { getDbFromEvent, getSurveyBySlug } from '../../../../../utils/surveys';
import { requireAdmin } from '../../../../../utils/auth';
import { findFoundingMemberByEmail } from '../../../../../utils/survey-accounts';
import { generateSurveyInviteToken } from '../../../../../utils/survey-invite';
import { buildSurveyInviteUrl, sendSurveyCampaignEmail } from '../../../../../utils/survey-mail';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const slug = getRouterParam(event, 'slug');
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Survey slug is required' });
  }

  const body = await readBody<{ email?: string }>(event);
  const email = body?.email?.trim().toLowerCase();
  if (!email || !email.includes('@')) {
    throw createError({ statusCode: 400, statusMessage: 'A valid email is required' });
  }

  const db = getDbFromEvent(event);
  const survey = await getSurveyBySlug(db, slug);
  if (!survey) {
    throw createError({ statusCode: 404, statusMessage: 'Survey not found' });
  }

  const member = await findFoundingMemberByEmail(event, email);
  if (!member) {
    throw createError({
      statusCode: 404,
      statusMessage: 'No founding 2,500 member found with that email',
    });
  }

  const inviteToken = generateSurveyInviteToken();
  const existingQueue = await db
    .prepare(
      `SELECT id FROM survey_email_queue
       WHERE survey_id = ? AND user_id = ?
       LIMIT 1`,
    )
    .bind(survey.id, member.id)
    .first<{ id: string }>();

  if (existingQueue) {
    await db
      .prepare(
        `UPDATE survey_email_queue
         SET email = ?, display_name = ?, signup_number = ?, invite_token = ?, error = NULL
         WHERE id = ?`,
      )
      .bind(
        member.email,
        member.displayName || member.username || null,
        member.signup_number,
        inviteToken,
        existingQueue.id,
      )
      .run();
  } else {
    await db
      .prepare(
        `INSERT INTO survey_email_queue (
          id, survey_id, user_id, email, display_name, signup_number, invite_token, status, attempts
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 0)`,
      )
      .bind(
        crypto.randomUUID(),
        survey.id,
        member.id,
        member.email,
        member.displayName || member.username || null,
        member.signup_number,
        inviteToken,
      )
      .run();
  }

  await sendSurveyCampaignEmail(
    slug,
    {
      email: member.email,
      displayName: member.displayName || member.username,
      signupNumber: member.signup_number,
      inviteToken,
    },
    event,
    { test: true },
  );

  const inviteUrl = buildSurveyInviteUrl(slug, inviteToken, event);

  return {
    ok: true,
    test: true,
    email: member.email,
    user_id: member.id,
    signup_number: member.signup_number,
    display_name: member.displayName || member.username || null,
    invite_url: inviteUrl,
  };
});
