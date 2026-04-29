import { getDB } from '../../../utils/db';
import { getOptionalUser } from '../../../utils/auth';
import { formatPublicThemeResponse } from '../../../utils/formatPublicTheme';
import { loadFlavoursForMasters } from '../../../utils/themeFlavours';

export default defineEventHandler(async (event) => {
  const db = getDB(event);
  const rawSlug = getRouterParam(event, 'slug');
  const user = await getOptionalUser(event);

  const slug = rawSlug ? decodeURIComponent(rawSlug) : '';

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Theme slug is required'
    });
  }

  const theme = (await db
    .prepare('SELECT * FROM themes WHERE slug = ? AND status = ?')
    .bind(slug, 'approved')
    .first()) as Record<string, unknown> | null;

  if (!theme) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Theme not found'
    });
  }

  let isFavorited = false;
  if (user) {
    const favorite = await db
      .prepare('SELECT id FROM user_favorites WHERE user_id = ? AND theme_id = ?')
      .bind(user.id, theme.id as string)
      .first();
    isFavorited = !!favorite;
  }

  const tid = theme.id as string;
  const flavoursOpts =
    theme.theme_type === 'betterseqta' && !theme.flavour_master_id
      ? {
          flavours: (await loadFlavoursForMasters(db, [tid])).get(tid) ?? []
        }
      : undefined;

  return formatPublicThemeResponse(theme, isFavorited, flavoursOpts);
});
