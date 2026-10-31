<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-medium text-zinc-300">Overlay layers (1–5)</h3>
      <button
        type="button"
        class="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-all duration-200 hover:border-orange-500 hover:text-orange-300 disabled:opacity-40"
        :disabled="layers.length >= maxLayers"
        @click="addLayer"
      >
        + Add layer
      </button>
    </div>
    <p class="text-xs text-zinc-500">
      Applied above the user&apos;s theme. Later layers win on CSS conflicts. Mutually exclusive with a single full theme upload.
    </p>

    <div
      v-for="(layer, index) in layers"
      :key="layer._key"
      class="space-y-2 rounded-xl border border-zinc-800 bg-zinc-950/50 p-4"
    >
      <div class="flex items-center justify-between">
        <span class="text-xs text-zinc-500">Layer {{ index + 1 }}</span>
        <div class="flex gap-2">
          <button type="button" class="text-xs text-zinc-500 hover:text-white disabled:opacity-30" :disabled="index === 0" @click="moveLayer(index, -1)">Up</button>
          <button type="button" class="text-xs text-zinc-500 hover:text-white disabled:opacity-30" :disabled="index === layers.length - 1" @click="moveLayer(index, 1)">Down</button>
          <button type="button" class="text-xs text-red-400 hover:text-red-300" @click="removeLayer(index)">Remove</button>
        </div>
      </div>
      <div class="grid gap-2 sm:grid-cols-2">
        <label class="text-xs text-zinc-400">
          id
          <input v-model="layer.id" type="text" class="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1.5 font-mono text-sm text-white" placeholder="remote-layer-brand" />
        </label>
        <label class="text-xs text-zinc-400">
          name
          <input v-model="layer.name" type="text" class="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm text-white" placeholder="Brand accents" />
        </label>
      </div>
      <label class="block text-xs text-zinc-400">
        CustomCSS
        <textarea v-model="layer.customCss" rows="4" class="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1.5 font-mono text-xs text-white" placeholder=":root { --bsplus-accent: #004488; }" />
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
type LayerDraft = {
  _key: string;
  id: string;
  name: string;
  customCss: string;
};

const props = defineProps<{
  modelValue: Array<Record<string, unknown>>;
  maxLayers?: number;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: Array<Record<string, unknown>>];
}>();

const maxLayers = computed(() => props.maxLayers ?? 5);

function newKey() {
  return `layer_${Math.random().toString(36).slice(2, 9)}`;
}

function rowToDraft(row: Record<string, unknown>): LayerDraft {
  return {
    _key: newKey(),
    id: typeof row.id === 'string' ? row.id : '',
    name: typeof row.name === 'string' ? row.name : '',
    customCss: typeof row.CustomCSS === 'string' ? row.CustomCSS : '',
  };
}

function draftToRow(layer: LayerDraft): Record<string, unknown> {
  const out: Record<string, unknown> = {
    id: layer.id.trim(),
    CustomCSS: layer.customCss,
  };
  if (layer.name.trim()) out.name = layer.name.trim();
  return out;
}

const layers = ref<LayerDraft[]>([]);
let syncing = false;

watch(
  () => props.modelValue,
  (rows) => {
    syncing = true;
    layers.value = (rows ?? []).map((r) => rowToDraft(r));
    syncing = false;
  },
  { immediate: true, deep: true }
);

watch(
  layers,
  () => {
    if (syncing) return;
    emit(
      'update:modelValue',
      layers.value.map((l) => draftToRow(l)).filter((r) => r.id || r.CustomCSS)
    );
  },
  { deep: true }
);

function addLayer() {
  if (layers.value.length >= maxLayers.value) return;
  layers.value = [
    ...layers.value,
    { _key: newKey(), id: `remote-layer-${layers.value.length + 1}`, name: '', customCss: '' },
  ];
}

function removeLayer(index: number) {
  layers.value = layers.value.filter((_, i) => i !== index);
}

function moveLayer(index: number, delta: number) {
  const next = [...layers.value];
  const target = index + delta;
  if (target < 0 || target >= next.length) return;
  [next[index], next[target]] = [next[target], next[index]];
  layers.value = next;
}
</script>
