import { getDbFromEvent, getSurveyStats } from '../../../utils/surveys';
import { requireAdmin } from '../../../utils/auth';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const db = getDbFromEvent(event);

  const rows = await db
    .prepare(
      `SELECT s.id, s.slug, s.title, s.description, s.status, s.eligibility_rule, s.created_at, s.activated_at
       FROM surveys s
       ORDER BY s.created_at DESC`
    )
    .all<{
      id: string;
      slug: string;
      title: string;
      description: string | null;
      status: string;
      eligibility_rule: string;
      created_at: number;
      activated_at: number | null;
    }>();

  const surveys = [];
  for (const survey of rows.results || []) {
    const stats = await getSurveyStats(db, survey.id);
    surveys.push({ ...survey, stats });
  }

  return { surveys };
});
