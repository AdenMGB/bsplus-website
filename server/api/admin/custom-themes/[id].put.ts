import { requireAdmin } from '../../../../utils/auth';
import {
  adminUpdateCustomThemeMetadata,
  type AdminUpdateCustomThemeBody
} from '../../../../utils/adminCustomThemeUpdates';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const id = getRouterParam(event, 'id');
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Theme ID is required' });
  }
  const body = await readBody<AdminUpdateCustomThemeBody>(event);
  return adminUpdateCustomThemeMetadata(event, id, body);
});
