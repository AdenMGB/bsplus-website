<template>
  <div class="legal-document-body" v-html="html" />
</template>

<script setup lang="ts">
import { renderLegalMarkdown } from '~/lib/legal/render-legal-html';

const props = defineProps<{
  markdown: string;
}>();

const html = computed(() => renderLegalMarkdown(props.markdown));
</script>
