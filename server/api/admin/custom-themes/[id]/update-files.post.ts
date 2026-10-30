import { requireAdmin } from '../../../../utils/auth';
import { adminUpdateCustomThemeFiles } from '../../../../utils/adminCustomThemeUpdates';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const id = getRouterParam(event, 'id');
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Theme ID is required' });
  }
  return adminUpdateCustomThemeFiles(event, id);
});
