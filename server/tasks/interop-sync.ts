/**
 * Wrangler cron: every 30 minutes (wrangler.toml: asterisk-slash-30 * * * *)
 * - Check mail quota and drain survey_email_queue
 * - Optional accounts signup-order sync (logged only when configured)
 */
import { getDB } from '../utils/db';
import { drainSurveyEmailQueue } from '../utils/survey-email-queue';
import { fetchSignupOrderExport } from '../utils/survey-accounts';

export default defineTask({
  meta: {
    name: 'interop-sync',
    description: 'Quota-aware survey email queue drain and optional accounts sync',
  },
  async run({ context }) {
    const cloudflare = (context as any)?.cloudflare;
    const env = cloudflare?.env ?? (globalThis as any).__env__;

    if (env) {
      (globalThis as any).__env__ = env;
    }

    const db = getDB({ cloudflare: { env } });
    const results: Record<string, unknown> = {};

    // Optional lightweight accounts sync snapshot (for observability)
    try {
      const sync = await fetchSignupOrderExport(null as any, 5, 0);
      results.accounts_sync_sample = sync.users?.length ?? 0;
    } catch (error: any) {
      console.warn('[interop-sync] accounts sync skipped:', error?.message || error);
      results.accounts_sync_error = error?.message || 'accounts sync failed';
    }

    const drain = await drainSurveyEmailQueue(db, null);
    results.email_drain = drain.skipped
      ? { skipped: true, reason: drain.reason, quotaResetAt: drain.quotaResetAt, error: drain.error }
      : {
          batchSize: drain.batchSize,
          sent: drain.sent,
          failed: drain.failed,
          skipped: drain.skippedInvalid,
          failedDetails: drain.failedDetails,
        };

    console.log('[interop-sync] email drain:', results.email_drain);
    return { result: results };
  },
});
