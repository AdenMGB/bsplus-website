import { getDB } from '../../utils/db';
import { getOptionalUser } from '../../utils/auth';
import { formatPublicThemeResponse } from '../../utils/formatPublicTheme';
import { loadFlavoursForMasters } from '../../utils/themeFlavours';

export default defineEventHandler(async (event) => {
  const db = getDB(event);
  const id = getRouterParam(event, 'id');
  const user = await getOptionalUser(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Theme ID is required'
    });
  }

  const theme = (await db
    .prepare('SELECT * FROM themes WHERE id = ? AND status = ?')
    .bind(id, 'approved')
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
      .bind(user.id, id)
      .first();
    isFavorited = !!favorite;
  }

  const flavoursOpts =
    theme.theme_type === 'betterseqta' && !theme.flavour_master_id
      ? {
          flavours: (await loadFlavoursForMasters(db, [id as string])).get(id) ?? []
        }
      : undefined;

  return formatPublicThemeResponse(theme, isFavorited, flavoursOpts);
});
