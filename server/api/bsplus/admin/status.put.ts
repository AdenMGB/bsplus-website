import { requireAdmin } from '../../../utils/auth';
import { writeBsStatus } from '../../../utils/bsStatus';

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event);
  return writeBsStatus(event, await readBody(event), String(admin.username || admin.id));
});
