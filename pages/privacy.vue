<template>
  <div class="relative isolate overflow-hidden py-12 sm:py-16 lg:py-24">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <RevealOnScroll>
        <div class="mx-auto max-w-2xl lg:mx-0 px-4 sm:px-0">
          <p class="text-sm font-semibold uppercase tracking-widest text-zinc-400">Legal</p>
          <h2 class="mt-2 text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight text-white font-display">Privacy Policy</h2>
          <p class="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-zinc-300">
            Last updated: October 29, 2026
          </p>
        </div>
      </RevealOnScroll>

      <RevealOnScroll :delay="100">
        <div class="mx-auto mt-12 sm:mt-16 max-w-2xl px-4 sm:px-0 text-sm sm:text-base leading-7 text-zinc-300">
        <h3 class="mt-6 sm:mt-8 text-xl sm:text-2xl font-bold tracking-tight text-white">1. Introduction</h3>
        <p class="mt-4 sm:mt-6">
          BetterSEQTA+ ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we handle your data when you use our browser extension and desktop application (collectively, the "Service").
        </p>
        <p class="mt-3 sm:mt-4">
          BetterSEQTA+ is a third-party tool designed to enhance the user experience of SEQTA Learn and SEQTA Engage. We are not affiliated with, endorsed by, or connected to Education Horizons Group (the creators of SEQTA).
        </p>
        <p class="mt-3 sm:mt-4">
          We operate two main online services you may interact with: <strong>betterseqta.org</strong> (theme catalog, feedback, policy pages, and related APIs) and <strong>accounts.betterseqta.org</strong> (optional BetterSEQTA Cloud sign-in, settings backup, and related account features). Your school's SEQTA site is separate and remains under your school's control.
        </p>

        <h3 class="mt-8 text-2xl font-bold tracking-tight text-white">2. Data Collection and Usage</h3>
        <p class="mt-4 sm:mt-6">
          <strong>By default, we do not receive your SEQTA timetable, messages, marks, or lesson content on our servers.</strong> Most features talk directly to your school's SEQTA site using your existing browser session. That traffic stays between your device and your school unless you turn on an optional feature described below that sends specific data to us.
        </p>
        <p class="mt-3 sm:mt-4">
          BetterSEQTA+ and DesQTA operate primarily as client-side tools. The sections below explain what stays on your device, what may be sent to BetterSEQTA, and what may go to other third parties when you enable those features.
        </p>

        <h4 class="mt-4 sm:mt-6 text-lg sm:text-xl font-semibold text-white">Login Credentials</h4>
        <p class="mt-2">
          We never capture, store, or transmit your school SEQTA username or password to our servers.
        </p>
        <ul role="list" class="mt-2 space-y-2 list-disc list-inside pl-4">
          <li><strong>BetterSEQTA+ Extension:</strong> Uses your browser's existing active session with SEQTA. It does not see or handle your login credentials directly.</li>
          <li><strong>DesQTA App:</strong> Sends your credentials directly from your device to your school's SEQTA server to authenticate. It does not send this information to us or any third party.</li>
        </ul>

        <h4 class="mt-6 text-xl font-semibold text-white">Data Stored on Your Device</h4>
        <p class="mt-2">
          Unless you enable a feature that uploads data, settings and caches are kept in browser extension storage, IndexedDB, or similar local storage on your device. Examples include theme choices, layout preferences, plugin settings, dismissed popups, and locally downloaded themes.
        </p>
        <p class="mt-3 sm:mt-4">
          The following types of data are processed <strong>locally only</strong> and are <strong>not</strong> uploaded to BetterSEQTA Cloud settings backup:
        </p>
        <ul role="list" class="mt-2 space-y-2 list-disc list-inside pl-4">
          <li><strong>Grade Analytics</strong> and related marks or chart caches.</li>
          <li><strong>Assessments Average</strong> plugin caches.</li>
          <li><strong>Global Search</strong> indexes built from SEQTA pages (stored in IndexedDB; sensitive fields are filtered when indexing).</li>
          <li><strong>Google Calendar</strong> and <strong>Outlook Calendar</strong> sync tokens and mappings, if you connect those integrations.</li>
          <li><strong>BetterSEQTA Cloud login tokens</strong> on the extension (preserved locally when restoring other settings).</li>
          <li><strong>Feedback install ID</strong> — a random identifier used only to correlate anonymous feedback and replies; it is not included in cloud settings sync.</li>
        </ul>
        <p class="mt-3 sm:mt-4">
          Other features may keep additional local data (for example timetable display overrides, message folders, notification counts, or timetable-classmates caches scoped to your school and student id). That data remains on your device unless a separate opt-in feature below sends limited identifiers to our accounts service.
        </p>

        <h4 class="mt-6 text-xl font-semibold text-white">Optional BetterSEQTA Cloud (Extension)</h4>
        <p class="mt-2">
          The extension can optionally connect to <strong>accounts.betterseqta.org</strong>. This is separate from your school SEQTA account.
        </p>
        <ul role="list" class="mt-2 space-y-2 list-disc list-inside pl-4">
          <li><strong>Sign-in:</strong> If you create or use a cloud account, we process account details such as email and profile information as part of login. The extension may send a simple device label (for example, "Chrome on Windows") — not hardware serial numbers — during authentication.</li>
          <li><strong>Settings backup:</strong> When signed in, the extension can sync a JSON map of your preferences and plugin settings to our servers so you can restore them on another device. Auto-sync is on by default while signed in; you can turn it off. Sync may include school-related <em>preferences</em> (such as UI filters), but the client deliberately omits the sensitive local data listed above.</li>
          <li><strong>Profile picture sync:</strong> If you use the optional profile picture plugin and choose to upload, an image file you select may be sent to our accounts service.</li>
          <li><strong>Community themes:</strong> If you upload custom themes while signed in, theme files and metadata are stored and associated with your cloud account.</li>
          <li><strong>Theme favorites:</strong> Favoriting a store theme while signed in uses authenticated requests to betterseqta.org.</li>
        </ul>

        <h4 class="mt-6 text-xl font-semibold text-white">Timetable Classmates (Opt-In Only)</h4>
        <p class="mt-2">
          This social timetable feature requires BetterSEQTA Cloud sign-in and <strong>separate explicit consent</strong>. If you opt in, our accounts service receives identifiers needed to match you with classmates at your school (such as your school's SEQTA hostname, student id, and binding proofs defined in the feature). Class enrollment data for sharing is encrypted in your browser before it transits our relay; we design this so your full timetable is not stored on our servers as plaintext. You can opt out at any time to revoke participation.
        </p>

        <h4 class="mt-6 text-xl font-semibold text-white">Data Storage & Cloud Sync (DesQTA Only)</h4>
        <ul role="list" class="mt-2 space-y-2 list-disc list-inside pl-4">
          <li><strong>Local Storage:</strong> By default, all custom settings, themes, and preferences are stored locally on your device.</li>
          <li><strong>Optional Cloud Sync:</strong> DesQTA offers a completely <strong>optional</strong> cloud sync feature to synchronize your <em>application settings</em> (e.g., themes, custom background preferences) across devices.
            <ul class="ml-6 mt-1 list-[circle]">
              <li>This uses a custom, in-house authentication system separate from your school SEQTA account.</li>
              <li>Only your DesQTA configuration is synced. <strong>No school data, academic records, or SEQTA login credentials are ever uploaded or stored in this cloud service.</strong></li>
            </ul>
          </li>
        </ul>

        <h4 class="mt-6 text-xl font-semibold text-white">Routine Requests to betterseqta.org</h4>
        <p class="mt-2">
          Without a cloud account, the extension may still contact betterseqta.org for read-only or user-initiated features, such as fetching terms text, browsing or downloading themes, theme-of-the-month promotions, and checking for updates. These requests do not include your SEQTA login or academic records.
        </p>

        <h3 class="mt-8 text-2xl font-bold tracking-tight text-white">3. Transparency & Open Source</h3>
        <p class="mt-4 sm:mt-6">
          To address concerns regarding data privacy and the inability to "verify" our data handling: <strong>BetterSEQTA+ and DesQTA are fully open-source projects.</strong>
        </p>
        <p class="mt-3 sm:mt-4">
          This means our entire codebase is publicly available on <a href="https://github.com/BetterSEQTA/" class="text-green-400 hover:text-green-300 underline" target="_blank" rel="noopener noreferrer">GitHub</a>. Anyone, including school IT departments and security researchers, can inspect the code to verify that:
        </p>
        <ul role="list" class="mt-3 sm:mt-4 space-y-2 list-disc list-inside pl-4">
          <li>No mechanism exists to capture or export your login credentials.</li>
          <li>No "spyware" or data harvesting code is present.</li>
          <li>The application behaves exactly as described in this policy.</li>
        </ul>

        <h3 class="mt-8 text-2xl font-bold tracking-tight text-white">4. Accuracy of Academic Information</h3>
        <p class="mt-4 sm:mt-6">
          The "Course Average", Grade Analytics, and predicted grades displayed by BetterSEQTA+ and DesQTA are <strong>estimates</strong> based on the raw data available in your client.
        </p>
        <p class="mt-3 sm:mt-4">
          Please note:
        </p>
        <ul role="list" class="mt-3 sm:mt-4 space-y-2 list-disc list-inside pl-4">
          <li>These calculations are intended as a personal guideline only.</li>
          <li>They may not reflect complex weighting rules, non-linear grading scales, or manual adjustments used by your specific school.</li>
          <li><strong>You should never rely on these figures for official academic standing.</strong> Always refer to your official school reports and the grades published directly by your teachers for accurate results.</li>
        </ul>

        <h3 class="mt-8 text-2xl font-bold tracking-tight text-white">5. Analytics</h3>
        <p class="mt-4 sm:mt-6">
          We do not embed third-party analytics, advertising networks, or session-replay SDKs in the BetterSEQTA+ extension. We do not run an in-extension telemetry pipeline to BetterSEQTA or vendors for product analytics. The only extension-related statistics we routinely see outside your device are anonymous, aggregated installation metrics from the Chrome Web Store (and similar store metrics where applicable).
        </p>
        <p class="mt-3 sm:mt-4">
          <strong>DesQTA Anonymous Usage Statistics:</strong> DesQTA collects completely anonymous statistics about how many times the application is used. Each time DesQTA is opened, it sends a single, anonymous session count to our servers. This data is completely anonymous and contains no personal information, user identifiers, or any data that could be used to identify individual users. We use this aggregated data solely to understand overall usage patterns and improve the application.
        </p>
        <p class="mt-3 sm:mt-4">
          Like most websites and APIs, our servers and CDNs may automatically log technical metadata (such as IP address, User-Agent, and timestamps) when you visit betterseqta.org or accounts.betterseqta.org. We use those logs for security and operations, not to profile individual SEQTA usage.
        </p>

        <h3 class="mt-8 text-2xl font-bold tracking-tight text-white">6. Extension Feedback</h3>
        <p class="mt-4 sm:mt-6">
          BetterSEQTA+ may offer an optional in-extension feedback form so you can report bugs, request features, or send comments. Submissions are sent to our servers at betterseqta.org when you choose to send them.
        </p>
        <ul role="list" class="mt-3 sm:mt-4 space-y-2 list-disc list-inside pl-4">
          <li><strong>Anonymous by default:</strong> Feedback is correlated with a random install identifier stored locally in your browser, plus technical metadata such as extension version, browser, operating system, release channel, language, and dark mode setting.</li>
          <li><strong>Optional contact details:</strong> Name and email are stored only if you explicitly choose to include them.</li>
          <li><strong>Optional school instance details:</strong> Your SEQTA hostname (for example, <code class="text-zinc-200">learn.exampleschool.edu.au</code>) and whether you use Learn or Engage is stored only if you explicitly opt in. We do not collect cookies, session tokens, student IDs, marks, or lesson content through this form.</li>
          <li><strong>Replies:</strong> The extension may poll for responses tied to your install identifier so we can notify you when we reply.</li>
          <li>We use this information solely to triage and respond to feedback. Contact details are treated as personal data and are not sold or used for marketing.</li>
        </ul>

        <h3 class="mt-8 text-2xl font-bold tracking-tight text-white">7. Third-Party Services</h3>
        <p class="mt-4 sm:mt-6">
          Besides BetterSEQTA and your school, you may connect the Service to other providers:
        </p>
        <ul role="list" class="mt-3 sm:mt-4 space-y-2 list-disc list-inside pl-4">
          <li><strong>Your school's SEQTA site:</strong> The extension uses your existing session to load timetable, assessments, messages, and similar data from your school. That content is not sent to us by default.</li>
          <li><strong>Google Calendar (optional):</strong> If enabled, OAuth tokens stay on your device. Timetable-related event titles and descriptions you choose to sync are sent to Google, not to BetterSEQTA.</li>
          <li><strong>Microsoft Outlook (optional):</strong> Same pattern via Microsoft Graph — calendar data goes to Microsoft when you connect sync.</li>
          <li><strong>Google Fonts:</strong> UI fonts may load from Google's servers; Google may process your IP address when fonts are fetched.</li>
          <li><strong>News widget (optional):</strong> Preset news may call NewsAPI or RSS feeds you select; those providers may see your IP address when the extension fetches articles.</li>
          <li><strong>Wikimedia Commons:</strong> Optional stock image search in theme tooling queries Wikimedia's API.</li>
          <li><strong>GitHub:</strong> Update checks and some theme assets may fetch public release metadata or files from GitHub, which logs requests in the usual way.</li>
        </ul>
        <p class="mt-3 sm:mt-4">
          Our website and Service may also contain links to external sites (such as GitHub or Discord) that are not operated by us. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
        </p>

        <h3 class="mt-8 text-2xl font-bold tracking-tight text-white">8. What We Do Not Do</h3>
        <p class="mt-4 sm:mt-6">
          To summarize our design intent for the BetterSEQTA+ extension:
        </p>
        <ul role="list" class="mt-3 sm:mt-4 space-y-2 list-disc list-inside pl-4">
          <li>We do not sell personal information.</li>
          <li>We do not upload Grade Analytics assessment data to BetterSEQTA servers or cloud settings backup.</li>
          <li>We do not upload Global Search index contents to cloud backup.</li>
          <li>We do not include Google or Outlook OAuth tokens in cloud settings backup.</li>
          <li>We do not include your feedback install identifier in cloud settings backup.</li>
          <li>We do not collect your SEQTA hostname through feedback unless you opt in.</li>
        </ul>

        <h3 class="mt-8 text-2xl font-bold tracking-tight text-white">9. Your Choices</h3>
        <p class="mt-4 sm:mt-6">
          You can limit what leaves your device in several ways:
        </p>
        <ul role="list" class="mt-3 sm:mt-4 space-y-2 list-disc list-inside pl-4">
          <li>Uninstall or disable the extension to remove local extension data (exact cleanup depends on your browser).</li>
          <li>Sign out of BetterSEQTA Cloud to stop authenticated requests and clear local cloud tokens.</li>
          <li>Turn off automatic cloud settings sync while signed in.</li>
          <li>Opt out of timetable classmates or disconnect calendar sync in settings.</li>
          <li>Disable plugins you do not want to use.</li>
          <li>Submit feedback without contact details or school hostname.</li>
          <li>Accept or defer the in-extension terms popup (acceptance stores the policy version locally).</li>
        </ul>

        <h3 class="mt-8 text-2xl font-bold tracking-tight text-white">10. Schools and SEQTA Data</h3>
        <p class="mt-4 sm:mt-6">
          When you use SEQTA through the Service, your school and Education Horizons remain responsible for the personal data held in SEQTA itself. BetterSEQTA+ is a convenience layer on top of that experience. We encourage students and schools to follow applicable school policies and to use optional cloud and social features only when appropriate for your context.
        </p>

        <h3 class="mt-8 text-2xl font-bold tracking-tight text-white">11. Data Security</h3>
        <p class="mt-4 sm:mt-6">
          BetterSEQTA+ does not store your school login credentials or academic records on our servers. Aside from optional account, sync, feedback, and opt-in social features described above, the security of your school data is primarily dependent on:
        </p>
        <ul role="list" class="mt-3 sm:mt-4 space-y-2 list-disc list-inside pl-4">
          <li>The security of your own device and browser.</li>
          <li>The security measures implemented by your school's SEQTA installation.</li>
          <li>How you configure optional integrations (cloud backup, calendars, classmates, and feedback options).</li>
        </ul>

        <h3 class="mt-8 text-2xl font-bold tracking-tight text-white">12. Changes to This Policy</h3>
        <p class="mt-4 sm:mt-6">
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. Material updates may also be reflected in the extension terms popup so you can review and accept again. You are advised to review this Privacy Policy periodically for any changes.
        </p>

        <h3 class="mt-8 text-2xl font-bold tracking-tight text-white">13. Terms of Service</h3>
        <p class="mt-4 sm:mt-6">
          Use of BetterSEQTA+ and DesQTA is also governed by our
          <NuxtLink to="/terms" class="text-green-400 hover:text-green-300 underline">Terms of Service</NuxtLink>.
        </p>

        <h3 class="mt-8 text-2xl font-bold tracking-tight text-white">14. Contact Us</h3>
        <p class="mt-4 sm:mt-6">
          If you have any questions about this Privacy Policy, please contact us via our
          <a href="https://discord.gg/nv6YSjpEM4" class="text-green-400 hover:text-green-300 underline" target="_blank" rel="noopener noreferrer">Discord server</a>.
        </p>
      </div>
      </RevealOnScroll>
    </div>
  </div>
</template>

<script setup lang="ts">
usePageSeo({
  title: "Privacy Policy",
  description: "Privacy Policy for BetterSEQTA+ and DesQTA. How local storage, optional cloud sync, feedback, and third-party integrations handle your data.",
});

const schemaHelpers = useSchemaOrgHelpers();
useSchemaOrg([
  schemaHelpers.webPage(
    'Privacy Policy',
    'Privacy Policy for BetterSEQTA+ and DesQTA. How local storage, optional cloud sync, feedback, and third-party integrations handle your data.',
  ),
]);
</script>
