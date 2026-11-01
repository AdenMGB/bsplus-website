import { fetchApprovedCustomThemeList } from '../../utils/customThemes';
import { getDB } from '../../utils/db';
import { maybeRecordThemeCatalogEvent } from '../../utils/bsplusThemeAnalytics';

/** Backward-compatible alias: accepts `q` and returns a `query` field in the response. */
export default defineEventHandler(async (event) => {
  const response = await fetchApprovedCustomThemeList(event, { includeSearchQuery: true });
  maybeRecordThemeCatalogEvent(event, getDB(event), {
    query: getQuery(event) as Record<string, unknown>,
    eventType: 'search',
    route: '/api/custom-themes/search',
  });
  return response;
});
