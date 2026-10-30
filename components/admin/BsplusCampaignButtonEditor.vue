<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-medium text-zinc-300">Campaign buttons</h3>
      <button
        type="button"
        class="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-all duration-200 hover:border-orange-500 hover:text-orange-300"
        @click="addButton"
      >
        + Add button
      </button>
    </div>

    <p v-if="!buttons.length" class="text-xs text-zinc-500">No buttons — add at least a dismiss action.</p>

    <div
      v-for="(btn, index) in buttons"
      :key="btn._key"
      class="space-y-2 rounded-xl border border-zinc-800 bg-zinc-950/50 p-4"
    >
      <div class="flex items-center justify-between gap-2">
        <span class="text-xs font-medium text-zinc-500">Button {{ index + 1 }}</span>
        <div class="flex gap-1">
          <button type="button" class="text-xs text-zinc-500 hover:text-white disabled:opacity-30" :disabled="index === 0" @click="moveButton(index, -1)">
            Up
          </button>
          <button
            type="button"
            class="text-xs text-zinc-500 hover:text-white disabled:opacity-30"
            :disabled="index === buttons.length - 1"
            @click="moveButton(index, 1)"
          >
            Down
          </button>
          <button type="button" class="text-xs text-red-400 hover:text-red-300" @click="removeButton(index)">
            Remove
          </button>
        </div>
      </div>

      <div class="grid gap-2 sm:grid-cols-2">
        <label class="text-xs text-zinc-400">
          Id
          <input v-model="btn.id" type="text" class="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm text-white" placeholder="dismiss" />
        </label>
        <label class="text-xs text-zinc-400">
          Label
          <input v-model="btn.label" type="text" class="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm text-white" placeholder="Got it" />
        </label>
      </div>

      <label class="block text-xs text-zinc-400">
        Action
        <select v-model="btn.action" class="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm text-white">
          <option v-for="a in actionOptions" :key="a.action" :value="a.action">
            {{ a.label }} — {{ a.description }}
          </option>
        </select>
      </label>

      <label v-if="btn.action === 'url'" class="block text-xs text-zinc-400">
        URL (HTTPS)
        <input v-model="btn.url" type="url" class="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm text-white" placeholder="https://…" />
      </label>

      <label v-if="btn.action === 'openSettingsSection'" class="block text-xs text-zinc-400">
        Settings section id
        <input
          v-model="btn.settingsSection"
          type="text"
          class="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm text-white"
          placeholder="general, appearance, …"
        />
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
export type CampaignButtonDraft = {
  _key: string;
  id: string;
  label: string;
  action: 'dismiss' | 'url' | 'openSettingsSection';
  url?: string;
  settingsSection?: string;
};

const props = defineProps<{
  modelValue: Array<Record<string, unknown>>;
  actionOptions?: Array<{ action: string; label: string; description: string }>;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: Array<Record<string, unknown>>];
}>();

const defaultActions = [
  { action: 'dismiss', label: 'Dismiss', description: 'Close popup' },
  { action: 'url', label: 'Open URL', description: 'Opens link in new tab' },
  { action: 'openSettingsSection', label: 'Open settings', description: 'Opens a settings section' },
];

const actionOptions = computed(() => props.actionOptions ?? defaultActions);

function newKey() {
  return `btn_${Math.random().toString(36).slice(2, 9)}`;
}

function rowToDraft(row: Record<string, unknown>): CampaignButtonDraft {
  const action = row.action === 'url' || row.action === 'openSettingsSection' ? row.action : 'dismiss';
  return {
    _key: newKey(),
    id: typeof row.id === 'string' ? row.id : 'dismiss',
    label: typeof row.label === 'string' ? row.label : 'OK',
    action,
    url: typeof row.url === 'string' ? row.url : '',
    settingsSection:
      typeof row.settingsSection === 'string'
        ? row.settingsSection
        : typeof row.section === 'string'
          ? row.section
          : '',
  };
}

function draftToRow(btn: CampaignButtonDraft): Record<string, unknown> {
  const out: Record<string, unknown> = {
    id: btn.id.trim() || 'btn',
    label: btn.label.trim() || 'OK',
    action: btn.action,
  };
  if (btn.action === 'url' && btn.url?.trim()) {
    out.url = btn.url.trim();
  }
  if (btn.action === 'openSettingsSection' && btn.settingsSection?.trim()) {
    out.settingsSection = btn.settingsSection.trim();
  }
  return out;
}

const buttons = ref<CampaignButtonDraft[]>([]);
let syncingFromParent = false;

watch(
  () => props.modelValue,
  (rows) => {
    syncingFromParent = true;
    buttons.value = (rows ?? []).map((r) => rowToDraft(r));
    if (!buttons.value.length) {
      buttons.value = [
        { _key: newKey(), id: 'dismiss', label: 'Got it', action: 'dismiss' },
      ];
    }
    syncingFromParent = false;
  },
  { immediate: true, deep: true }
);

watch(
  buttons,
  () => {
    if (syncingFromParent) return;
    emit(
      'update:modelValue',
      buttons.value.map((b) => draftToRow(b))
    );
  },
  { deep: true }
);

function addButton() {
  buttons.value = [
    ...buttons.value,
    { _key: newKey(), id: `action_${buttons.value.length + 1}`, label: 'Learn more', action: 'url', url: '' },
  ];
}

function removeButton(index: number) {
  buttons.value = buttons.value.filter((_, i) => i !== index);
}

function moveButton(index: number, delta: number) {
  const next = [...buttons.value];
  const target = index + delta;
  if (target < 0 || target >= next.length) return;
  const tmp = next[index];
  next[index] = next[target];
  next[target] = tmp;
  buttons.value = next;
}
</script>
