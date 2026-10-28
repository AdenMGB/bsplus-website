<template>
  <div class="relative isolate overflow-hidden py-12 sm:py-16 lg:py-24">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <RevealOnScroll>
        <div class="mx-auto max-w-2xl lg:mx-0 px-4 sm:px-0">
          <p class="text-sm font-semibold uppercase tracking-widest text-zinc-400">Legal</p>
          <h2 class="mt-2 text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight text-white font-display">Terms of Service</h2>
          <p class="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-zinc-300">
            Last updated: October 29, 2026
          </p>
        </div>
      </RevealOnScroll>

      <RevealOnScroll :delay="100">
        <div class="mx-auto mt-12 sm:mt-16 max-w-2xl px-4 sm:px-0 text-sm sm:text-base leading-7 text-zinc-300">
          <h3 class="mt-6 sm:mt-8 text-xl sm:text-2xl font-bold tracking-tight text-white">1. Agreement</h3>
          <p class="mt-4 sm:mt-6">
            These Terms of Service ("Terms") govern your use of the BetterSEQTA+ browser extension, the DesQTA desktop application, and related services we provide (collectively, the "Service"). By installing or using the Service, you agree to these Terms. If you do not agree, do not use the Service.
          </p>

          <h3 class="mt-8 text-2xl font-bold tracking-tight text-white">2. Not Affiliated with SEQTA</h3>
          <p class="mt-4 sm:mt-6">
            BetterSEQTA+ is an independent, third-party tool designed to enhance the user experience of SEQTA Learn. We are <strong>not</strong> affiliated with, endorsed by, sponsored by, or connected to Education Horizons Group or your school. Your use of SEQTA itself remains subject to your school's policies and SEQTA's terms.
          </p>

          <h3 class="mt-8 text-2xl font-bold tracking-tight text-white">3. Eligibility and Acceptable Use</h3>
          <p class="mt-4 sm:mt-6">
            You may use the Service only where permitted by your school and applicable law. You agree not to use the Service to violate school rules, circumvent security controls, harass others, or interfere with SEQTA or other systems. You are responsible for how you use the Service on your devices and accounts.
          </p>

          <h3 class="mt-8 text-2xl font-bold tracking-tight text-white">4. No Official Academic Advice</h3>
          <p class="mt-4 sm:mt-6">
            Features such as course averages, grade predictions, and similar calculations are <strong>estimates</strong> based on data available in your client. They may not match official grades, weighting rules, or teacher adjustments. <strong>Do not rely on the Service for official academic standing.</strong> Always refer to reports and grades published by your school.
          </p>

          <h3 class="mt-8 text-2xl font-bold tracking-tight text-white">5. Open Source and Transparency</h3>
          <p class="mt-4 sm:mt-6">
            BetterSEQTA+ and DesQTA are open-source projects. Source code is available on
            <a href="https://github.com/BetterSEQTA/" class="text-green-400 hover:text-green-300 underline" target="_blank" rel="noopener noreferrer">GitHub</a>
            for review. Open-source availability does not expand our warranties beyond what is stated in these Terms.
          </p>

          <h3 class="mt-8 text-2xl font-bold tracking-tight text-white">6. Privacy</h3>
          <p class="mt-4 sm:mt-6">
            Our handling of data is described in our
            <NuxtLink to="/privacy" class="text-green-400 hover:text-green-300 underline">Privacy Policy</NuxtLink>.
            By using the Service, you acknowledge that policy. We do not sell personal information.
          </p>

          <h3 class="mt-8 text-2xl font-bold tracking-tight text-white">7. Disclaimers</h3>
          <p class="mt-4 sm:mt-6">
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR COMPATIBLE WITH EVERY SEQTA CONFIGURATION OR BROWSER VERSION.
          </p>

          <h3 class="mt-8 text-2xl font-bold tracking-tight text-white">8. Limitation of Liability</h3>
          <p class="mt-4 sm:mt-6">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, BETTERSEQTA+ CONTRIBUTORS AND OPERATORS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF DATA, GRADES, PROFITS, OR GOODWILL, ARISING FROM YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY FOR ANY CLAIM RELATING TO THE SERVICE WILL NOT EXCEED THE AMOUNT YOU PAID US FOR THE SERVICE IN THE TWELVE MONTHS BEFORE THE CLAIM (OR AUD $0 IF THE SERVICE IS PROVIDED FREE OF CHARGE).
          </p>
          <p class="mt-3 sm:mt-4">
            Some jurisdictions do not allow certain limitations; in those cases, our liability is limited to the fullest extent permitted by law.
          </p>

          <h3 class="mt-8 text-2xl font-bold tracking-tight text-white">9. Changes</h3>
          <p class="mt-4 sm:mt-6">
            We may update these Terms from time to time. Material changes will be reflected on this page and may require you to accept updated terms in the extension. Continued use after changes become effective constitutes acceptance where permitted by law.
          </p>

          <h3 class="mt-8 text-2xl font-bold tracking-tight text-white">10. Contact</h3>
          <p class="mt-4 sm:mt-6">
            Questions about these Terms? Reach us on our
            <a href="https://discord.gg/nv6YSjpEM4" class="text-green-400 hover:text-green-300 underline" target="_blank" rel="noopener noreferrer">Discord server</a>.
          </p>
        </div>
      </RevealOnScroll>
    </div>
  </div>
</template>

<script setup lang="ts">
usePageSeo({
  title: "Terms of Service",
  description: "Terms of Service for BetterSEQTA+ and DesQTA. Rules for using our browser extension and desktop application.",
});

const schemaHelpers = useSchemaOrgHelpers();
useSchemaOrg([
  schemaHelpers.webPage(
    'Terms of Service',
    'Terms of Service for BetterSEQTA+ and DesQTA. Rules for using our browser extension and desktop application.',
  ),
]);
</script>
