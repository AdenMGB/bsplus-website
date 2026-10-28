/** Version id for extension `termsOfServiceLastAccepted` / re-prompt logic. */
export const PRIVACY_API_LAST_UPDATED = '2026-10-29T00:00:00.000Z';

/** Scrollable HTML for the BetterSEQTA+ Terms of Service startup popup. */
export const PRIVACY_API_WHATSNEW_HTML = `<div class="whatsnewTextContainer"><p><strong>Terms of Service</strong></p><p>By using BetterSEQTA+ or DesQTA (the &quot;Service&quot;), you agree to these terms. The Service is a third-party enhancement for SEQTA Learn and is <strong>not</strong> affiliated with, endorsed by, or connected to Education Horizons Group.</p><p><strong>Use at your own risk.</strong> The Service is provided &quot;as is&quot; without warranty. Grade averages and predictions shown in the app are estimates only—do not rely on them for official academic standing.</p><p><strong>Privacy:</strong> We do not collect your school login credentials or academic records on our servers. Optional in-extension feedback is anonymous by default; contact details and SEQTA hostname are stored only if you opt in.</p><p>Full terms: <a href="https://betterseqta.org/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a>. Privacy details: <a href="https://betterseqta.org/privacy" target="_blank" rel="noopener noreferrer">Privacy policy</a>.</p></div>`;

export function getPrivacyApiPayload() {
  return {
    last_updated: PRIVACY_API_LAST_UPDATED,
    whatsnew_html: PRIVACY_API_WHATSNEW_HTML,
  };
}
