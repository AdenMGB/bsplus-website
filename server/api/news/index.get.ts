import { getDB } from '../../utils/db';

export default defineEventHandler(async (event) => {
  const db = getDB(event);
  const query = getQuery(event);
  const limit = Number(query.limit) || 20;
  const offset = Number(query.offset) || 0;
  
  // If ?admin=true is passed, check for auth and return drafts too
  // This is a simple check, in reality we'd check the session
  const showDrafts = query.admin === 'true'; // Simplified, logic should be robust in real app

  let sql = 'SELECT * FROM news';
  if (!showDrafts) {
    sql += ' WHERE published = 1';
  }
  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';

  const { results } = await db.prepare(sql).bind(limit, offset).all();
  return results;
});

