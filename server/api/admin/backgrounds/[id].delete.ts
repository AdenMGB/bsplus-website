import { requireAdmin } from '../../../utils/auth';
import { deleteCssBackground } from '../../../utils/cssBackgrounds';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing background id' });
  }

  const deleted = await deleteCssBackground(event, id);
  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Background not found' });
  }

  return {
    success: true,
    data: { id },
    error: null,
    meta: { timestamp: Date.now() },
  };
});
