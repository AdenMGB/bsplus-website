export default defineEventHandler((event) => {
  return {
    last_updated: "2025-11-29T17:49:31+10:30",
    whatsnew_html: `<div class="whatsnewTextContainer" style="overflow-y: auto; font-size: 1.3rem; line-height: 1.6;">
    <h1 id="heading1" style="margin-bottom: 10px;">Privacy Statement Update</h1>
    <h2 class="subheader">Summary</h2>
    <p>This is a <strong>test message</strong> to verify that all allowed HTML elements render correctly.</p>

    <p>Here is some <em>emphasized</em> text, some <b>bold</b> text, and some <i>italic</i> text inside a <span style="color: black;">span element</span>.</p>

    <h3>Allowed Link Example</h3>
    <p>
      This link should remain clickable:
      <a href="https://betterseqta.org/privacy" target="_blank" rel="noopener noreferrer" id="allowed-link" style="color: inherit; text-decoration: underline;">Official Privacy Policy</a>
    </p>

    <h3>Blocked Link Examples</h3>
    <ul id="blocked-links-list" class="list">
      <li>
        <a href="https://evil.com/malware" target="_blank" rel="noopener noreferrer" style="text-decoration: underline;">Malicious External Link</a>
      </li>
      <li>
        <a href="javascript:alert('hacked')" style="text-decoration: underline;">JavaScript URL</a>
      </li>
      <li>
        <a href="http://phishing-site.net/login" target="_blank">Phishing Link</a>
      </li>
    </ul>

    <p style="margin-top: 15px; font-weight: bold;">End of test content.</p>
  </div>`
  };
});
