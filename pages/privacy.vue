<template>
  <div class="relative isolate overflow-hidden py-12 sm:py-16 lg:py-24">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <RevealOnScroll animate-on-mount>
        <div class="mx-auto max-w-2xl lg:mx-0 px-4 sm:px-0">
          <p class="text-sm font-semibold uppercase tracking-widest text-zinc-400">Legal</p>
          <h2 class="mt-2 text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight text-white font-display">Privacy Policy</h2>
          <p class="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-zinc-300">
            Last updated: {{ PRIVACY_LAST_UPDATED_DISPLAY }}
          </p>
        </div>
      </RevealOnScroll>

      <RevealOnScroll animate-on-mount :delay="100">
        <div class="mx-auto mt-12 sm:mt-16 max-w-2xl px-4 sm:px-0 text-sm sm:text-base leading-7 text-zinc-300">
          <LegalDocumentBody :markdown="PRIVACY_MARKDOWN" />
        </div>
      </RevealOnScroll>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  PRIVACY_LAST_UPDATED_DISPLAY,
  PRIVACY_MARKDOWN,
} from '~/lib/legal/privacy-document';

usePageSeo({
  title: 'Privacy Policy',
  description:
    'Privacy Policy for BetterSEQTA+ and DesQTA. How local storage, optional cloud sync, feedback, and third-party integrations handle your data.',
});

const schemaHelpers = useSchemaOrgHelpers();
useSchemaOrg([
  schemaHelpers.webPage(
    'Privacy Policy',
    'Privacy Policy for BetterSEQTA+ and DesQTA. How local storage, optional cloud sync, feedback, and third-party integrations handle your data.',
  ),
]);
</script>
