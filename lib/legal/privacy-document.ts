export const PRIVACY_LAST_UPDATED = '2026-10-29T23:00:00.000Z';
export const PRIVACY_LAST_UPDATED_DISPLAY = 'October 29, 2026';

export const PRIVACY_MARKDOWN = `
### 1. Introduction

BetterSEQTA+ ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we handle your data when you use our browser extension and desktop application (collectively, the "Service").

BetterSEQTA+ is a third-party tool designed to enhance the user experience of SEQTA Learn and SEQTA Engage. We are not affiliated with, endorsed by, or connected to Education Horizons Group (the creators of SEQTA).

We operate two main online services you may interact with: **betterseqta.org** (theme catalog, feedback, policy pages, and related APIs) and **accounts.betterseqta.org** (optional BetterSEQTA Cloud sign-in, settings backup, and related account features). Your school's SEQTA site is separate and remains under your school's control.

### 2. Data Collection and Usage

**By default, we do not receive your SEQTA timetable, messages, marks, or lesson content on our servers.** Most features talk directly to your school's SEQTA site using your existing browser session. That traffic stays between your device and your school unless you turn on an optional feature described below that sends specific data to us.

BetterSEQTA+ and DesQTA operate primarily as client-side tools. The sections below explain what stays on your device, what may be sent to BetterSEQTA, and what may go to other third parties when you enable those features.

#### Login Credentials

We never capture, store, or transmit your school SEQTA username or password to our servers.

- **BetterSEQTA+ Extension:** Uses your browser's existing active session with SEQTA. It does not see or handle your login credentials directly.
- **DesQTA App:** Sends your credentials directly from your device to your school's SEQTA server to authenticate. It does not send this information to us or any third party.

#### Data Stored on Your Device

Unless you enable a feature that uploads data, settings and caches are kept in browser extension storage, IndexedDB, or similar local storage on your device. Examples include theme choices, layout preferences, plugin settings, dismissed popups, and locally downloaded themes.

The following types of data are processed **locally only** and are **not** uploaded to BetterSEQTA Cloud settings backup:

- **Grade Analytics** and related marks or chart caches.
- **Assessments Average** plugin caches.
- **Global Search** indexes built from SEQTA pages (stored in IndexedDB; sensitive fields are filtered when indexing).
- **Google Calendar** and **Outlook Calendar** sync tokens and mappings, if you connect those integrations.
- **BetterSEQTA Cloud login tokens** on the extension (preserved locally when restoring other settings).
- **Feedback install ID** — a random identifier used only to correlate anonymous feedback and replies; it is not included in cloud settings sync.

Other features may keep additional local data (for example timetable display overrides, message folders, notification counts, or timetable-classmates caches scoped to your school and student id). That data remains on your device unless a separate opt-in feature below sends limited identifiers to our accounts service.

#### Optional BetterSEQTA Cloud (Extension)

The extension can optionally connect to **accounts.betterseqta.org**. This is separate from your school SEQTA account.

- **Sign-in:** If you create or use a cloud account, we process account details such as email and profile information as part of login. The extension may send a simple device label (for example, "Chrome on Windows") — not hardware serial numbers — during authentication.
- **Settings backup:** When signed in, the extension can sync a JSON map of your preferences and plugin settings to our servers so you can restore them on another device. Auto-sync is on by default while signed in; you can turn it off. Sync may include school-related *preferences* (such as UI filters), but the client deliberately omits the sensitive local data listed above.
- **Profile picture sync:** If you use the optional profile picture plugin and choose to upload, an image file you select may be sent to our accounts service.
- **Community themes:** If you upload custom themes while signed in, theme files and metadata are stored and associated with your cloud account.
- **Theme favorites:** Favoriting a store theme while signed in uses authenticated requests to betterseqta.org.

#### Timetable Classmates (Opt-In Only)

This social timetable feature requires BetterSEQTA Cloud sign-in and **separate explicit consent**. If you opt in, our accounts service receives identifiers needed to match you with classmates at your school (such as your school's SEQTA hostname, student id, and binding proofs defined in the feature). Class enrollment data for sharing is encrypted in your browser before it transits our relay; we design this so your full timetable is not stored on our servers as plaintext. You can opt out at any time to revoke participation.

#### Data Storage & Cloud Sync (DesQTA Only)

- **Local Storage:** By default, all custom settings, themes, and preferences are stored locally on your device.
- **Optional Cloud Sync:** DesQTA offers a completely **optional** cloud sync feature to synchronize your *application settings* (e.g., themes, custom background preferences) across devices. This uses a custom, in-house authentication system separate from your school SEQTA account. Only your DesQTA configuration is synced. **No school data, academic records, or SEQTA login credentials are ever uploaded or stored in this cloud service.**

#### Routine Requests to betterseqta.org

Without a cloud account, the extension may still contact betterseqta.org for read-only or user-initiated features, such as fetching legal text, browsing or downloading themes, theme-of-the-month promotions, and checking for updates. These requests do not include your SEQTA login or academic records.

### 3. Transparency & Open Source

To address concerns regarding data privacy and the inability to "verify" our data handling: **BetterSEQTA+ and DesQTA are fully open-source projects.**

This means our entire codebase is publicly available on [GitHub](https://github.com/BetterSEQTA/). Anyone, including school IT departments and security researchers, can inspect the code to verify that:

- No mechanism exists to capture or export your login credentials.
- No "spyware" or data harvesting code is present.
- The application behaves exactly as described in this policy.

### 4. Accuracy of Academic Information

The "Course Average", Grade Analytics, and predicted grades displayed by BetterSEQTA+ and DesQTA are **estimates** based on the raw data available in your client.

Please note:

- These calculations are intended as a personal guideline only.
- They may not reflect complex weighting rules, non-linear grading scales, or manual adjustments used by your specific school.
- **You should never rely on these figures for official academic standing.** Always refer to your official school reports and the grades published directly by your teachers for accurate results.

### 5. Analytics

We do not embed third-party analytics, advertising networks, or session-replay SDKs in the BetterSEQTA+ extension. We do not run an in-extension telemetry pipeline to BetterSEQTA or vendors for product analytics. The only extension-related statistics we routinely see outside your device are anonymous, aggregated installation metrics from the Chrome Web Store (and similar store metrics where applicable).

**DesQTA Anonymous Usage Statistics:** DesQTA collects completely anonymous statistics about how many times the application is used. Each time DesQTA is opened, it sends a single, anonymous session count to our servers. This data is completely anonymous and contains no personal information, user identifiers, or any data that could be used to identify individual users. We use this aggregated data solely to understand overall usage patterns and improve the application.

Like most websites and APIs, our servers and CDNs may automatically log technical metadata (such as IP address, User-Agent, and timestamps) when you visit betterseqta.org or accounts.betterseqta.org. We use those logs for security and operations, not to profile individual SEQTA usage.

### 6. Extension Feedback

BetterSEQTA+ may offer an optional in-extension feedback form so you can report bugs, request features, or send comments. Submissions are sent to our servers at betterseqta.org when you choose to send them.

- **Anonymous by default:** Feedback is correlated with a random install identifier stored locally in your browser, plus technical metadata such as extension version, browser, operating system, release channel, language, and dark mode setting.
- **Optional contact details:** Name and email are stored only if you explicitly choose to include them.
- **Optional school instance details:** Your SEQTA hostname (for example, \`learn.exampleschool.edu.au\`) and whether you use Learn or Engage is stored only if you explicitly opt in. We do not collect cookies, session tokens, student IDs, marks, or lesson content through this form.
- **Replies:** The extension may poll for responses tied to your install identifier so we can notify you when we reply.
- We use this information solely to triage and respond to feedback. Contact details are treated as personal data and are not sold or used for marketing.

### 7. Third-Party Services

Besides BetterSEQTA and your school, you may connect the Service to other providers:

- **Your school's SEQTA site:** The extension uses your existing session to load timetable, assessments, messages, and similar data from your school. That content is not sent to us by default.
- **Google Calendar (optional):** If enabled, OAuth tokens stay on your device. Timetable-related event titles and descriptions you choose to sync are sent to Google, not to BetterSEQTA.
- **Microsoft Outlook (optional):** Same pattern via Microsoft Graph — calendar data goes to Microsoft when you connect sync.
- **Google Fonts:** UI fonts may load from Google's servers; Google may process your IP address when fonts are fetched.
- **News widget (optional):** Preset news may call NewsAPI or RSS feeds you select; those providers may see your IP address when the extension fetches articles.
- **Wikimedia Commons:** Optional stock image search in theme tooling queries Wikimedia's API.
- **GitHub:** Update checks and some theme assets may fetch public release metadata or files from GitHub, which logs requests in the usual way.

Our website and Service may also contain links to external sites (such as GitHub or Discord) that are not operated by us. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.

### 8. What We Do Not Do

To summarize our design intent for the BetterSEQTA+ extension:

- We do not sell personal information.
- We do not upload Grade Analytics assessment data to BetterSEQTA servers or cloud settings backup.
- We do not upload Global Search index contents to cloud backup.
- We do not include Google or Outlook OAuth tokens in cloud settings backup.
- We do not include your feedback install identifier in cloud settings backup.
- We do not collect your SEQTA hostname through feedback unless you opt in.

### 9. Your Choices

You can limit what leaves your device in several ways:

- Uninstall or disable the extension to remove local extension data (exact cleanup depends on your browser).
- Sign out of BetterSEQTA Cloud to stop authenticated requests and clear local cloud tokens.
- Turn off automatic cloud settings sync while signed in.
- Opt out of timetable classmates or disconnect calendar sync in settings.
- Disable plugins you do not want to use.
- Submit feedback without contact details or school hostname.
- Accept or defer the in-extension terms popup (acceptance stores the policy version locally).

### 10. Schools and SEQTA Data

When you use SEQTA through the Service, your school and Education Horizons remain responsible for the personal data held in SEQTA itself. BetterSEQTA+ is a convenience layer on top of that experience. We encourage students and schools to follow applicable school policies and to use optional cloud and social features only when appropriate for your context.

### 11. Data Security

BetterSEQTA+ does not store your school login credentials or academic records on our servers. Aside from optional account, sync, feedback, and opt-in social features described above, the security of your school data is primarily dependent on:

- The security of your own device and browser.
- The security measures implemented by your school's SEQTA installation.
- How you configure optional integrations (cloud backup, calendars, classmates, and feedback options).

### 12. Changes to This Policy

We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. Material updates may also be reflected in the extension so you can review and accept again. You are advised to review this Privacy Policy periodically for any changes.

### 13. Terms of Service

Use of BetterSEQTA+ and DesQTA is also governed by our [Terms of Service](https://betterseqta.org/terms).

### 14. Contact Us

If you have any questions about this Privacy Policy, please contact us via our [Discord server](https://discord.gg/nv6YSjpEM4).
`.trim();
