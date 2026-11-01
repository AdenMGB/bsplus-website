import { fetchApprovedCustomThemeList } from '../../utils/customThemes';
import { getDB } from '../../utils/db';
import { maybeRecordThemeCatalogEvent } from '../../utils/bsplusThemeAnalytics';

export default defineEventHandler(async (event) => {
  const response = await fetchApprovedCustomThemeList(event);
  maybeRecordThemeCatalogEvent(event, getDB(event), {
    query: getQuery(event) as Record<string, unknown>,
    eventType: 'list',
    route: '/api/custom-themes',
  });
  return response;
});
