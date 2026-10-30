import { getBsplusAdminThemePreview, parseBsplusThemeSource } from '../../../../../utils/bsplusAdminThemes';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Theme ID is required' });
  }
  const query = getQuery(event);
  const source = parseBsplusThemeSource(query.source);
  return getBsplusAdminThemePreview(event, id, source);
});
