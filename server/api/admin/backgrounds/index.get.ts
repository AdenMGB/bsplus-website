import { requireAdmin } from '../../../utils/auth';
import { getDB } from '../../../utils/db';
import {
  CSS_BACKGROUND_PUBLIC_PATH,
  mapCssBackgroundForAdmin,
  type CssBackgroundRow,
} from '../../../utils/cssBackgrounds';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const db = getDB(event);

  const { results } = await db
    .prepare(
      `SELECT id, r2_key, original_filename, width, height, byte_size, enabled, created_by, created_at
       FROM css_backgrounds
       ORDER BY created_at DESC`
    )
    .all<CssBackgroundRow>();

  const backgrounds = (results ?? []).map(mapCssBackgroundForAdmin);

  return {
    success: true,
    data: {
      public_url_path: CSS_BACKGROUND_PUBLIC_PATH,
      backgrounds,
    },
    error: null,
    meta: { timestamp: Date.now() },
  };
});
