import { requireAdmin } from '../../../utils/auth';
import { getDB } from '../../../utils/db';
import {
  countApprovedThemesMissingApprovalEmail,
  sendMissingCustomThemeApprovalEmails
} from '../../../utils/custom-theme-approval-mail';
import { createApiEnvelope } from '../../../utils/customThemes';

interface Body {
  limit?: number;
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const db = getDB(event);
  const body = (await readBody<Body>(event).catch(() => ({}))) ?? {};

  const remainingBefore = await countApprovedThemesMissingApprovalEmail(db);
  const batch = await sendMissingCustomThemeApprovalEmails(event, { limit: body.limit });
  const remainingAfter = await countApprovedThemesMissingApprovalEmail(db);

  return createApiEnvelope({
    message: 'Backfill batch completed',
    remaining_before: remainingBefore,
    remaining_after: remainingAfter,
    ...batch
  });
});