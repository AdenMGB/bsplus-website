<template>
  <fieldset class="rounded-xl border border-zinc-800 p-4">
    <legend class="px-2 text-sm font-medium text-zinc-300">{{ title }}</legend>

    <div class="mt-3 grid gap-4 lg:grid-cols-2">
      <label class="block text-sm text-zinc-200">
        Channels (comma-separated)
        <input
          v-model="channelsText"
          placeholder="stable, nightly"
          class="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
        />
      </label>
      <label class="block text-sm text-zinc-200">
        Rollout % (0–100, by installId)
        <input
          v-model.number="local.percentage"
          type="number"
          min="0"
          max="100"
          class="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
        />
      </label>
      <label class="block text-sm text-zinc-200">
        Min extension version
        <input v-model="local.minExtensionVersion" type="text" class="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white" />
      </label>
      <label class="block text-sm text-zinc-200">
        Max extension version
        <input v-model="local.maxExtensionVersion" type="text" class="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white" />
      </label>
    </div>

    <label class="mt-4 block text-sm text-zinc-200">
      Hostname suffixes (one per line)
      <textarea v-model="hostnameSuffixesText" rows="2" class="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-xs text-white" />
    </label>

    <div class="mt-4 grid gap-4 lg:grid-cols-2">
      <AdminBsplusScopeSearch
        v-model="pickedUserId"
        mode="user"
        label="Include user"
        placeholder="Search accounts users…"
        @selected="addUserId"
      />
      <AdminBsplusScopeSearch
        v-model="pickedInstallId"
        mode="install"
        label="Include install"
        placeholder="Search install IDs…"
        :user-filter-id="pickedUserId"
        @selected="addInstallId"
      />
    </div>

    <div v-if="local.userIds?.length" class="mt-3 flex flex-wrap gap-2">
      <span v-for="id in local.userIds" :key="'u-' + id" class="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-200">
        user {{ id.slice(0, 8) }}…
        <button type="button" class="text-red-400" @click="removeFromList('userIds', id)">×</button>
      </span>
    </div>
    <div v-if="local.installIds?.length" class="mt-2 flex flex-wrap gap-2">
      <span v-for="id in local.installIds" :key="'i-' + id" class="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-200">
        install {{ id.slice(0, 8) }}…
        <button type="button" class="text-red-400" @click="removeFromList('installIds', id)">×</button>
      </span>
    </div>

    <details class="mt-4">
      <summary class="cursor-pointer text-xs text-zinc-500">Advanced JSON</summary>
      <textarea
        :value="jsonPreview"
        rows="5"
        readonly
        class="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-xs text-zinc-400"
      />
    </details>
  </fieldset>
</template>

<script setup lang="ts">
type AudienceRule = {
  channels?: string[];
  minExtensionVersion?: string;
  maxExtensionVersion?: string;
  hostnameSuffixes?: string[];
  installIds?: string[];
  userIds?: string[];
  denyInstallIds?: string[];
  denyUserIds?: string[];
  percentage?: number;
};

const props = withDefaults(
  defineProps<{
    modelValue: AudienceRule | null;
    title?: string;
  }>(),
  { title: 'Audience targeting' },
);

const emit = defineEmits<{
  'update:modelValue': [value: AudienceRule | null];
}>();

const local = reactive<AudienceRule>({});
const pickedUserId = ref('');
const pickedInstallId = ref('');

function syncFromModel(value: AudienceRule | null) {
  const next = value ? { ...value } : {};
  Object.keys(local).forEach((k) => delete (local as Record<string, unknown>)[k]);
  Object.assign(local, next);
  if (!local.userIds) local.userIds = [];
  if (!local.installIds) local.installIds = [];
}

watch(
  () => props.modelValue,
  (value) => syncFromModel(value),
  { immediate: true, deep: true },
);

function emitRule() {
  const rule: AudienceRule = {};
  if (local.channels?.length) rule.channels = [...local.channels];
  if (local.minExtensionVersion?.trim()) rule.minExtensionVersion = local.minExtensionVersion.trim();
  if (local.maxExtensionVersion?.trim()) rule.maxExtensionVersion = local.maxExtensionVersion.trim();
  if (local.hostnameSuffixes?.length) rule.hostnameSuffixes = [...local.hostnameSuffixes];
  if (local.userIds?.length) rule.userIds = [...local.userIds];
  if (local.installIds?.length) rule.installIds = [...local.installIds];
  if (typeof local.percentage === 'number' && local.percentage >= 0 && local.percentage <= 100) {
    rule.percentage = local.percentage;
  }
  const hasKeys = Object.keys(rule).length > 0;
  emit('update:modelValue', hasKeys ? rule : null);
}

watch(local, () => emitRule(), { deep: true });

const channelsText = computed({
  get: () => (local.channels ?? []).join(', '),
  set: (value: string) => {
    local.channels = value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  },
});

const hostnameSuffixesText = computed({
  get: () => (local.hostnameSuffixes ?? []).join('\n'),
  set: (value: string) => {
    local.hostnameSuffixes = value
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  },
});

const jsonPreview = computed(() => JSON.stringify(props.modelValue ?? {}, null, 2));

function addUserId(payload: { id: string }) {
  if (!local.userIds) local.userIds = [];
  if (!local.userIds.includes(payload.id)) local.userIds.push(payload.id);
  pickedUserId.value = '';
}

function addInstallId(payload: { id: string }) {
  if (!local.installIds) local.installIds = [];
  if (!local.installIds.includes(payload.id)) local.installIds.push(payload.id);
  pickedInstallId.value = '';
}

function removeFromList(key: 'userIds' | 'installIds', id: string) {
  const list = local[key];
  if (!list) return;
  local[key] = list.filter((entry) => entry !== id);
}
</script>
