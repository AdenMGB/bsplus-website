import { getDB } from '../../utils/db';

export default defineEventHandler(async (event) => {
  const db = getDB(event);
  const query = getQuery(event);
  const limit = Number(query.limit) || 20;
  const offset = Number(query.offset) || 0;
  
  // Check if admin request - verify auth
  let showDrafts = false;
  if (query.admin === 'true') {
    const user = await $fetch<any>('/api/auth/me', {
      headers: {
        cookie: getHeader(event, 'cookie') || ''
      }
    }).catch(() => null);
    
    if (user && user.is_admin === 1) {
      showDrafts = true;
    }
  }

  let sql = 'SELECT * FROM news';
  if (!showDrafts) {
    sql += ' WHERE published = 1';
  }
  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';

  const { results } = await db.prepare(sql).bind(limit, offset).all();
  return results;
});

