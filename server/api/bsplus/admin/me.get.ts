import { createApiEnvelope } from '../../../utils/customThemes';
import { requireBsplusAdmin } from '../../../utils/bsplusAdminThemes';

export default defineEventHandler(async (event) => {
  const user = await requireBsplusAdmin(event);
  return createApiEnvelope({
    id: user.id,
    username: user.username,
    admin_level: user.admin_level ?? 0,
    is_admin: true
  });
});
