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
        placeholder="Search or scroll to pick a BetterSEQTA+ theme..."
        class="block w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-green-500 focus:border-green-500"
      />
      <div v-if="loadingThemes" class="text-xs text-zinc-500">Loading themes...</div>
      <div v-else-if="filteredResults.length > 0" class="max-h-64 overflow-y-auto bg-zinc-900/50 border border-zinc-800 rounded-lg divide-y divide-zinc-800">
        <button
          type="button"
          v-for="theme in filteredResults"
          :key="theme.id"
          @click="select(theme)"
          class="w-full text-left px-4 py-2 hover:bg-zinc-800/70 transition-colors"
        >
          <div class="text-sm font-medium text-white truncate">{{ theme.name }}</div>
          <div class="text-xs text-zinc-500 truncate">by {{ theme.author }} · {{ theme.slug }}</div>
        </button>
      </div>
      <div v-else-if="allThemes.length > 0 && query.trim()" class="text-xs text-zinc-500 italic">No themes match your search</div>
      <div v-else-if="!loadingThemes && allThemes.length === 0" class="text-xs text-zinc-500 italic">No BetterSEQTA+ themes found</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';

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
const allThemes = ref<ThemeOption[]>([]);
const loadingThemes = ref(false);
const selected = ref<ThemeOption | null>(null);
const invalidLinkedTheme = ref(false);

const filteredResults = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return allThemes.value;
  return allThemes.value.filter((t) =>
    t.name.toLowerCase().includes(q) ||
    t.slug.toLowerCase().includes(q) ||
    (t.author?.toLowerCase().includes(q) ?? false)
  );
});

onMounted(async () => {
  if (props.modelValue) {
    await loadSelectedById(props.modelValue);
  } else if (props.initialTheme) {
    applyInitialTheme(props.initialTheme);
  }
  if (!selected.value) {
    await loadAllThemes();
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
    await loadAllThemes();
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

async function loadAllThemes() {
  if (loadingThemes.value || allThemes.value.length > 0) return;
  loadingThemes.value = true;
  const themes: ThemeOption[] = [];
  let page = 1;
  try {
    while (true) {
      const res: any = await $fetch('/api/themes', {
        params: { type: 'betterseqta', limit: 100, page, sort: 'name' }
      });
      const batch = res?.data?.themes ?? [];
      themes.push(
        ...batch.map((t: any) => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          author: t.author
        }))
      );
      if (!res?.data?.pagination?.has_next) break;
      page++;
    }
    allThemes.value = themes;
  } catch {
    allThemes.value = [];
  } finally {
    loadingThemes.value = false;
  }
}

function select(theme: ThemeOption) {
  invalidLinkedTheme.value = false;
  selected.value = theme;
  emit('update:modelValue', theme.id);
  query.value = '';
}

async function clearSelection() {
  selected.value = null;
  invalidLinkedTheme.value = false;
  emit('update:modelValue', '');
  await loadAllThemes();
}
</script>
