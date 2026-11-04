import { requireAdmin } from '../../../utils/auth';
import { readBsStatus } from '../../../utils/bsStatus';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  return readBsStatus(event);
});
