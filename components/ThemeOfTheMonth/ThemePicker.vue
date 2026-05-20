<template>
  <div class="space-y-2">
    <label class="block text-sm font-medium text-zinc-400">Linked Theme (Optional)</label>
    <p class="text-xs text-zinc-500 -mt-1">Pick a BetterSEQTA+ theme from the store. The extension popup will deep-link to it.</p>

    <p v-if="invalidLinkedTheme" class="text-xs text-amber-400">
      The previously linked theme is not a BetterSEQTA+ theme. Clear it and choose a BetterSEQTA+ theme.
    </p>

    <div v-if="selected" class="flex items-center gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
      <div class="flex-1 min-w-0">
        <div class="text-sm font-medium text-white truncate">{{ selected.name }}</div>
        <div class="text-xs text-zinc-500 font-mono truncate">{{ selected.slug }}</div>
      </div>
      <button
        type="button"
        @click="clearSelection"
        class="text-xs text-red-400 hover:text-red-300 transition-colors"
      >
        Clear
      </button>
    </div>

    <div v-else class="space-y-2">
      <input
        v-model="query"
        type="text"
        placeholder="Search BetterSEQTA+ themes by name, description, or author..."
        @input="onQueryInput"
        class="block w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-green-500 focus:border-green-500"
      />
      <div v-if="searching" class="text-xs text-zinc-500">Searching...</div>
      <div v-else-if="results.length > 0" class="max-h-64 overflow-y-auto bg-zinc-900/50 border border-zinc-800 rounded-lg divide-y divide-zinc-800">
        <button
          type="button"
          v-for="theme in results"
          :key="theme.id"
          @click="select(theme)"
          class="w-full text-left px-4 py-2 hover:bg-zinc-800/70 transition-colors"
        >
          <div class="text-sm font-medium text-white truncate">{{ theme.name }}</div>
          <div class="text-xs text-zinc-500 truncate">by {{ theme.author }} · {{ theme.slug }}</div>
        </button>
      </div>
      <div v-else-if="query.trim().length >= 2 && !searching" class="text-xs text-zinc-500 italic">No results</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';

interface ThemeOption {
  id: string;
  name: string;
  slug: string;
  author?: string;
}

const props = defineProps<{
  modelValue: string;
  initialTheme?: { id: string; name: string; slug: string; theme_type?: string } | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const query = ref('');
const results = ref<ThemeOption[]>([]);
const searching = ref(false);
const selected = ref<ThemeOption | null>(null);
const invalidLinkedTheme = ref(false);
let searchTimer: ReturnType<typeof setTimeout> | null = null;

onMounted(async () => {
  if (props.modelValue) {
    await loadSelectedById(props.modelValue);
  } else if (props.initialTheme) {
    applyInitialTheme(props.initialTheme);
  }
});

function applyInitialTheme(theme: NonNullable<typeof props.initialTheme>) {
  if (theme.theme_type && theme.theme_type !== 'betterseqta') {
    invalidLinkedTheme.value = true;
    selected.value = { id: theme.id, name: theme.name, slug: theme.slug };
    return;
  }
  selected.value = { id: theme.id, name: theme.name, slug: theme.slug };
}

watch(() => props.modelValue, async (newVal) => {
  if (!newVal) {
    selected.value = null;
    invalidLinkedTheme.value = false;
    return;
  }
  if (selected.value?.id === newVal) return;
  await loadSelectedById(newVal);
});

async function loadSelectedById(id: string) {
  invalidLinkedTheme.value = false;
  try {
    const res: any = await $fetch(`/api/themes/${id}`);
    const theme = res?.data?.theme;
    if (!theme) return;

    if (theme.theme_type !== 'betterseqta') {
      invalidLinkedTheme.value = true;
      selected.value = props.initialTheme?.id === id
        ? { id: theme.id, name: theme.name, slug: theme.slug, author: theme.author }
        : null;
      if (!selected.value) {
        emit('update:modelValue', '');
      }
      return;
    }

    selected.value = { id: theme.id, name: theme.name, slug: theme.slug, author: theme.author };
  } catch {
    if (props.initialTheme?.id === id) {
      applyInitialTheme(props.initialTheme);
    }
  }
}

function onQueryInput() {
  if (searchTimer) clearTimeout(searchTimer);
  const q = query.value.trim();
  if (q.length < 2) {
    results.value = [];
    searching.value = false;
    return;
  }
  searching.value = true;
  searchTimer = setTimeout(async () => {
    try {
      const res: any = await $fetch('/api/themes/search', {
        params: { q, limit: 10, type: 'betterseqta' }
      });
      const themes = res?.data?.themes ?? [];
      results.value = themes.map((t: any) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        author: t.author
      }));
    } catch {
      results.value = [];
    } finally {
      searching.value = false;
    }
  }, 300);
}

function select(theme: ThemeOption) {
  invalidLinkedTheme.value = false;
  selected.value = theme;
  emit('update:modelValue', theme.id);
  query.value = '';
  results.value = [];
}

function clearSelection() {
  selected.value = null;
  invalidLinkedTheme.value = false;
  emit('update:modelValue', '');
}
</script>
