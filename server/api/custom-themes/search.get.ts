import { fetchApprovedCustomThemeList } from '../../utils/customThemes';

/** Accepts `q` and returns a `query` field in the response. */
export default defineEventHandler((event) => fetchApprovedCustomThemeList(event, { includeSearchQuery: true }));
