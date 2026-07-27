import { getDB } from '../../utils/db';
import { bufferSession, checkAndFlush } from '../../utils/analytics';

export default defineEventHandler(async (event) => {
  // Track Session
  bufferSession();

  // Check flush conditions (async)
  const db = getDB(event);
  checkAndFlush(db, event.context.cloudflare?.context);

  return {
    last_updated: '2026-07-27T13:41:00+09:30',
    whatsnew_html: `<div class="whatsnewTextContainer" style="overflow-y: auto; font-size: 1.3rem; line-height: 1.6;"><p>Our privacy policy has been updated to cover optional in-extension feedback.</p><p><strong>What this means:</strong> Feedback is anonymous by default (a random install ID plus technical details like extension version and browser). Name, email, and school SEQTA hostname are stored <strong>only</strong> if you choose to include them. We never collect SEQTA cookies, session tokens, student IDs, marks, or lesson content through feedback.</p><p>To read the full policy, click the <strong>shield icon</strong> in the settings&nbsp;menu, or <a href="https://betterseqta.org/privacy" target="_blank" rel="noopener noreferrer" id="privacy-link" style="color: inherit; text-decoration: underline; cursor: pointer; white-space: nowrap;">click here</a>.</p><p style="font-weight: bold; margin-top: 15px;">We do not collect your school login credentials or academic records. Optional feedback details you submit are used only to triage and respond.</p></div>`,
  };
});
