<template>
  <div class="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 space-y-3">
    <div class="flex items-center justify-between gap-2">
      <label class="text-sm font-medium text-zinc-400">Generate with AI</label>
      <span v-if="!themeId" class="text-xs text-zinc-500">Link a theme below first</span>
    </div>
    <p class="text-xs text-zinc-500">
      Describe the tone you want. Groq uses the linked theme, theme.json, and screenshots to draft title and description.
    </p>
    <textarea
      v-model="prompt"
      rows="3"
      :disabled="generating"
      placeholder="e.g. Hype and energetic, highlight the dark blue palette and clean sidebar..."
      class="block w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
    />
    <div class="flex items-center gap-3">
      <button
        type="button"
        :disabled="!canGenerate"
        @click="generate"
        class="rounded-md bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {{ generating ? 'Generating...' : 'Generate title & description' }}
      </button>
      <p v-if="error" class="text-xs text-red-400 flex-1">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
  themeId: string;
  coverImage: string;
  title: string;
  description: string;
}>();

const emit = defineEmits<{
  (e: 'update:title', value: string): void;
  (e: 'update:description', value: string): void;
}>();

const prompt = ref('');
const generating = ref(false);
const error = ref('');

const canGenerate = computed(
  () => !!props.themeId && prompt.value.trim().length >= 10 && !generating.value
);

async function generate() {
  if (!canGenerate.value) return;

  generating.value = true;
  error.value = '';

  try {
    const result = await $fetch<{ title: string; description: string }>(
      '/api/admin/theme-of-the-month/generate-description',
      {
        method: 'POST',
        body: {
          prompt: prompt.value.trim(),
          theme_id: props.themeId,
          cover_image: props.coverImage || undefined,
          current_title: props.title || undefined,
          current_description: props.description || undefined
        }
      }
    );
    emit('update:title', result.title);
    emit('update:description', result.description);
  } catch (e: any) {
    error.value = e.data?.message || e.message || 'Generation failed';
  } finally {
    generating.value = false;
  }
}
</script>
