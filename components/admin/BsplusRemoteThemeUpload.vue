<template>
  <div class="space-y-3">
    <div
      class="rounded-xl border-2 border-dashed p-8 text-center transition-colors duration-200"
      :class="isDragging ? 'border-orange-500 bg-orange-500/10' : 'border-zinc-700 bg-zinc-950/40'"
      @drop.prevent="onDrop"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
    >
      <input ref="fileInput" type="file" accept=".zip,.json,application/json" class="hidden" @change="onFileInput" />
      <p class="text-sm text-white">Drop a BetterSEQTA+ theme ZIP or <code class="text-zinc-400">theme.json</code></p>
      <p class="mt-1 text-xs text-zinc-500">Same layout as marketplace upload (theme.json with CustomCSS, id, name, description)</p>
      <button
        type="button"
        class="mt-4 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:scale-105"
        @click="fileInput?.click()"
      >
        Browse files
      </button>
      <p v-if="fileName" class="mt-3 text-xs text-zinc-400">{{ fileName }}</p>
    </div>

    <div v-if="preview" class="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 text-sm">
      <p v-if="preview.valid" class="text-green-400">Theme structure valid</p>
      <ul v-if="preview.errors?.length" class="mt-2 list-inside list-disc text-red-300">
        <li v-for="(err, i) in preview.errors" :key="i">{{ err }}</li>
      </ul>
      <div v-if="preview.valid && preview.name" class="mt-2 grid gap-1 text-zinc-300">
        <p><span class="text-zinc-500">Name:</span> {{ preview.name }}</p>
        <p><span class="text-zinc-500">Theme id:</span> {{ preview.themeId }}</p>
      </div>
    </div>

    <details v-if="themeJsonText" class="rounded-lg border border-zinc-800">
      <summary class="cursor-pointer px-3 py-2 text-xs text-zinc-500">Advanced: edit theme JSON</summary>
      <textarea
        :value="themeJsonText"
        rows="6"
        class="w-full border-t border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-xs text-white"
        @input="onJsonEdit"
      />
    </details>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelThemeJson?: string;
}>();

const emit = defineEmits<{
  'update:theme': [value: Record<string, unknown> | null];
  'update:modelThemeJson': [value: string];
  'suggest-package-id': [value: string];
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const fileName = ref('');
const themeJsonText = ref(props.modelThemeJson ?? '');
const preview = ref<{
  valid: boolean;
  errors?: string[];
  name?: string;
  themeId?: string;
} | null>(null);

watch(
  () => props.modelThemeJson,
  (v) => {
    if (v !== undefined && v !== themeJsonText.value) {
      themeJsonText.value = v;
    }
  }
);

function slugPackageId(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 63);
}

function applyThemeObject(theme: Record<string, unknown>) {
  themeJsonText.value = JSON.stringify(theme, null, 2);
  emit('update:modelThemeJson', themeJsonText.value);
  emit('update:theme', theme);
  const id = typeof theme.id === 'string' ? theme.id : '';
  if (id) {
    const pkg = slugPackageId(id);
    if (pkg.length >= 3) emit('suggest-package-id', pkg);
  }
  preview.value = {
    valid: true,
    name: typeof theme.name === 'string' ? theme.name : undefined,
    themeId: id || undefined,
  };
}

function validateThemeObject(theme: unknown): theme is Record<string, unknown> {
  if (!theme || typeof theme !== 'object' || Array.isArray(theme)) return false;
  const t = theme as Record<string, unknown>;
  return (
    typeof t.CustomCSS === 'string' &&
    typeof t.id === 'string' &&
    typeof t.name === 'string' &&
    typeof t.description === 'string'
  );
}

async function handleZip(file: File) {
  const formData = new FormData();
  formData.append('theme_zip', file);
  const response = await $fetch<any>('/api/admin/themes/manifest-preview', {
    method: 'POST',
    body: formData,
  });
  if (!response.success) {
    preview.value = {
      valid: false,
      errors: [response.error?.message || 'Preview failed'],
    };
    emit('update:theme', null);
    return;
  }
  const data = response.data;
  if (data.theme_type !== 'betterseqta') {
    preview.value = {
      valid: false,
      errors: ['Remote packages require a BetterSEQTA theme (theme.json with CustomCSS).'],
    };
    emit('update:theme', null);
    return;
  }
  const errors = [...(data.validation?.errors ?? [])];
  if (!data.manifest) {
    errors.push('Could not parse theme.json');
  }
  if (errors.length) {
    preview.value = { valid: false, errors };
    emit('update:theme', null);
    return;
  }
  applyThemeObject(data.manifest as Record<string, unknown>);
}

async function handleJsonFile(file: File) {
  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    preview.value = { valid: false, errors: ['Invalid JSON file'] };
    emit('update:theme', null);
    return;
  }
  if (!validateThemeObject(parsed)) {
    preview.value = {
      valid: false,
      errors: ['theme.json must include CustomCSS, id, name, and description'],
    };
    emit('update:theme', null);
    return;
  }
  applyThemeObject(parsed);
}

async function processFile(file: File) {
  fileName.value = file.name;
  preview.value = null;
  if (file.name.endsWith('.zip')) {
    await handleZip(file);
  } else if (file.name.endsWith('.json') || file.type === 'application/json') {
    await handleJsonFile(file);
  } else {
    preview.value = { valid: false, errors: ['Upload a .zip theme folder or theme.json'] };
    emit('update:theme', null);
  }
}

function onDrop(e: DragEvent) {
  isDragging.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (file) void processFile(file);
}

function onFileInput(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) void processFile(file);
}

function onJsonEdit(e: Event) {
  const text = (e.target as HTMLTextAreaElement).value;
  themeJsonText.value = text;
  emit('update:modelThemeJson', text);
  try {
    const parsed = JSON.parse(text);
    if (validateThemeObject(parsed)) {
      emit('update:theme', parsed);
      preview.value = {
        valid: true,
        name: String(parsed.name),
        themeId: String(parsed.id),
      };
    } else {
      preview.value = { valid: false, errors: ['Missing required theme fields'] };
      emit('update:theme', null);
    }
  } catch {
    preview.value = { valid: false, errors: ['Invalid JSON'] };
    emit('update:theme', null);
  }
}
</script>
