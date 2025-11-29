import { getDB } from '../../utils/db';
import { bufferSession, checkAndFlush } from '../../utils/analytics';

export default defineEventHandler(async (event) => {
  // Track Session
  bufferSession();
  
  // Check flush conditions (async)
  const db = getDB(event);
  checkAndFlush(db, event.context.cloudflare?.context);

  return {
    last_updated: "2025-11-28T17:49:31+10:30",
    whatsnew_html: `<div class="whatsnewTextContainer" style="overflow-y: auto; font-size: 1.3rem; line-height: 1.6;"><p>It has come to our attention that several schools have expressed concerns about BetterSEQTA+. This is very disheartening, so we have decided to release a statement on the situation.</p><p>To view our privacy policy, please click the <strong>shield icon</strong> in the settings&nbsp;menu, or <a href="https://betterseqta.org/privacy" target="_blank" rel="noopener noreferrer" id="privacy-link" style="color: inherit; text-decoration: underline; cursor: pointer; white-space: nowrap;">click here</a>.</p><p style="font-weight: bold; margin-top: 15px;">We never collect any information from you, and aim to provide the best features possible.</p></div>`
  };
});
