import { requireAdmin } from '../../utils/auth';
import {
  getIntegrationDevContext,
  getSiteIntegrationSettings,
} from '../../utils/site-integrations';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const settings = await getSiteIntegrationSettings(event);
  const dev = await getIntegrationDevContext(event);

  return {
    ok: true,
    hasAccountsApiKey: settings.hasAccountsApiKey,
    hasMailApiKey: settings.hasMailApiKey,
    hasMailFromAddress: settings.hasMailFromAddress,
    mailFromAddress: settings.hasMailFromAddress ? settings.mailFromAddress : '',
    ...dev,
  };
});
