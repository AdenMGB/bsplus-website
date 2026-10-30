import { serveApprovedCustomBetterseqtaThemeJson } from '../../../utils/customThemes';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Theme ID required' });
  }

  return serveApprovedCustomBetterseqtaThemeJson(event, id, { incrementDownload: true });
});
