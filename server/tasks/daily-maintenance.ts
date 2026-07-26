/**
 * Wrangler cron: 0 2 * * * (daily 02:00 UTC)
 * - Questionnaire cleanup + theme stats (existing endpoint)
 * - Admin digest email for new extension feedback
 */
import { getDB } from '../utils/db';
import { sendAdminFeedbackDigest } from '../utils/feedback-mail';

export default defineTask({
  meta: {
    name: 'daily-maintenance',
    description:
      'Daily cleanup, theme stats recalculation, and admin feedback digest emails',
  },
  async run({ context }) {
    const cloudflare = (context as any)?.cloudflare;
    const env = cloudflare?.env ?? (globalThis as any).__env__;

    // Ensure getDB / mail helpers can resolve Worker bindings.
    if (env) {
      (globalThis as any).__env__ = env;
    }

    const results: Record<string, unknown> = {};

    // Existing daily jobs (auth via cf-cron header)
    try {
      const siteUrl =
        env?.NUXT_PUBLIC_SITE_URL ||
        process.env.NUXT_PUBLIC_SITE_URL ||
        'https://betterseqta.org';

      const cleanup = await $fetch(`${String(siteUrl).replace(/\/$/, '')}/api/questionnaire/cleanup-images`, {
        method: 'POST',
        headers: { 'cf-cron': 'true' },
      });
      results.cleanup = cleanup;
    } catch (e: any) {
      console.error('[daily-maintenance] cleanup failed:', e?.message || e);
      results.cleanup_error = e?.message || 'cleanup failed';
    }

    // Feedback digest to all admins
    try {
      const db = getDB({ cloudflare: { env } });
      const digest = await sendAdminFeedbackDigest(db, null);
      results.feedback_digest = digest;
      console.log('[daily-maintenance] feedback digest:', digest);
    } catch (e: any) {
      console.error('[daily-maintenance] feedback digest failed:', e?.message || e);
      results.feedback_digest_error = e?.message || 'digest failed';
    }

    return { result: results };
  },
});
