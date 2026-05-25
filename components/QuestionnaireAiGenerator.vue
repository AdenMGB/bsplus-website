<template>
  <div class="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
    <button
      type="button"
      @click="expanded = !expanded"
      class="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-zinc-800/30 transition-colors"
    >
      <div class="flex items-center gap-3">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
          </svg>
        </div>
        <div>
          <h3 class="text-sm font-semibold text-white">Generate with AI</h3>
          <p class="text-xs text-zinc-500 mt-0.5">Uses Workers AI with previous questions as context</p>
        </div>
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        class="w-5 h-5 text-zinc-400 transition-transform duration-200"
        :class="{ 'rotate-180': expanded }"
      >
        <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
      </svg>
    </button>

    <div v-if="expanded" class="px-6 pb-6 space-y-4 border-t border-zinc-800 pt-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-zinc-400">Topic (optional)</label>
          <input
            v-model="topic"
            type="text"
            placeholder="e.g. study habits, school lunch, weekend plans"
            class="block w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-medium text-zinc-400">Number of questions</label>
          <select
            v-model="count"
            class="block w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
          </select>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="generate"
          :disabled="generating"
          class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
        >
          {{ generating ? 'Generating...' : 'Generate Questions' }}
        </button>
        <p v-if="error" class="text-sm text-red-400">{{ error }}</p>
      </div>

      <div v-if="results.length > 0" class="space-y-3">
        <div class="flex items-center justify-between gap-4">
          <p class="text-sm text-zinc-400">{{ results.length }} suggestion{{ results.length === 1 ? '' : 's' }}</p>
          <button
            v-if="mode === 'bulk'"
            type="button"
            @click="addSelectedToQueue"
            :disabled="selectedIndexes.length === 0 || adding"
            class="text-sm font-medium text-green-400 hover:text-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ adding ? 'Adding...' : `Add ${selectedIndexes.length || ''} to queue`.trim() }}
          </button>
        </div>

        <div
          v-for="(item, index) in results"
          :key="index"
          class="rounded-lg border border-zinc-700 bg-zinc-800/40 p-4 space-y-3"
        >
          <div class="flex items-start gap-3">
            <input
              v-if="mode === 'bulk'"
              v-model="selectedIndexes"
              type="checkbox"
              :value="index"
              class="mt-1 rounded border-zinc-600 bg-zinc-900 text-indigo-500 focus:ring-indigo-500"
            />
            <div class="flex-1 min-w-0">
              <p class="text-white font-medium">{{ item.question }}</p>
              <ul class="mt-2 space-y-1">
                <li v-for="(option, optionIndex) in item.options" :key="optionIndex" class="text-sm text-zinc-400">
                  {{ optionIndex + 1 }}. {{ option }}
                </li>
              </ul>
            </div>
          </div>
          <button
            v-if="mode === 'fill'"
            type="button"
            @click="emit('use-question', item)"
            class="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Use this question
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

export interface GeneratedQuestionSuggestion {
  question: string;
  options: string[];
}

const props = withDefaults(defineProps<{
  mode?: 'fill' | 'bulk';
  durationDays?: number;
}>(), {
  mode: 'fill',
  durationDays: 3
});

const emit = defineEmits<{
  'use-question': [question: GeneratedQuestionSuggestion];
  'added-to-queue': [];
}>();

const expanded = ref(false);
const topic = ref('');
const count = ref(3);
const generating = ref(false);
const adding = ref(false);
const error = ref('');
const results = ref<GeneratedQuestionSuggestion[]>([]);
const selectedIndexes = ref<number[]>([]);

async function generate() {
  generating.value = true;
  error.value = '';
  results.value = [];
  selectedIndexes.value = [];

  try {
    const response = await $fetch<{ questions: GeneratedQuestionSuggestion[] }>('/api/questionnaire/generate', {
      method: 'POST',
      body: {
        count: count.value,
        topic: topic.value || undefined
      }
    });

    results.value = response.questions;
    if (props.mode === 'bulk') {
      selectedIndexes.value = response.questions.map((_, index) => index);
    }
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to generate questions';
  } finally {
    generating.value = false;
  }
}

async function addSelectedToQueue() {
  const selected = selectedIndexes.value
    .map((index) => results.value[index])
    .filter(Boolean);

  if (selected.length === 0) return;

  adding.value = true;
  error.value = '';

  try {
    const questions = await $fetch<any[]>('/api/questionnaire?admin=true');
    let maxOrder = questions?.reduce((max, q) => Math.max(max, q.queue_order || 0), 0) || 0;
    const durationSeconds = props.durationDays * 24 * 60 * 60;

    for (const item of selected) {
      maxOrder += 1;
      await $fetch('/api/questionnaire/create', {
        method: 'POST',
        body: {
          question: item.question,
          options: item.options,
          duration: durationSeconds,
          auto_activate: true,
          queue_order: maxOrder
        }
      });
    }

    emit('added-to-queue');
    results.value = [];
    selectedIndexes.value = [];
    expanded.value = false;
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to add questions to queue';
  } finally {
    adding.value = false;
  }
}
</script>
