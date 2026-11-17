<template>
  <div class="space-y-2">
    <label class="block text-sm font-medium text-zinc-400">Linked Theme (Optional)</label>
    <p class="text-xs text-zinc-500 -mt-1">
      Pick an official or approved community BetterSEQTA+ theme. The extension popup will deep-link to it.
    </p>

    <p v-if="invalidLinkedTheme" class="text-xs text-amber-400">
      The previously linked theme is not a BetterSEQTA+ theme. Clear it and choose a valid theme.
    </p>

    <div v-if="selected" class="flex items-center gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
      <div class="flex-1 min-w-0">
        <div class="flex flex-wrap items-center gap-2">
          <div class="text-sm font-medium text-white truncate">{{ selected.name }}</div>
          <span :class="sourceBadgeClass(selected.source)" class="rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset">
            {{ selected.source === 'community' ? 'Community' : 'Official' }}
          </span>
        </div>
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
        placeholder="Search official or community themes..."
        class="block w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-green-500 focus:border-green-500"
      />
      <div v-if="loadingThemes" class="text-xs text-zinc-500">Loading themes...</div>
      <div
        v-else-if="filteredResults.length > 0"
        class="max-h-64 overflow-y-auto bg-zinc-900/50 border border-zinc-800 rounded-lg divide-y divide-zinc-800"
      >
        <button
          type="button"
          v-for="theme in filteredResults"
          :key="`${theme.source}:${theme.id}`"
          @click="select(theme)"
          class="w-full text-left px-4 py-2 hover:bg-zinc-800/70 transition-colors"
        >
          <div class="flex items-center gap-2">
            <div class="text-sm font-medium text-white truncate">{{ theme.name }}</div>
            <span :class="sourceBadgeClass(theme.source)" class="shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset">
              {{ theme.source === 'community' ? 'Community' : 'Official' }}
            </span>
          </div>
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

type ThemeSource = 'marketplace' | 'community';

interface ThemeOption {
  id: string;
  name: string;
  slug: string;
  author?: string;
  source: ThemeSource;
}

const props = defineProps<{
  modelValue: string;
  themeSource?: ThemeSource;
  initialTheme?: {
    id: string;
    name: string;
    slug: string;
    theme_type?: string;
    theme_source?: ThemeSource;
  } | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'update:themeSource', value: ThemeSource): void;
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
    await loadSelectedById(props.modelValue, props.themeSource);
  } else if (props.initialTheme) {
    applyInitialTheme(props.initialTheme);
  }
  if (!selected.value) {
    await loadAllThemes();
  }
});

function sourceBadgeClass(source: ThemeSource) {
  return source === 'community'
    ? 'bg-amber-500/15 text-amber-200 ring-amber-500/25'
    : 'bg-violet-500/15 text-violet-200 ring-violet-500/25';
}

function applyInitialTheme(theme: NonNullable<typeof props.initialTheme>) {
  if (theme.theme_type && theme.theme_type !== 'betterseqta') {
    invalidLinkedTheme.value = true;
    selected.value = {
      id: theme.id,
      name: theme.name,
      slug: theme.slug,
      source: theme.theme_source === 'community' ? 'community' : 'marketplace'
    };
    return;
  }
  const source: ThemeSource = theme.theme_source === 'community' ? 'community' : 'marketplace';
  selected.value = { id: theme.id, name: theme.name, slug: theme.slug, source };
  emit('update:themeSource', source);
}

watch(() => props.modelValue, async (newVal) => {
  if (!newVal) {
    selected.value = null;
    invalidLinkedTheme.value = false;
    await loadAllThemes();
    return;
  }
  if (selected.value?.id === newVal) return;
  await loadSelectedById(newVal, props.themeSource);
});

async function loadSelectedById(id: string, sourceHint?: ThemeSource) {
  invalidLinkedTheme.value = false;

  const tryCommunity = sourceHint !== 'marketplace';
  const tryMarketplace = sourceHint !== 'community';

  if (tryCommunity) {
    const community = await fetchCommunityTheme(id);
    if (community) {
      selected.value = community;
      emit('update:themeSource', 'community');
      return;
    }
  }

  if (tryMarketplace) {
    const marketplace = await fetchMarketplaceTheme(id);
    if (marketplace) {
      selected.value = marketplace;
      emit('update:themeSource', 'marketplace');
      return;
    }
  }

  if (props.initialTheme?.id === id) {
    applyInitialTheme(props.initialTheme);
  }
}

async function fetchMarketplaceTheme(id: string): Promise<ThemeOption | null> {
  try {
    const res: any = await $fetch(`/api/themes/${id}`);
    const theme = res?.data?.theme;
    if (!theme || theme.theme_type !== 'betterseqta') return null;
    return {
      id: theme.id,
      name: theme.name,
      slug: theme.slug,
      author: theme.author,
      source: 'marketplace'
    };
  } catch {
    return null;
  }
}

async function fetchCommunityTheme(id: string): Promise<ThemeOption | null> {
  try {
    const res: any = await $fetch(`/api/custom-themes/${id}`);
    const theme = res?.data?.theme;
    if (!theme || theme.theme_type !== 'betterseqta') return null;
    return {
      id: theme.id,
      name: theme.name,
      slug: theme.slug,
      author: theme.author,
      source: 'community'
    };
  } catch {
    return null;
  }
}

async function loadThemeBatch(
  path: string,
  params: Record<string, unknown>,
  source: ThemeSource
): Promise<ThemeOption[]> {
  const themes: ThemeOption[] = [];
  let page = 1;
  while (true) {
    const res: any = await $fetch(path, { params: { ...params, page, limit: 100 } });
    const envelope = res?.data ?? res;
    const batch = envelope?.themes ?? [];
    themes.push(
      ...batch.map((t: any) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        author: t.author,
        source
      }))
    );
    const pagination = envelope?.pagination;
    if (!pagination?.has_next && !(pagination?.page < pagination?.total_pages)) break;
    if (pagination?.has_next === false) break;
    if (page >= (pagination?.total_pages ?? 1)) break;
    page++;
  }
  return themes;
}

async function loadAllThemes() {
  if (loadingThemes.value || allThemes.value.length > 0) return;
  loadingThemes.value = true;
  try {
    const [official, community] = await Promise.all([
      loadThemeBatch('/api/themes', { type: 'betterseqta', sort: 'name' }, 'marketplace'),
      loadThemeBatch('/api/custom-themes', { type: 'betterseqta', sort: 'name' }, 'community')
    ]);
    official.sort((a, b) => a.name.localeCompare(b.name));
    community.sort((a, b) => a.name.localeCompare(b.name));
    allThemes.value = [...official, ...community];
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
  emit('update:themeSource', theme.source);
  query.value = '';
}

async function clearSelection() {
  selected.value = null;
  invalidLinkedTheme.value = false;
  emit('update:modelValue', '');
  emit('update:themeSource', 'marketplace');
  await loadAllThemes();
}
</script>