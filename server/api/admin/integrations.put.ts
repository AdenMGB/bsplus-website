import { requireAdmin } from '../../utils/auth';
import { saveSiteIntegrationSettings } from '../../utils/site-integrations';

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event);
  const body = await readBody<{
    accountsApiKey?: string;
    mailApiKey?: string;
    mailFromAddress?: string;
  }>(event);

  await saveSiteIntegrationSettings(
    event,
    {
      accountsApiKey: body.accountsApiKey,
      mailApiKey: body.mailApiKey,
      mailFromAddress: body.mailFromAddress,
    },
    String(admin.id || admin.username || 'admin'),
  );

  return { ok: true };
});
