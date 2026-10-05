<template>
  <div class="py-24 sm:py-32">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="flex flex-col gap-6 mb-12 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">CSS Backgrounds</h2>
          <p class="mt-2 text-lg text-zinc-400">
            Upload images for the random theme background API. Images are stored in R2 as WebP.
          </p>
        </div>
        <NuxtLink
          to="/admin"
          class="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-sm font-medium text-zinc-300 transition-all duration-200 hover:scale-105 hover:bg-zinc-800"
        >
          Back to dashboard
        </NuxtLink>
      </div>

      <div class="mb-10 rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-6">
        <h3 class="text-sm font-semibold uppercase tracking-wider text-cyan-400">Public CSS URL</h3>
        <p class="mt-2 text-sm text-zinc-400">
          Use this stable URL in CustomCSS. Each request serves a random uploaded background.
        </p>
        <code class="mt-4 block break-all rounded-lg bg-black/40 px-4 py-3 text-sm text-cyan-200 ring-1 ring-cyan-500/30">
          {{ publicCssUrl }}
        </code>
        <button
          type="button"
          class="mt-4 inline-flex items-center gap-2 rounded-lg bg-cyan-600/20 px-4 py-2 text-sm font-medium text-cyan-300 ring-1 ring-cyan-500/30 transition-all duration-200 hover:scale-105 hover:bg-cyan-600/30 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
          @click="copyPublicUrl"
        >
          Copy URL
        </button>
      </div>

      <div class="mb-12 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h3 class="text-lg font-semibold text-white mb-4">Upload backgrounds</h3>
        <div
          class="border-2 border-dashed rounded-lg p-8 text-center transition-colors"
          :class="isDragging ? 'border-cyan-500 bg-cyan-500/10' : 'border-zinc-700 bg-zinc-900/30'"
          @drop.prevent="handleDrop"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
        >
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            multiple
            class="hidden"
            @change="handleFileSelect"
          />
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="mx-auto mb-4 h-12 w-12 text-zinc-500">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5m0 0l-4.5-4.5m4.5 4.5l4.5-4.5" />
          </svg>
          <p class="mb-2 text-white">Drag and drop one or more images here</p>
          <p class="mb-4 text-sm text-zinc-400">or</p>
          <button
            type="button"
            class="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:scale-105 hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
            @click="fileInput?.click()"
          >
            Browse files
          </button>
          <p class="mt-4 text-xs text-zinc-500">
            JPEG, PNG, WebP, etc. — converted to WebP in your browser before upload (max edge 2560px).
          </p>
        </div>

        <ul v-if="selectedFiles.length" class="mt-4 space-y-2">
          <li
            v-for="(file, index) in selectedFiles"
            :key="`${file.name}-${file.size}-${index}`"
            class="flex items-center justify-between rounded-lg bg-zinc-800 px-4 py-3"
          >
            <div class="min-w-0 pr-4">
              <p class="truncate text-sm font-medium text-white">{{ file.name }}</p>
              <p class="text-xs text-zinc-400">{{ formatBytes(file.size) }}</p>
            </div>
            <button
              type="button"
              class="shrink-0 text-red-400 transition-colors hover:text-red-300"
              aria-label="Remove file"
              @click="removeSelectedFile(index)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </li>
        </ul>

        <div class="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            :disabled="!selectedFiles.length || uploading"
            class="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:scale-105 hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
            @click="upload"
          >
            <svg v-if="uploading" class="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {{ uploadButtonLabel }}
          </button>
          <button
            v-if="selectedFiles.length"
            type="button"
            :disabled="uploading"
            class="text-sm font-medium text-zinc-400 transition-colors hover:text-white disabled:opacity-50"
            @click="clearSelectedFiles"
          >
            Clear all
          </button>
        </div>

        <p v-if="uploadProgress" class="mt-3 text-sm text-zinc-400">{{ uploadProgress }}</p>
        <p v-if="uploadError" class="mt-3 text-sm text-red-400">{{ uploadError }}</p>
        <ul v-if="uploadWarnings.length" class="mt-3 space-y-1 text-sm text-amber-400">
          <li v-for="(warning, index) in uploadWarnings" :key="index">{{ warning }}</li>
        </ul>
      </div>

      <div v-if="pending" class="flex items-center gap-2 text-zinc-500">
        <svg class="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        Loading backgrounds…
      </div>

      <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="bg in backgrounds"
          :key="bg.id"
          class="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 transition-all duration-200 hover:border-zinc-700"
        >
          <div class="aspect-video bg-zinc-950">
            <img
              :src="bg.preview_url"
              :alt="bg.original_filename || 'Background'"
              class="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div class="p-4">
            <p class="truncate text-sm font-medium text-white">
              {{ bg.original_filename || bg.id }}
            </p>
            <p class="mt-1 text-xs text-zinc-500">
              {{ bg.width }}×{{ bg.height }} · {{ formatBytes(bg.byte_size) }}
            </p>
            <button
              type="button"
              class="mt-4 rounded-md px-1 text-sm font-medium text-red-400 transition-colors hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
              @click="removeBackground(bg.id)"
            >
              Delete
            </button>
          </div>
        </div>
        <div
          v-if="!backgrounds.length"
          class="col-span-full rounded-2xl border border-dashed border-zinc-700 py-16 text-center text-zinc-500"
        >
          No backgrounds yet. Upload at least one image for the public API to respond.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['admin'],
});

const requestUrl = useRequestURL();

const { data, pending, refresh } = await useFetch<{
  data?: { public_url_path?: string; backgrounds?: BackgroundItem[] };
}>('/api/admin/backgrounds');

const backgrounds = computed(() => data.value?.data?.backgrounds ?? []);

const publicCssUrl = computed(() => {
  const path = data.value?.data?.public_url_path ?? '/api/background.webp';
  return `${requestUrl.origin}${path}`;
});

interface BackgroundItem {
  id: string;
  original_filename: string | null;
  width: number | null;
  height: number | null;
  byte_size: number | null;
  preview_url: string;
}

interface ConvertedUpload {
  file: File;
  width: number;
  height: number;
  originalName: string;
}

const fileInput = ref<HTMLInputElement | null>(null);
const selectedFiles = ref<File[]>([]);
const isDragging = ref(false);
const uploading = ref(false);
const uploadError = ref('');
const uploadProgress = ref('');
const uploadWarnings = ref<string[]>([]);

const uploadButtonLabel = computed(() => {
  if (uploading.value) return 'Uploading…';
  const count = selectedFiles.value.length;
  if (count <= 1) return 'Upload';
  return `Upload ${count} images`;
});

function addSelectedFiles(files: FileList | File[]) {
  uploadError.value = '';
  uploadWarnings.value = [];
  const next = [...selectedFiles.value];
  for (const file of Array.from(files)) {
    if (!file.type.startsWith('image/')) continue;
    next.push(file);
  }
  selectedFiles.value = next;
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files?.length) {
    addSelectedFiles(input.files);
  }
  input.value = '';
}

function handleDrop(event: DragEvent) {
  isDragging.value = false;
  const files = event.dataTransfer?.files;
  if (files?.length) {
    addSelectedFiles(files);
  }
}

function removeSelectedFile(index: number) {
  selectedFiles.value = selectedFiles.value.filter((_, i) => i !== index);
}

function clearSelectedFiles() {
  selectedFiles.value = [];
  if (fileInput.value) fileInput.value.value = '';
}

function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function copyPublicUrl() {
  try {
    await navigator.clipboard.writeText(publicCssUrl.value);
  } catch {
    alert(publicCssUrl.value);
  }
}

const MAX_EDGE_PX = 2560;
const WEBP_QUALITY = 0.85;

async function fileToWebpFile(
  file: File
): Promise<{ file: File; width: number; height: number; originalName: string }> {
  const bitmap = await createImageBitmap(file);
  let width = bitmap.width;
  let height = bitmap.height;
  const maxEdge = Math.max(width, height);

  if (maxEdge > MAX_EDGE_PX) {
    const scale = MAX_EDGE_PX / maxEdge;
    width = Math.max(1, Math.round(width * scale));
    height = Math.max(1, Math.round(height * scale));
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    throw new Error('Could not prepare canvas for WebP conversion');
  }

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error('WebP conversion failed'))),
      'image/webp',
      WEBP_QUALITY
    );
  });

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'background';
  const webpFile = new File([blob], `${baseName}.webp`, { type: 'image/webp' });
  return { file: webpFile, width, height, originalName: file.name };
}

async function upload() {
  if (!selectedFiles.value.length) return;
  uploading.value = true;
  uploadError.value = '';
  uploadWarnings.value = [];
  uploadProgress.value = 'Converting images to WebP…';

  try {
    const converted: ConvertedUpload[] = [];
    const conversionFailures: string[] = [];

    for (let index = 0; index < selectedFiles.value.length; index++) {
      const source = selectedFiles.value[index];
      uploadProgress.value = `Converting ${index + 1} of ${selectedFiles.value.length}…`;
      try {
        converted.push(await fileToWebpFile(source));
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Conversion failed';
        conversionFailures.push(`${source.name}: ${message}`);
      }
    }

    if (conversionFailures.length) {
      uploadWarnings.value = [...conversionFailures];
    }

    if (!converted.length) {
      uploadError.value = 'No images could be converted for upload';
      return;
    }

    uploadProgress.value = `Uploading ${converted.length} image${converted.length === 1 ? '' : 's'}…`;

    const body = new FormData();
    body.append(
      'files_meta',
      JSON.stringify(
        converted.map((item) => ({
          width: item.width,
          height: item.height,
          originalName: item.originalName,
        }))
      )
    );
    for (const item of converted) {
      body.append('file', item.file);
    }

    const response = await $fetch<{
      data?: {
        failed?: { filename: string; message: string }[];
      };
    }>('/api/admin/backgrounds', { method: 'POST', body });

    if (response.data?.failed?.length) {
      uploadWarnings.value = [
        ...uploadWarnings.value,
        ...response.data.failed.map((entry) => `${entry.filename}: ${entry.message}`),
      ];
    }

    clearSelectedFiles();
    await refresh();
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string; message?: string }; message?: string };
    uploadError.value =
      err?.data?.statusMessage ?? err?.data?.message ?? err?.message ?? 'Upload failed';
  } finally {
    uploading.value = false;
    uploadProgress.value = '';
  }
}

async function removeBackground(id: string) {
  if (!confirm('Delete this background? It will be removed from R2 and the random pool.')) return;
  try {
    await $fetch(`/api/admin/backgrounds/${id}`, { method: 'DELETE' });
    await refresh();
  } catch {
    alert('Failed to delete background');
  }
}
</script>
