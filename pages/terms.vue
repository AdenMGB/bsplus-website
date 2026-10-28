<template>
  <div class="relative isolate overflow-hidden py-12 sm:py-16 lg:py-24">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-2xl lg:mx-0 px-4 sm:px-0">
        <p class="text-sm font-semibold uppercase tracking-widest text-zinc-400">Legal</p>
        <h2 class="mt-2 text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight text-white font-display">Terms of Service</h2>
        <p class="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-zinc-300">
          Last updated: {{ TERMS_LAST_UPDATED_DISPLAY }}
        </p>
      </div>

      <div class="mx-auto mt-12 sm:mt-16 max-w-2xl px-4 sm:px-0 text-sm sm:text-base leading-7 text-zinc-300">
        <LegalDocumentBody :markdown="TERMS_MARKDOWN" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  TERMS_LAST_UPDATED_DISPLAY,
  TERMS_MARKDOWN,
} from '~/lib/legal/terms-document';

usePageSeo({
  title: 'Terms of Service',
  description:
    'Terms of Service for BetterSEQTA+ and DesQTA. Rules for using our browser extension and desktop application.',
});

const schemaHelpers = useSchemaOrgHelpers();
useSchemaOrg([
  schemaHelpers.webPage(
    'Terms of Service',
    'Terms of Service for BetterSEQTA+ and DesQTA. Rules for using our browser extension and desktop application.',
  ),
]);
</script>
