import { fetchApprovedCustomThemeList } from '../../utils/customThemes';

/** Backward-compatible alias: accepts `q` and returns a `query` field in the response. */
export default defineEventHandler((event) =>
  fetchApprovedCustomThemeList(event, { includeSearchQuery: true })
);
