/** Version id for extension `termsOfServiceLastAccepted` / re-prompt logic. */
export const PRIVACY_API_LAST_UPDATED = '2026-10-29T23:00:00.000Z';

/** Scrollable HTML for the BetterSEQTA+ Terms of Service startup popup. */
export const PRIVACY_API_WHATSNEW_HTML = `<div class="whatsnewTextContainer"><p><strong>Updated privacy &amp; terms</strong></p><p>Our privacy policy now describes what stays on your device, what optional BetterSEQTA Cloud sync uploads, and opt-in features such as feedback and timetable classmates.</p><p><strong>Key points:</strong> Most SEQTA traffic stays between you and your school. Grade Analytics, Global Search indexes, and calendar OAuth tokens are <strong>not</strong> uploaded to cloud backup. We do not use third-party analytics SDKs in the extension.</p><p>Full terms: <a href="https://betterseqta.org/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a>. Full privacy policy: <a href="https://betterseqta.org/privacy" target="_blank" rel="noopener noreferrer">Privacy policy</a>.</p></div>`;

export function getPrivacyApiPayload() {
  return {
    last_updated: PRIVACY_API_LAST_UPDATED,
    whatsnew_html: PRIVACY_API_WHATSNEW_HTML,
  };
}
