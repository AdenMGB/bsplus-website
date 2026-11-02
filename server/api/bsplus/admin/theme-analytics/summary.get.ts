import { requireAdmin } from '../../../../utils/auth';
import { getDB } from '../../../../utils/db';
import { createApiEnvelope } from '../../../../utils/customThemes';
import {
  getThemeCatalogAnalyticsSummary,
  getThemeDownloadAnalyticsSummary,
} from '../../../../utils/bsplusThemeAnalytics';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const query = getQuery(event);
  const daysRaw = typeof query.days === 'string' ? parseInt(query.days, 10) : 30;
  const days = Number.isFinite(daysRaw) ? Math.min(Math.max(daysRaw, 1), 365) : 30;
  const sinceUnix = Math.floor(Date.now() / 1000) - days * 86400;
  const themeId = typeof query.theme_id === 'string' ? query.theme_id.trim() : null;
  const userId = typeof query.user_id === 'string' ? query.user_id.trim() : null;
  const installId = typeof query.install_id === 'string' ? query.install_id.trim() : null;

  const db = getDB(event);
  const [downloads, catalog] = await Promise.all([
    getThemeDownloadAnalyticsSummary(db, { sinceUnix, themeId, userId, installId, limit: 50 }),
    getThemeCatalogAnalyticsSummary(db, { sinceUnix, userId, installId, limit: 20 }),
  ]);

  return createApiEnvelope({
    period_days: days,
    since_unix: sinceUnix,
    filters: {
      theme_id: themeId,
      user_id: userId,
      install_id: installId,
    },
    downloads,
    catalog,
  });
});
