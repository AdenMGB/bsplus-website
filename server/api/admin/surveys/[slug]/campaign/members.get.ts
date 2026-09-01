import { requireAdmin } from '../../../../../utils/auth';
import { fetchFounding2500Members } from '../../../../../utils/survey-accounts';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const query = getQuery(event);
  const search = String(query.q || query.search || '').trim().toLowerCase();
  const limit = Math.min(Math.max(Number(query.limit) || 100, 1), 500);

  const members = await fetchFounding2500Members(event);

  let filtered = members;
  if (search) {
    filtered = members.filter((user) => {
      const email = user.email?.toLowerCase() || '';
      const name = user.displayName?.toLowerCase() || '';
      const username = user.username?.toLowerCase() || '';
      const signup = String(user.signup_number ?? '');
      return (
        email.includes(search)
        || name.includes(search)
        || username.includes(search)
        || signup.includes(search)
      );
    });
  }

  const results = filtered.slice(0, limit).map((user) => ({
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    username: user.username,
    signup_number: user.signup_number,
  }));

  return {
    ok: true,
    total: members.length,
    count: results.length,
    members: results,
  };
});
