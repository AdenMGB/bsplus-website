<template>
  <div class="space-y-2">
    <label v-if="label" class="block text-sm text-zinc-200">{{ label }}</label>
    <div class="flex gap-2">
      <input
        v-model="query"
        type="search"
        :placeholder="placeholder"
        class="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        @keydown.enter.prevent="runSearch"
      />
      <button
        type="button"
        class="shrink-0 rounded-lg border border-zinc-600 px-3 py-2 text-sm text-zinc-200 transition-all duration-200 hover:scale-105 disabled:opacity-50"
        :disabled="searching"
        @click="runSearch"
      >
        {{ searching ? '…' : 'Search' }}
      </button>
    </div>

    <p v-if="selectedLabel" class="rounded-lg border border-orange-500/30 bg-orange-950/20 px-3 py-2 text-xs text-orange-100">
      Selected: <span class="font-mono">{{ modelValue }}</span> — {{ selectedLabel }}
      <button type="button" class="ml-2 text-orange-300 underline hover:text-orange-200" @click="clearSelection">Clear</button>
    </p>

    <ul
      v-if="results.length"
      class="max-h-48 space-y-1 overflow-auto rounded-lg border border-zinc-800 bg-zinc-950/80 p-2"
    >
      <li v-for="item in results" :key="item.id">
        <button
          type="button"
          class="w-full rounded-md px-2 py-2 text-left text-sm transition-colors duration-200 hover:bg-zinc-800"
          :class="modelValue === item.id ? 'bg-orange-950/40 text-orange-100' : 'text-zinc-200'"
          @click="selectItem(item)"
        >
          <span class="font-medium">{{ item.primary }}</span>
          <span v-if="item.secondary" class="mt-0.5 block truncate text-xs text-zinc-500">{{ item.secondary }}</span>
          <span class="font-mono text-[10px] text-zinc-600">{{ item.id }}</span>
        </button>
      </li>
    </ul>
    <p v-else-if="searched && !searching" class="text-xs text-zinc-500">No matches.</p>
    <p v-if="error" class="text-xs text-red-300">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: string;
    mode: 'user' | 'install';
    label?: string;
    placeholder?: string;
    userFilterId?: string;
  }>(),
  {
    label: '',
    placeholder: 'Search username, email, ID…',
    userFilterId: '',
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
  selected: [payload: { id: string; label: string }];
}>();

type ResultItem = { id: string; primary: string; secondary: string };

const query = ref('');
const results = ref<ResultItem[]>([]);
const searching = ref(false);
const searched = ref(false);
const error = ref('');
const selectedLabel = ref('');

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function clearSelection() {
  emit('update:modelValue', '');
  selectedLabel.value = '';
}

function selectItem(item: ResultItem) {
  emit('update:modelValue', item.id);
  selectedLabel.value = `${item.primary}${item.secondary ? ` (${item.secondary})` : ''}`;
  emit('selected', { id: item.id, label: selectedLabel.value });
}

async function runSearch() {
  searching.value = true;
  searched.value = true;
  error.value = '';
  try {
    if (props.mode === 'user') {
      const res = await $fetch<{ success: boolean; data: { users: Array<Record<string, unknown>> } }>(
        '/api/bsplus/admin/interop/users',
        { query: { q: query.value.trim(), page: 1, pageSize: 20 } },
      );
      results.value = (res.data?.users ?? []).map((u) => ({
        id: String(u.id),
        primary: String(u.displayName || u.username || u.email || u.id),
        secondary: [u.username, u.email].filter(Boolean).join(' · '),
      }));
    } else {
      const res = await $fetch<{ success: boolean; data: { cloud: { installs: Array<Record<string, unknown>> }; website: { installs: Array<Record<string, unknown>> } } }>(
        '/api/bsplus/admin/interop/installs',
        {
          query: {
            q: query.value.trim(),
            page: 1,
            pageSize: 20,
            ...(props.userFilterId ? { userId: props.userFilterId } : {}),
          },
        },
      );
      const merged = [
        ...(res.data?.cloud?.installs ?? []).map((row) => ({
          id: String(row.installId),
          primary: String(row.deviceName || row.installId),
          secondary: [
            row.displayName || row.username,
            row.extension && typeof row.extension === 'object'
              ? `v${(row.extension as { version?: string }).version ?? '?'}`
              : null,
            'cloud link',
          ]
            .filter(Boolean)
            .join(' · '),
        })),
        ...(res.data?.website?.installs ?? []).map((row) => ({
          id: String(row.installId),
          primary: String(row.installId).slice(0, 8) + '…',
          secondary: [
            row.extensionVersion ? `v${row.extensionVersion}` : null,
            row.userId ? `user ${String(row.userId).slice(0, 8)}…` : 'anonymous',
            'website register',
          ]
            .filter(Boolean)
            .join(' · '),
        })),
      ];
      const seen = new Set<string>();
      results.value = merged.filter((item) => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });
    }
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Search failed';
    results.value = [];
  } finally {
    searching.value = false;
  }
}

watch(query, (value) => {
  if (debounceTimer) clearTimeout(debounceTimer);
  if (!value.trim()) {
    results.value = [];
    searched.value = false;
    return;
  }
  debounceTimer = setTimeout(() => {
    void runSearch();
  }, 320);
});

watch(
  () => props.modelValue,
  (id) => {
    if (!id) selectedLabel.value = '';
  },
);
</script>
