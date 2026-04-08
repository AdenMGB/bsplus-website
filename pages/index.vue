<template>
  <div class="relative">
    <HomeHero :bs-version="BSPlusVersion" :desqta-version="desqtaVersion" />
    <HomeScrollStory />
    <HomeBento />
    <HomeMarqueeStrip />
    <HomeClosingCta />
  </div>
</template>

<script setup lang="ts">
const schemaHelpers = useSchemaOrgHelpers();
useSchemaOrg([
  schemaHelpers.webSite(
    "BetterSEQTA Plus",
    "BetterSEQTA+ and DesQTA enhance SEQTA Learn with themes, live wallpapers, and a full desktop experience."
  ),
]);

usePageSeo({
  title: "Home",
  description:
    "BetterSEQTA+ and DesQTA enhance SEQTA Learn with beautiful themes, live wallpapers, and a full desktop experience. Download the browser extension or desktop app for Windows, Mac, Linux, and Android.",
  ogImageComponent: "PageOG",
  ogImageProps: {
    title: "BetterSEQTA+ & DesQTA",
    description: "SEQTA Learn Enhanced — themes, wallpapers, desktop app",
    headline: "SEQTA Learn Enhanced",
  },
});

const { BSPlusVersion, desqtaVersion, fetchReleases } = useGithubReleases();

onMounted(() => {
  fetchReleases();
});
</script>
