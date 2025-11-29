<template>
  <CreatePage />
</template>

<script setup lang="ts">
import CreatePage from '../create.vue';

definePageMeta({
  middleware: ["admin"],
  layout: false
});
</script>

